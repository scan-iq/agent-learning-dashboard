#!/usr/bin/env node
/**
 * MCP Wrapper Generator CLI
 *
 * Generates TypeScript wrappers for MCP servers to enable programmatic
 * invocation without Claude's direct MCP context.
 *
 * Usage:
 *   npx tsx scripts/mcp/generate-wrappers.ts
 *   npx tsx scripts/mcp/generate-wrappers.ts --servers claude-flow ruv-swarm
 *   npx tsx scripts/mcp/generate-wrappers.ts --output ./my-servers
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface MCPServerConfig {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

interface GenerateOptions {
  servers?: string[];
  output?: string;
  force?: boolean;
  interactive?: boolean;
}

/**
 * Detect installed MCP servers from Claude config
 */
function detectMCPServers(): MCPServerConfig[] {
  const configPaths = [
    path.join(process.env.HOME || '', '.config/claude/mcp.json'),
    path.join(process.env.HOME || '', '.claude/mcp.json'),
    path.join(process.cwd(), '.claude/mcp.json'),
  ];

  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (config.mcpServers) {
        return Object.entries(config.mcpServers).map(([name, serverConfig]: [string, any]) => ({
          name,
          command: serverConfig.command,
          args: serverConfig.args,
          env: serverConfig.env,
        }));
      }
    }
  }

  return [];
}

/**
 * Introspect MCP server to get tool schemas
 */
async function introspectMCPServer(server: MCPServerConfig): Promise<MCPTool[]> {
  console.log(`🔍 Introspecting ${server.name}...`);

  try {
    // Launch MCP server and introspect
    const command = `${server.command} ${server.args?.join(' ') || ''}`;

    // For now, use known tool schemas
    // In production, this would connect to the MCP server and list tools
    const tools = await getMCPTools(server.name);

    console.log(`✅ Found ${tools.length} tools in ${server.name}`);
    return tools;
  } catch (error) {
    console.error(`❌ Failed to introspect ${server.name}:`, error);
    return [];
  }
}

/**
 * Get MCP tool schemas (hardcoded for now, would be dynamic in production)
 */
async function getMCPTools(serverName: string): Promise<MCPTool[]> {
  const knownTools: Record<string, MCPTool[]> = {
    'iris-prime': [
      {
        name: 'evaluateProject',
        description: 'Evaluate project against expert consensus',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'Project identifier' },
            expertId: { type: 'string', description: 'Expert signature ID' },
            version: { type: 'string', description: 'Project version' },
          },
          required: ['projectId'],
        },
      },
      {
        name: 'detectDrift',
        description: 'Detect drift between current and expert state',
        inputSchema: {
          type: 'object',
          properties: {
            expertId: { type: 'string', description: 'Expert signature ID' },
            version: { type: 'string', description: 'Current version' },
            threshold: { type: 'number', description: 'Drift threshold (0-1)' },
          },
          required: ['expertId', 'version'],
        },
      },
      {
        name: 'getConsensus',
        description: 'Get consensus lineage for a decision',
        inputSchema: {
          type: 'object',
          properties: {
            decisionId: { type: 'string', description: 'Decision identifier' },
            expertId: { type: 'string', description: 'Expert signature ID' },
          },
          required: ['decisionId'],
        },
      },
      {
        name: 'queryReflexions',
        description: 'Query reflexion monitoring data',
        inputSchema: {
          type: 'object',
          properties: {
            expertId: { type: 'string', description: 'Expert signature ID' },
            timeRange: { type: 'string', description: 'Time range (e.g., 24h, 7d)' },
          },
        },
      },
      {
        name: 'getMetrics',
        description: 'Get global performance metrics',
        inputSchema: {
          type: 'object',
          properties: {
            timeRange: { type: 'string', description: 'Time range (e.g., 24h, 7d)' },
          },
        },
      },
      {
        name: 'findPatterns',
        description: 'Discover patterns in project data',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'Project identifier' },
            minSupport: { type: 'number', description: 'Minimum support threshold' },
          },
        },
      },
    ],
    'supabase': [
      {
        name: 'query',
        description: 'Execute Supabase query',
        inputSchema: {
          type: 'object',
          properties: {
            table: { type: 'string', description: 'Table name' },
            filter: { type: 'object', description: 'Query filter' },
            select: { type: 'string', description: 'Columns to select' },
          },
          required: ['table'],
        },
      },
      {
        name: 'subscribe',
        description: 'Subscribe to real-time changes',
        inputSchema: {
          type: 'object',
          properties: {
            table: { type: 'string', description: 'Table name' },
            event: { type: 'string', description: 'Event type (INSERT, UPDATE, DELETE)' },
          },
          required: ['table', 'event'],
        },
      },
    ],
  };

  return knownTools[serverName] || [];
}

/**
 * Generate wrapper file for a single tool
 */
function generateToolWrapper(serverName: string, tool: MCPTool): string {
  const functionName = tool.name;
  const params = Object.entries(tool.inputSchema.properties || {})
    .map(([name, schema]: [string, any]) => {
      const optional = !tool.inputSchema.required?.includes(name);
      return `${name}${optional ? '?' : ''}: ${getTypeScriptType(schema)}`;
    })
    .join(', ');

  const paramNames = Object.keys(tool.inputSchema.properties || {});
  const paramObject = paramNames.length > 0
    ? `{ ${paramNames.join(', ')} }`
    : '{}';

  return `/**
 * ${tool.description}
 *
 * @generated from MCP server: ${serverName}
 */
export async function ${functionName}(${params}): Promise<any> {
  const { callMCPTool } = await import('./client');

  return await callMCPTool('${serverName}', '${tool.name}', ${paramObject});
}

/**
 * Format ${functionName} result for Claude context
 */
export function format${capitalize(functionName)}ForContext(result: any): string {
  return \`## ${tool.description}

\${JSON.stringify(result, null, 2)}

(loaded into model context)
\`;
}
`;
}

/**
 * Generate client wrapper
 */
function generateClientWrapper(serverName: string): string {
  return `/**
 * MCP Client for ${serverName}
 *
 * @generated
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

let client: Client | null = null;

/**
 * Initialize MCP client connection
 */
export async function startClient(): Promise<void> {
  if (client) return;

  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['${serverName}', 'mcp', 'start'],
  });

  client = new Client({
    name: '${serverName}-wrapper',
    version: '1.0.0',
  }, {
    capabilities: {},
  });

  await client.connect(transport);
}

/**
 * Shutdown MCP client
 */
export async function shutdownClient(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
  }
}

/**
 * Call MCP tool
 */
export async function callMCPTool(
  serverName: string,
  toolName: string,
  args: Record<string, any>
): Promise<any> {
  if (!client) {
    await startClient();
  }

  const result = await client!.callTool({
    name: toolName,
    arguments: args,
  });

  return result;
}
`;
}

/**
 * Generate index file
 */
function generateIndexFile(serverName: string, tools: MCPTool[]): string {
  const exports = tools.map(tool =>
    `export { ${tool.name}, format${capitalize(tool.name)}ForContext } from './${tool.name}';`
  ).join('\n');

  return `/**
 * ${serverName} MCP Wrapper
 *
 * Generated wrappers for programmatic MCP invocation.
 *
 * @example
 * \`\`\`typescript
 * import { evaluateProject } from './servers/${serverName}';
 *
 * const result = await evaluateProject('my-project-id');
 * console.log(result);
 * \`\`\`
 *
 * @generated
 */

export { startClient, shutdownClient, callMCPTool } from './client';

${exports}
`;
}

/**
 * Generate all wrappers for a server
 */
async function generateServerWrappers(
  server: MCPServerConfig,
  outputDir: string,
  force: boolean
): Promise<void> {
  const serverDir = path.join(outputDir, server.name);

  // Check if directory exists
  if (fs.existsSync(serverDir) && !force) {
    console.log(`⚠️  ${server.name} wrappers already exist. Use --force to overwrite.`);
    return;
  }

  // Create directory
  fs.mkdirSync(serverDir, { recursive: true });

  // Introspect server
  const tools = await introspectMCPServer(server);
  if (tools.length === 0) {
    console.log(`⚠️  No tools found for ${server.name}, skipping...`);
    return;
  }

  // Generate client
  const clientCode = generateClientWrapper(server.name);
  fs.writeFileSync(path.join(serverDir, 'client.ts'), clientCode);

  // Generate tool wrappers
  for (const tool of tools) {
    const wrapperCode = generateToolWrapper(server.name, tool);
    fs.writeFileSync(path.join(serverDir, `${tool.name}.ts`), wrapperCode);
  }

  // Generate index
  const indexCode = generateIndexFile(server.name, tools);
  fs.writeFileSync(path.join(serverDir, 'index.ts'), indexCode);

  console.log(`✅ Generated ${tools.length} wrappers for ${server.name}`);
}

/**
 * Generate README for servers directory
 */
function generateServersReadme(outputDir: string, servers: MCPServerConfig[]): void {
  const readme = `# Generated MCP Server Wrappers

This directory contains auto-generated TypeScript wrappers for MCP servers.

## Available Servers

${servers.map(s => `- **${s.name}**: ${s.command}`).join('\n')}

## Usage

\`\`\`typescript
import { evaluateProject } from './servers/iris-prime';

const result = await evaluateProject('my-project-id');
console.log(result);
\`\`\`

## Regenerating Wrappers

\`\`\`bash
npx tsx scripts/mcp/generate-wrappers.ts --force
\`\`\`

## Adding New Servers

Add servers to \`~/.claude/mcp.json\` and regenerate:

\`\`\`bash
claude mcp add my-server npx my-server mcp start
npx tsx scripts/mcp/generate-wrappers.ts
\`\`\`

---

Generated by IRIS MCP Wrapper Generator
`;

  fs.writeFileSync(path.join(outputDir, 'README.md'), readme);
}

/**
 * Helper functions
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getTypeScriptType(schema: any): string {
  switch (schema.type) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'object':
      return 'Record<string, any>';
    case 'array':
      return 'any[]';
    default:
      return 'any';
  }
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2);

  const options: GenerateOptions = {
    servers: [],
    output: './servers',
    force: false,
    interactive: true,
  };

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--servers' || args[i] === '-s') {
      options.servers = args[++i].split(',').map(s => s.trim());
    } else if (args[i] === '--output' || args[i] === '-o') {
      options.output = args[++i];
    } else if (args[i] === '--force') {
      options.force = true;
    }
  }

  console.log('🚀 IRIS MCP Wrapper Generator\n');

  // Detect servers
  const detectedServers = detectMCPServers();

  if (detectedServers.length === 0) {
    console.error('❌ No MCP servers found in Claude config.');
    console.log('\nAdd servers with:');
    console.log('  claude mcp add iris-prime npx iris-prime mcp start');
    process.exit(1);
  }

  console.log(`Found ${detectedServers.length} MCP servers:`);
  detectedServers.forEach(s => console.log(`  - ${s.name}`));
  console.log();

  // Filter servers if specified
  const serversToGenerate = options.servers && options.servers.length > 0
    ? detectedServers.filter(s => options.servers!.includes(s.name))
    : detectedServers;

  if (serversToGenerate.length === 0) {
    console.error('❌ No matching servers found.');
    process.exit(1);
  }

  // Generate wrappers
  console.log(`Generating wrappers in ${options.output}...\n`);

  for (const server of serversToGenerate) {
    await generateServerWrappers(server, options.output!, options.force!);
  }

  // Generate README
  generateServersReadme(options.output!, serversToGenerate);

  console.log('\n✨ Generation complete!');
  console.log(`\nWrappers available in: ${options.output}`);
  console.log('\nUsage:');
  console.log(`  import { evaluateProject } from '${options.output}/iris-prime';`);
  console.log(`  const result = await evaluateProject('project-id');`);
}

// Run CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

export { generateServerWrappers, detectMCPServers, introspectMCPServer };
