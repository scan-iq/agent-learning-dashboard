/**
 * MCP Wrapper Generation Demo
 *
 * This example shows how to use the MCP wrapper generator
 * to create programmatic wrappers for MCP servers.
 */

import { generateServerWrappers, detectMCPServers } from '../scripts/mcp/generate-wrappers';

async function demo() {
  console.log('🚀 MCP Wrapper Generator Demo\n');

  // 1. Detect available MCP servers
  console.log('Step 1: Detecting MCP servers...');
  const servers = detectMCPServers();

  if (servers.length === 0) {
    console.error('❌ No MCP servers found.');
    console.log('\nAdd servers with:');
    console.log('  claude mcp add iris-prime npx iris-prime mcp start');
    return;
  }

  console.log(`✅ Found ${servers.length} servers:`);
  servers.forEach(s => console.log(`   - ${s.name}`));
  console.log();

  // 2. Generate wrappers for first server
  const server = servers[0];
  console.log(`Step 2: Generating wrappers for ${server.name}...`);

  await generateServerWrappers(server, './servers-demo', true);

  console.log('✅ Wrappers generated!\n');

  // 3. Show usage example
  console.log('Step 3: Usage example:');
  console.log(`
import { evaluateProject } from './servers-demo/${server.name}';

const result = await evaluateProject('my-project-id');
console.log(result);
  `);

  console.log('\n✨ Demo complete!');
  console.log('\nNext steps:');
  console.log('  1. Check ./servers-demo/ for generated wrappers');
  console.log('  2. Import and use them in your code');
  console.log('  3. Run "npm run mcp:status" to verify integration');
}

// Run demo
demo().catch(error => {
  console.error('❌ Demo failed:', error);
  process.exit(1);
});
