/**
 * Templates for MCP Wrapper Generation
 *
 * Provides reusable templates for generating TypeScript wrappers
 * for different MCP server types.
 */

export interface WrapperTemplate {
  name: string;
  description: string;
  clientTemplate: (serverName: string) => string;
  toolTemplate: (serverName: string, toolName: string, toolSchema: any) => string;
  indexTemplate: (serverName: string, tools: string[]) => string;
}

/**
 * Standard MCP wrapper template
 */
export const standardTemplate: WrapperTemplate = {
  name: 'standard',
  description: 'Standard MCP wrapper with basic functionality',

  clientTemplate: (serverName: string) => `/**
 * MCP Client for ${serverName}
 *
 * @generated
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

let client: Client | null = null;

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

export async function shutdownClient(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
  }
}

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
`,

  toolTemplate: (serverName: string, toolName: string, toolSchema: any) => {
    const params = generateParameters(toolSchema);
    const paramObject = generateParameterObject(toolSchema);

    return `/**
 * ${toolSchema.description || toolName}
 *
 * @generated from MCP server: ${serverName}
 */
export async function ${toolName}(${params}): Promise<any> {
  const { callMCPTool } = await import('./client');

  return await callMCPTool('${serverName}', '${toolName}', ${paramObject});
}

/**
 * Format ${toolName} result for Claude context
 */
export function format${capitalize(toolName)}ForContext(result: any): string {
  return \`## ${toolSchema.description || toolName}

\${JSON.stringify(result, null, 2)}

(loaded into model context)
\`;
}
`;
  },

  indexTemplate: (serverName: string, tools: string[]) => {
    const exports = tools.map(tool =>
      `export { ${tool}, format${capitalize(tool)}ForContext } from './${tool}';`
    ).join('\n');

    return `/**
 * ${serverName} MCP Wrapper
 *
 * @generated
 */

export { startClient, shutdownClient, callMCPTool } from './client';

${exports}
`;
  },
};

/**
 * Enhanced template with caching and batching
 */
export const enhancedTemplate: WrapperTemplate = {
  name: 'enhanced',
  description: 'Enhanced wrapper with caching and batch operations',

  clientTemplate: (serverName: string) => `/**
 * Enhanced MCP Client for ${serverName}
 *
 * Features:
 * - Connection pooling
 * - Response caching
 * - Batch operations
 * - Retry logic
 *
 * @generated
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

let client: Client | null = null;
const cache = new Map<string, { result: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

export async function shutdownClient(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
  }
  cache.clear();
}

export async function callMCPTool(
  serverName: string,
  toolName: string,
  args: Record<string, any>,
  options: { cache?: boolean; retry?: number } = {}
): Promise<any> {
  const cacheKey = \`\${toolName}:\${JSON.stringify(args)}\`;

  // Check cache
  if (options.cache !== false) {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.result;
    }
  }

  if (!client) {
    await startClient();
  }

  // Retry logic
  const maxRetries = options.retry || 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await client!.callTool({
        name: toolName,
        arguments: args,
      });

      // Cache result
      if (options.cache !== false) {
        cache.set(cacheKey, { result, timestamp: Date.now() });
      }

      return result;
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

export async function batchCallMCPTools(
  calls: Array<{ toolName: string; args: Record<string, any> }>
): Promise<any[]> {
  if (!client) {
    await startClient();
  }

  return await Promise.all(
    calls.map(({ toolName, args }) => callMCPTool('${serverName}', toolName, args))
  );
}
`,

  toolTemplate: (serverName: string, toolName: string, toolSchema: any) => {
    const params = generateParameters(toolSchema);
    const paramObject = generateParameterObject(toolSchema);

    return `/**
 * ${toolSchema.description || toolName}
 *
 * @generated from MCP server: ${serverName}
 */
export async function ${toolName}(
  ${params},
  options?: { cache?: boolean; retry?: number }
): Promise<any> {
  const { callMCPTool } = await import('./client');

  return await callMCPTool('${serverName}', '${toolName}', ${paramObject}, options || {});
}

/**
 * Format ${toolName} result for Claude context
 */
export function format${capitalize(toolName)}ForContext(result: any): string {
  return \`## ${toolSchema.description || toolName}

\${JSON.stringify(result, null, 2)}

(loaded into model context)
\`;
}
`;
  },

  indexTemplate: (serverName: string, tools: string[]) => {
    const exports = tools.map(tool =>
      `export { ${tool}, format${capitalize(tool)}ForContext } from './${tool}';`
    ).join('\n');

    return `/**
 * ${serverName} MCP Wrapper (Enhanced)
 *
 * Features:
 * - Automatic caching
 * - Retry logic
 * - Batch operations
 *
 * @generated
 */

export { startClient, shutdownClient, callMCPTool, batchCallMCPTools } from './client';

${exports}
`;
  },
};

/**
 * Helper functions
 */
function generateParameters(toolSchema: any): string {
  const properties = toolSchema.inputSchema?.properties || {};
  const required = toolSchema.inputSchema?.required || [];

  return Object.entries(properties)
    .map(([name, schema]: [string, any]) => {
      const optional = !required.includes(name);
      return `${name}${optional ? '?' : ''}: ${getTypeScriptType(schema)}`;
    })
    .join(', ');
}

function generateParameterObject(toolSchema: any): string {
  const properties = toolSchema.inputSchema?.properties || {};
  const paramNames = Object.keys(properties);

  return paramNames.length > 0 ? `{ ${paramNames.join(', ')} }` : '{}';
}

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

export const templates = {
  standard: standardTemplate,
  enhanced: enhancedTemplate,
};
