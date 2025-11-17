# MCP Scripts

Scripts for generating and managing MCP server wrappers.

## Files

- **`cli.ts`** - Main CLI interface for MCP operations
- **`generate-wrappers.ts`** - Core wrapper generation logic
- **`wrapper-templates.ts`** - Templates for different wrapper styles

## Quick Commands

```bash
# List MCP servers
npm run mcp:list

# Check status
npm run mcp:status

# Generate wrappers
npm run generate:wrappers

# Generate with options
npm run iris generate wrappers -- --servers iris-prime --force

# Introspect server
npm run iris introspect iris-prime
```

## Development

### Adding New Templates

1. Edit `wrapper-templates.ts`
2. Add your template to the `templates` export
3. Test with `npm run iris generate wrappers -- --template your-template`

### Testing Generation

```bash
# Test with specific server
npm run iris generate wrappers -- --servers iris-prime --output ./test-output

# Verify generated files
ls -la ./test-output/iris-prime/
```

## Architecture

```
scripts/mcp/
├── cli.ts                    # CLI entry point
├── generate-wrappers.ts      # Core generation logic
├── wrapper-templates.ts      # Template definitions
└── README.md                 # This file

Generated output:
servers/
├── {server-name}/
│   ├── client.ts            # MCP client wrapper
│   ├── {tool}.ts           # Individual tool wrappers
│   └── index.ts            # Public exports
└── README.md               # Usage documentation
```

## Examples

See [MCP_WRAPPER_GENERATOR.md](/home/iris/code/experimental/iris-prime-console/docs/MCP_WRAPPER_GENERATOR.md) for complete usage examples.
