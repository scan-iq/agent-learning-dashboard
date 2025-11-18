# IRIS Prime - Dual Mode Architecture Analysis

## 🎯 Executive Summary

IRIS Prime has **TWO architectures** for telemetry:
1. **Direct Supabase Mode** - ✅ Fully implemented
2. **HTTP API Gateway Mode** - ⚠️ Partially implemented (API exists, clients don't use it)

## 🏗️ Architecture A: Direct Supabase Mode

### Current Implementation (WHAT WE'VE BEEN USING)

```
┌─────────────────────────────────────┐
│ Project (nfl-predictor-api)          │
│   - Has Supabase credentials         │
│   - Runs: iris discover --project .  │
└───────────────┬─────────────────────┘
                │
                ↓ agent-learning-core
┌───────────────▼─────────────────────┐
│ Direct Supabase Writes               │
│   - logTelemetry()                   │
│   - saveReflexion()                  │
│   - recordConsensusLineage()         │
└───────────────┬─────────────────────┘
                │
                ↓
┌───────────────▼─────────────────────┐
│ Supabase Tables                      │
│   - expert_signatures                │
│   - reflexion_bank                   │
│   - model_run_logs                   │
│   - consensus_lineage                │
└──────────────────────────────────────┘
```

**Requires:**
```bash
VITE_SUPABASE_URL=https://jvccmgcybmphebyvvnxo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...
```

**Pros:**
- ✅ Full agent-learning-core features
- ✅ AgentDB available
- ✅ No additional API needed

**Cons:**
- ❌ Every project needs Supabase credentials (5+ env vars)
- ❌ Security risk (credentials in every codebase)
- ❌ Harder to manage permissions

---

## 🏗️ Architecture B: HTTP API Gateway Mode

### Documented Architecture (PARTIALLY IMPLEMENTED)

```
┌─────────────────────────────────────┐
│ Project (nfl-predictor-api)          │
│   - Only has: IRIS_API_URL           │
│   - Only has: IRIS_API_KEY           │
└───────────────┬─────────────────────┘
                │
                ↓ HTTP POST
┌───────────────▼─────────────────────┐
│ iris-prime-api (API Gateway)         │
│   URL: iris-prime-7pclvmil2.         │
│        vercel.app                     │
│                                       │
│   Endpoints:                          │
│   - POST /api/iris/telemetry    ✅   │
│   - POST /api/iris/evaluate      ✅   │
│   - POST /api/iris/patterns      ✅   │
│   - POST /api/iris/retrain       ✅   │
│                                       │
│   Features:                           │
│   - Bearer token auth            ✅   │
│   - Rate limiting                ✅   │
│   - Request validation           ✅   │
└───────────────┬─────────────────────┘
                │
                ↓ agent-learning-core
┌───────────────▼─────────────────────┐
│ Supabase Tables (same as Mode A)     │
└──────────────────────────────────────┘
```

**Requires:**
```bash
IRIS_API_URL=https://iris-prime-7pclvmil2-legonow.vercel.app
IRIS_API_KEY=your-generated-key
```

**Pros:**
- ✅ Only 2 env vars instead of 5+
- ✅ No Supabase credentials in projects
- ✅ Centralized auth and rate limiting
- ✅ Universal (works in Node, browser, edge)
- ✅ Better security isolation

**Cons:**
- ❌ Requires API gateway deployment
- ❌ Additional network hop

---

## ⚠️ The Gap: iris discover Doesn't Support HTTP Mode!

### Current Code (`src/scripts/iris/iris-discover.ts`)

```typescript
class DiscoveryStorage {
  constructor(dbPath?: string) {
    this.agentDB = new AgentDBManager({ dbPath });
    this.useSupabase = isSupabaseInitialized();  // ← Only checks Supabase!
  }

  async storeDiscoveredExpert(expert: DiscoveredExpert) {
    // Mode A: Direct Supabase
    if (this.useSupabase) {
      await saveReflexion(...);  // Direct call
    }

    // Mode B: Local AgentDB only
    await this.agentDB.storeExpertEmbedding(...);

    // Mode C: HTTP API gateway
    // ❌ NOT IMPLEMENTED!
  }
}
```

### What's Missing

```typescript
// Should have this logic:
if (process.env.IRIS_API_URL && process.env.IRIS_API_KEY) {
  // HTTP API mode
  await fetch(`${process.env.IRIS_API_URL}/api/iris/telemetry`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.IRIS_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(telemetryData)
  });
} else if (isSupabaseInitialized()) {
  // Direct Supabase mode
  await logTelemetry(...);
} else {
  // Local-only mode
  // Just use AgentDB
}
```

---

## 📊 Implementation Status Matrix

| Component | Direct Supabase | HTTP API Gateway | Local-Only |
|-----------|----------------|------------------|------------|
| **iris-prime-api** | N/A | ✅ Deployed | N/A |
| **iris discover** | ✅ Working | ❌ **MISSING** | ✅ Working |
| **iris evaluate** | ✅ Working | ❌ **MISSING** | ✅ Working |
| **Code instrumenter** | ❌ Deprecated | ✅ Generates HTTP code | N/A |
| **iris-prime-console** | ✅ Reads Supabase | N/A | N/A |

---

## 🎯 Answer to Your Questions

### Q1: Why isn't IRIS Discover using HTTP API approach?
**A:** It's not implemented. The code only checks `isSupabaseInitialized()`, never checks for `IRIS_API_URL`.

### Q2: Should iris discover send data through Vercel API?
**A:** YES, that's the documented pattern! But it's missing from the implementation.

### Q3: Is HTTP-based telemetry integration missing?
**A:** Partially. The **receiving side** (iris-prime-api) exists. The **sending side** (iris discover/evaluate) is missing.

### Q4: Is there a config flag to switch modes?
**A:** NO - there should be environment variable detection, but it's not implemented.

---

## 🚀 What Needs To Be Done

### Priority 1: Add HTTP Mode to iris discover

```typescript
// In DiscoveryStorage class:
private mode: 'http' | 'supabase' | 'local-only';

constructor(dbPath?: string) {
  // Check HTTP API first (preferred for production)
  if (process.env.IRIS_API_URL && process.env.IRIS_API_KEY) {
    this.mode = 'http';
  } else if (isSupabaseInitialized()) {
    this.mode = 'supabase';
  } else {
    this.mode = 'local-only';
  }
}

async storeDiscoveredExpert(expert: DiscoveredExpert) {
  switch (this.mode) {
    case 'http':
      await this.sendViaHTTP(expert);
      break;
    case 'supabase':
      await saveReflexion(...);
      break;
    case 'local-only':
      // AgentDB only
      break;
  }
}

private async sendViaHTTP(expert: DiscoveredExpert) {
  await fetch(`${process.env.IRIS_API_URL}/api/iris/discovery`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.IRIS_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(expert)
  });
}
```

### Priority 2: Add /api/iris/discovery endpoint to iris-prime-api

Currently has telemetry, but not discovery endpoint.

### Priority 3: Update all iris tools consistently

- iris discover
- iris evaluate
- iris retrain
- iris patterns

All should support the three-tier fallback:
1. Try HTTP API (if IRIS_API_URL set)
2. Try direct Supabase (if Supabase credentials)
3. Fall back to local-only

---

## ✅ Current Recommended Approach (Until HTTP Mode Added)

**For your NFL predictor:**

```bash
# Option 1: Add Supabase credentials (direct mode)
cd nfl-predictor-api
cp ../iris-prime-console/.env .env  # Copy Supabase credentials
iris discover --project .

# Option 2: Use HTTP API manually
# (Write custom script to POST to iris-prime-api)

# Option 3: Run from iris-prime-console context
cd /home/iris/code/experimental/iris-prime-console
# Data already there, use dashboard buttons
```

---

**ANSWER TO YOUR QUESTION:**

You're absolutely correct - the HTTP API Gateway pattern is **documented but not fully implemented in the client tools**. The API gateway exists and works, but `iris discover` doesn't know how to use it yet. This is a missing feature that should be added to make the architecture consistent.

Want me to implement the HTTP mode in iris discover and other tools?