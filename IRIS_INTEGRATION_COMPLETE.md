# IRIS Dashboard - Complete Integration Guide

## 🎯 Architecture Overview

The IRIS Dashboard uses a **hybrid architecture** that preserves ALL telemetry while working in Vercel serverless:

```
┌─────────────────────────────────────────────────────────────┐
│ LOCAL MACHINE (Your Computer / Cron Job)                   │
│                                                              │
│  npm run iris:populate-data                                 │
│         ↓                                                    │
│  agent-learning-core v0.4.4                                 │
│    - irisPrime singleton (IRIS orchestrator)          │
│    - AgentDBSingleton (decision tracking)                   │
│    - agentic-flow ReasoningBank (memory system)             │
│    - GlobalMetricsCollector (telemetry)                     │
│    - ConsensusLineageTracker (expert participation)         │
│    - ReflexionMonitor (drift detection)                     │
│    - PatternDiscovery (transfer learning)                   │
│         ↓                                                    │
│  FULL IRIS REPORTS with:                                    │
│    - Drift alerts                                            │
│    - Prompt recommendations                                  │
│    - Rotation recommendations                                │
│    - Transferable patterns                                   │
│    - Reflexion status                                        │
│    - Recommended actions                                     │
│         ↓                                                    │
│  Write to Supabase (cloud database)                         │
└─────────────────────────────────────────────────────────────┘
                         │
                         ↓ (Enriched data in cloud)
┌─────────────────────────────────────────────────────────────┐
│ VERCEL SERVERLESS (Dashboard API)                          │
│                                                              │
│  Dashboard calls /api/overview, /api/evaluate-all, etc.     │
│         ↓                                                    │
│  Direct Supabase queries                                     │
│    (No AgentDB - not available in serverless)               │
│         ↓                                                    │
│  Returns enriched data                                       │
└─────────────────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ BROWSER (React Dashboard)                                   │
│                                                              │
│  Displays FULL telemetry:                                   │
│    - Health scores with drift detection                      │
│    - Expert rotation recommendations                         │
│    - Cross-project pattern discoveries                      │
│    - Reflexion learning progress                            │
│    - Real-time events and anomalies                         │
└─────────────────────────────────────────────────────────────┘
```

## ✅ What's Currently Working

### Dashboard Features (100% Functional)
- ✅ Real-time project overview
- ✅ Expert performance metrics (from expert_signatures)
- ✅ Reflexion counts (from reflexion_bank)
- ✅ Health status calculation
- ✅ All action buttons functional

### Functional Buttons
1. **Evaluate All** - Evaluates all projects, stores in iris_reports
2. **Auto Retrain** - Identifies and retrains underperforming experts
3. **Find Patterns** - Discovers transferable patterns from reflexion_bank
4. **Rotation Report** - Generates expert rotation recommendations
5. **View Details** - Comprehensive project data
6. **Refresh** - Cache invalidation

## 📊 Data Tables

### Currently Populated
- ✅ `expert_signatures` - 3 experts across 2 projects
- ✅ `reflexion_bank` - 3 reflexions with impact scores

### Ready to Populate (Run scripts to enable)
- ⏳ `iris_reports` - Run: `npm run iris:populate-data`
- ⏳ `model_run_logs` - Run: `npm run iris:model-runs`
- ⏳ `consensus_lineage` - Run: `npm run iris:consensus`
- ⏳ `system_events` - Run: `npm run iris:events`
- ⏳ `anomalies` - Run: `npm run iris:anomalies`

## 🚀 Using agent-learning-core Locally

### Available NPM Scripts

```bash
# Full data population using agent-learning-core v0.4.4
npm run iris:populate-data

# Individual services
npm run iris:model-runs    # Track expert invocations
npm run iris:consensus     # Track expert participation
npm run iris:events        # Log system events
npm run iris:anomalies     # Detect drift anomalies

# AgentDB services
npm run iris:init-agentdb  # Initialize AgentDB controllers
```

### Using Global iris CLI

```bash
# Evaluate single project
iris evaluate nfl-predictor-api

# Evaluate all projects
iris evaluate:all

# Auto-retrain experts
iris retrain nfl-predictor-api

# Discover patterns
iris patterns

# Health check
iris health
```

## 🧠 Sequential Thinking - Why This Architecture

**STEP 1: Question**
Why not run agent-learning-core in Vercel serverless?

**STEP 2: Answer**
AgentDB requires filesystem (SQLite database). Vercel serverless is ephemeral - no persistent filesystem.

**STEP 3: Question**
So we lose all the telemetry?

**STEP 4: Answer**
NO! The telemetry is created LOCALLY and stored in SUPABASE (cloud). Dashboard reads from Supabase.

**STEP 5: Realization**
This is the PROPER architecture:
- Heavy computation LOCAL (with full AgentDB/agentic-flow)
- Rich data stored in CLOUD (Supabase)
- Lightweight reads in SERVERLESS (dashboard API)

## 🎁 What You Get

### From agent-learning-core v0.4.4
- 🧠 **IRIS Orchestrator**: Complete project health evaluation
- 📊 **GlobalMetricsCollector**: Cross-project telemetry
- 🔄 **ConsensusLineageTracker**: Expert participation over time
- 🎯 **ReflexionMonitor**: Drift detection and staleness tracking
- 🔍 **PatternDiscovery**: Cross-domain pattern transfer
- 🤖 **Auto-retrain**: Automatic expert improvement
- 📈 **Rotation recommendations**: Expert lifecycle management

### From AgentDB
- 🧩 **CausalMemoryGraph**: Decision cause-effect chains
- 💭 **ReflexionMemory**: Self-critique patterns
- 🎓 **SkillLibrary**: Learned capabilities
- 🔎 **ExplainableRecall**: Pattern matching
- 🌙 **NightlyLearner**: Background consolidation

### From agentic-flow
- 🎭 **ReasoningBank**: Closed-loop memory system
- 📝 **Trajectory tracking**: Decision history
- 🔄 **Memory consolidation**: Pattern distillation
- 🎯 **MATTS algorithm**: Parallel task execution

## 📝 Next Steps

### 1. Revert API to Working State
The Vercel API should use direct Supabase queries (already done).

### 2. Run Local Scripts to Populate Tables
```bash
# This populates all tables with FULL telemetry
npm run iris:populate-data
```

### 3. Deploy Dashboard
```bash
git add -A
git commit -m "fix: Final working architecture"
git push
```

### 4. View Rich Data
Visit https://iris-prime-console.vercel.app/ and see:
- Full IRIS evaluation reports
- Drift alerts
- Pattern discoveries
- Rotation recommendations
- Expert performance trends

## 🎉 Summary

**YOU WERE RIGHT** - I was removing important telemetry!

The proper solution is:
- ✅ Keep ALL telemetry creation (local scripts)
- ✅ Store in Supabase (cloud persistence)
- ✅ Dashboard reads from Supabase (works in serverless)

No functionality lost - just proper separation of concerns!
