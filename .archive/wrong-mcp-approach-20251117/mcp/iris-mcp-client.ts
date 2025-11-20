/**
 * Programmatic MCP client for IRIS
 *
 * Calls IRIS MCP server and returns results to feed into model context.
 * This keeps heavy operations OUT of Claude's direct MCP context.
 *
 * Pattern: Call MCP server via code, format results, feed back as text
 * Similar to gdrive.getDocument() and salesforce.updateRecord() pattern
 */

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import * as readline from 'readline';

export interface MCPRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: any;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: number | string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface MCPToolCall {
  name: string;
  arguments: Record<string, any>;
}

export interface EvaluationResult {
  projectId: string;
  healthScore: number;
  metrics: {
    accuracy: number;
    performance: number;
    reliability: number;
  };
  recommendations: string[];
  timestamp: string;
}

export interface DriftAlert {
  expertId: string;
  version: string;
  driftScore: number;
  affectedMetrics: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

export class IrisMCPClient extends EventEmitter {
  private serverProcess: ChildProcess | null = null;
  private requestId = 0;
  private pendingRequests = new Map<number | string, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }>();
  private connected = false;
  private rl: readline.Interface | null = null;

  /**
   * Start the IRIS MCP server as a child process
   * Connects via stdio for JSON-RPC 2.0 communication
   */
  async start(serverCommand?: string): Promise<void> {
    if (this.serverProcess) {
      throw new Error('MCP server already started');
    }

    // Default to iris-prime MCP server
    const cmd = serverCommand || 'npx';
    const args = serverCommand ? [] : ['iris-prime', 'mcp', 'start'];

    return new Promise((resolve, reject) => {
      this.serverProcess = spawn(cmd, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env }
      });

      // Handle stderr for logging
      this.serverProcess.stderr?.on('data', (data) => {
        this.emit('log', `MCP Server: ${data.toString()}`);
      });

      // Set up readline for JSON-RPC responses
      this.rl = readline.createInterface({
        input: this.serverProcess.stdout!,
        crlfDelay: Infinity
      });

      this.rl.on('line', (line) => {
        try {
          const response: MCPResponse = JSON.parse(line);
          this.handleResponse(response);
        } catch (error) {
          this.emit('error', new Error(`Failed to parse MCP response: ${error}`));
        }
      });

      this.serverProcess.on('error', (error) => {
        this.emit('error', error);
        reject(error);
      });

      this.serverProcess.on('exit', (code) => {
        this.connected = false;
        this.emit('exit', code);
      });

      // Initialize connection
      this.initialize()
        .then(() => {
          this.connected = true;
          this.emit('connected');
          resolve();
        })
        .catch(reject);
    });
  }

  /**
   * Initialize MCP connection with handshake
   */
  private async initialize(): Promise<void> {
    const response = await this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {}
      },
      clientInfo: {
        name: 'iris-prime-mcp-client',
        version: '1.0.0'
      }
    });

    if (!response.result) {
      throw new Error('MCP initialization failed');
    }

    // Send initialized notification
    await this.sendNotification('notifications/initialized');
  }

  /**
   * Send a JSON-RPC request to the MCP server
   */
  private sendRequest(method: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId;

      const request: MCPRequest = {
        jsonrpc: '2.0',
        id,
        method,
        params
      };

      this.pendingRequests.set(id, { resolve, reject });

      const message = JSON.stringify(request) + '\n';

      if (!this.serverProcess?.stdin?.writable) {
        reject(new Error('MCP server not connected'));
        return;
      }

      this.serverProcess.stdin.write(message, (error) => {
        if (error) {
          this.pendingRequests.delete(id);
          reject(error);
        }
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request ${id} timed out`));
        }
      }, 30000);
    });
  }

  /**
   * Send a JSON-RPC notification (no response expected)
   */
  private async sendNotification(method: string, params?: any): Promise<void> {
    const notification = {
      jsonrpc: '2.0',
      method,
      params
    };

    const message = JSON.stringify(notification) + '\n';

    if (!this.serverProcess?.stdin?.writable) {
      throw new Error('MCP server not connected');
    }

    return new Promise((resolve, reject) => {
      this.serverProcess!.stdin!.write(message, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  /**
   * Handle JSON-RPC response from server
   */
  private handleResponse(response: MCPResponse): void {
    const pending = this.pendingRequests.get(response.id);

    if (!pending) {
      this.emit('error', new Error(`Received response for unknown request ${response.id}`));
      return;
    }

    this.pendingRequests.delete(response.id);

    if (response.error) {
      pending.reject(new Error(`MCP Error: ${response.error.message}`));
    } else {
      pending.resolve(response.result);
    }
  }

  /**
   * Call an MCP tool by name
   */
  async callTool(toolName: string, args: Record<string, any>): Promise<any> {
    if (!this.connected) {
      throw new Error('MCP client not connected. Call start() first.');
    }

    const response = await this.sendRequest('tools/call', {
      name: toolName,
      arguments: args
    });

    return response.content?.[0]?.text || response;
  }

  /**
   * List available MCP tools
   */
  async listTools(): Promise<any[]> {
    if (!this.connected) {
      throw new Error('MCP client not connected. Call start() first.');
    }

    const response = await this.sendRequest('tools/list');
    return response.tools || [];
  }

  // ============================================
  // IRIS Convenience Methods
  // ============================================

  /**
   * Evaluate a project and get health metrics
   * Returns formatted data ready for Claude's context
   */
  async evaluateProject(projectId: string): Promise<EvaluationResult> {
    const result = await this.callTool('iris_evaluate_project', { projectId });

    // Parse and structure the response
    return {
      projectId,
      healthScore: result.healthScore || 0,
      metrics: result.metrics || {
        accuracy: 0,
        performance: 0,
        reliability: 0
      },
      recommendations: result.recommendations || [],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Detect drift in an expert model
   */
  async detectDrift(expertId: string, version: string): Promise<DriftAlert> {
    const result = await this.callTool('iris_detect_drift', { expertId, version });

    return {
      expertId,
      version,
      driftScore: result.driftScore || 0,
      affectedMetrics: result.affectedMetrics || [],
      severity: result.severity || 'low',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get consensus lineage for a decision
   */
  async getConsensusLineage(consensusId: string): Promise<any> {
    return this.callTool('iris_get_lineage', { consensusId });
  }

  /**
   * Query reflexion patterns
   */
  async queryReflexions(filters: Record<string, any>): Promise<any> {
    return this.callTool('iris_query_reflexions', filters);
  }

  /**
   * Get global metrics for the system
   */
  async getGlobalMetrics(timeRange?: string): Promise<any> {
    return this.callTool('iris_get_metrics', { timeRange: timeRange || '24h' });
  }

  /**
   * Discover patterns in the data
   */
  async discoverPatterns(analysisType: string): Promise<any> {
    return this.callTool('iris_discover_patterns', { analysisType });
  }

  /**
   * Get expert signatures
   */
  async getExpertSignatures(expertId: string): Promise<any> {
    return this.callTool('iris_get_signatures', { expertId });
  }

  /**
   * Submit telemetry data
   */
  async submitTelemetry(event: Record<string, any>): Promise<any> {
    return this.callTool('iris_submit_telemetry', event);
  }

  /**
   * Shutdown the MCP server gracefully
   */
  async shutdown(): Promise<void> {
    if (!this.serverProcess) {
      return;
    }

    this.rl?.close();
    this.serverProcess.stdin?.end();

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.serverProcess?.kill('SIGKILL');
        resolve();
      }, 5000);

      this.serverProcess?.once('exit', () => {
        clearTimeout(timeout);
        this.serverProcess = null;
        this.connected = false;
        resolve();
      });

      this.serverProcess?.kill('SIGTERM');
    });
  }
}
