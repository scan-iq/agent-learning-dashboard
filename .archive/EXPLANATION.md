# Archive Explanation

**Date**: 2025-11-17
**Reason**: Incorrect MCP pattern implementation

---

## Why These Files Were Archived

These files were created following an **incorrect understanding** of how MCP servers should be used with Claude Code.

### ❌ What Was Wrong

**We built**: MCP client code in the frontend (`src/mcp/iris-mcp-client.ts`)

**Why it's wrong**:
1. Frontends (browsers) **cannot run MCP servers** (they use Node.js `child_process`)
2. MCP is for **server-side** communication via stdio
3. Violates Anthropic's pattern: MCP should be called by code in sandboxes, not from browsers

### ✅ Correct Pattern (Per Anthropic)

**MCP Server**: Only in `agent-learning-core/src/mcp/iris-prime-mcp-server.ts`

**Frontend (iris-prime-console)**: Uses `servers/iris-prime/` with **REST API wrappers**
```typescript
// servers/iris-prime/evaluateProject.ts
export async function evaluateProject(args) {
  const res = await fetch(`${API_BASE}/api/iris/evaluate/${args.projectId}`);
  return await res.json();
}
```

**Backend (iris-prime-api)**: Either:
- Option A: Use `@foxruv/agent-learning-core` library directly
- Option B: Generate MCP wrappers using generator

---

## What Was Archived

### `src/mcp/` (4 files)
- `iris-mcp-client.ts` - MCP client using child_process (Node.js only)
- `load-to-context.ts` - Formatters (good idea, wrong location)
- `index.ts` - Exports
- `README.md` - Documentation

**Why archived**: Browsers can't spawn child processes or use stdio

### `examples/mcp-wrapper-demo.ts`
- Example of programmatic MCP calls
- Good concept, wrong environment (frontend can't do this)

---

## What Replaced These

**servers/iris-prime/** (REST wrappers)
- Uses native `fetch()` API (browser-compatible)
- Calls iris-prime-api backend
- Same TypeScript API surface
- Correct for frontend environment

---

## Could These Be Useful Later?

**Maybe for backend projects**:
- The MCP client pattern is correct for Node.js environments
- Could be useful in iris-prime-api or other backend services
- The formatters (`load-to-context.ts`) have good ideas

**But for frontends**: Always use REST/HTTP, never MCP stdio

---

## Lesson Learned

**MCP is for server-side code execution, not for browsers.**

Frontends should:
- ✅ Call REST APIs
- ✅ Use WebSockets for real-time
- ✅ Use GraphQL if needed
- ❌ NOT call MCP servers directly

**The correct architecture:**
```
Frontend (Browser) → REST API → Backend (Node.js) → MCP Server → Data
```

NOT:
```
Frontend (Browser) → MCP Server ❌ (can't work)
```

---

**These files are preserved here for reference but should NOT be used in the frontend.**
