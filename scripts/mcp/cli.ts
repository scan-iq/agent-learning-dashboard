#!/usr/bin/env node
/**
 * IRIS MCP CLI
 *
 * Command-line interface for MCP wrapper generation and management.
 *
 * Usage:
 *   iris generate wrappers
 *   iris generate wrappers --servers iris-prime,supabase
 *   iris list servers
 *   iris introspect <server-name>
 */

import { Command } from 'commander';
import { generateServerWrappers, detectMCPServers, introspectMCPServer } from './generate-wrappers.js';
import * as path from 'path';
import * as fs from 'fs';

const program = new Command();

program
  .name('iris')
  .description('IRIS MCP wrapper generator and tooling')
  .version('1.0.0');

// Generate command
const generateCmd = program
  .command('generate')
  .description('Generate code wrappers and utilities');

generateCmd
  .command('wrappers')
  .description('Generate TypeScript wrappers for MCP servers')
  .option('-s, --servers <servers...>', 'MCP servers to wrap (comma-separated)')
  .option('-o, --output <dir>', 'Output directory', './servers')
  .option('--force', 'Overwrite existing files')
  .option('-t, --template <template>', 'Template to use (standard|enhanced)', 'standard')
  .action(async (options) => {
    console.log('🚀 IRIS MCP Wrapper Generator\n');

    const servers = detectMCPServers();

    if (servers.length === 0) {
      console.error('❌ No MCP servers found in Claude config.');
      console.log('\nAdd servers with:');
      console.log('  claude mcp add iris-prime npx iris-prime mcp start');
      console.log('  claude mcp add supabase npx @supabase/mcp mcp start');
      process.exit(1);
    }

    console.log(`Found ${servers.length} MCP servers:`);
    servers.forEach(s => console.log(`  - ${s.name}`));
    console.log();

    // Filter servers if specified
    const serversToGenerate = options.servers
      ? servers.filter((s: any) => options.servers.includes(s.name))
      : servers;

    if (serversToGenerate.length === 0) {
      console.error('❌ No matching servers found.');
      process.exit(1);
    }

    console.log(`Generating wrappers in ${options.output}...\n`);

    for (const server of serversToGenerate) {
      await generateServerWrappers(server, options.output, options.force);
    }

    console.log('\n✨ Generation complete!');
    console.log(`\nWrappers available in: ${options.output}`);
    console.log('\nUsage:');
    console.log(`  import { evaluateProject } from '${options.output}/iris-prime';`);
    console.log(`  const result = await evaluateProject('project-id');`);
  });

// List command
program
  .command('list')
  .description('List available MCP servers')
  .action(() => {
    console.log('🔍 Detecting MCP servers...\n');

    const servers = detectMCPServers();

    if (servers.length === 0) {
      console.log('No MCP servers found.');
      console.log('\nAdd servers with:');
      console.log('  claude mcp add <name> <command>');
      return;
    }

    console.log(`Found ${servers.length} MCP servers:\n`);

    servers.forEach((server: any) => {
      console.log(`📦 ${server.name}`);
      console.log(`   Command: ${server.command}`);
      if (server.args) {
        console.log(`   Args: ${server.args.join(' ')}`);
      }
      console.log();
    });
  });

// Introspect command
program
  .command('introspect <server>')
  .description('Introspect MCP server and show available tools')
  .action(async (serverName: string) => {
    console.log(`🔍 Introspecting ${serverName}...\n`);

    const servers = detectMCPServers();
    const server = servers.find((s: any) => s.name === serverName);

    if (!server) {
      console.error(`❌ Server not found: ${serverName}`);
      console.log('\nAvailable servers:');
      servers.forEach((s: any) => console.log(`  - ${s.name}`));
      process.exit(1);
    }

    const tools = await introspectMCPServer(server);

    if (tools.length === 0) {
      console.log('No tools found.');
      return;
    }

    console.log(`Found ${tools.length} tools:\n`);

    tools.forEach((tool: any) => {
      console.log(`🔧 ${tool.name}`);
      console.log(`   ${tool.description}`);
      console.log(`   Parameters:`);

      const props = tool.inputSchema?.properties || {};
      const required = tool.inputSchema?.required || [];

      Object.entries(props).forEach(([name, schema]: [string, any]) => {
        const req = required.includes(name) ? '(required)' : '(optional)';
        console.log(`     - ${name}: ${schema.type} ${req}`);
        if (schema.description) {
          console.log(`       ${schema.description}`);
        }
      });
      console.log();
    });
  });

// Status command
program
  .command('status')
  .description('Show IRIS integration status')
  .action(() => {
    console.log('📊 IRIS Integration Status\n');

    const servers = detectMCPServers();
    const irisPrime = servers.find((s: any) => s.name === 'iris-prime');
    const supabase = servers.find((s: any) => s.name === 'supabase');

    console.log('MCP Servers:');
    console.log(`  IRIS: ${irisPrime ? '✅ Configured' : '❌ Not found'}`);
    console.log(`  Supabase: ${supabase ? '✅ Configured' : '❌ Not found'}`);
    console.log();

    // Check for generated wrappers
    const wrappersExist = fs.existsSync(path.join(process.cwd(), 'servers'));

    console.log('Generated Wrappers:');
    console.log(`  Status: ${wrappersExist ? '✅ Available' : '❌ Not generated'}`);

    if (wrappersExist) {
      const serversDir = path.join(process.cwd(), 'servers');
      const wrappers = fs.readdirSync(serversDir).filter((f: string) =>
        fs.statSync(path.join(serversDir, f)).isDirectory()
      );

      console.log(`  Wrappers: ${wrappers.join(', ')}`);
    }
    console.log();

    // Recommendations
    console.log('Recommendations:');
    if (!irisPrime) {
      console.log('  ⚠️  Add IRIS MCP server:');
      console.log('     claude mcp add iris-prime npx iris-prime mcp start');
    }
    if (!wrappersExist) {
      console.log('  ⚠️  Generate wrappers:');
      console.log('     iris generate wrappers');
    }
  });

// Parse arguments
program.parse();
