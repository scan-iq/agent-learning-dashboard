# IRIS Prime Commands

Commands for interacting with the IRIS (Intelligent Reflexion & Improvement System) Prime intelligence layer.

## Available Commands

- `/iris-evaluate` - Evaluate a single project's performance
- `/iris-evaluate-all` - Run cross-project evaluation across all experts
- `/iris-retrain` - Manually retrain a specific expert
- `/iris-auto-retrain` - Automatically retrain experts showing drift
- `/iris-patterns` - Discover and analyze transferable patterns
- `/iris-health` - Check overall system health and metrics
- `/iris-report` - Generate comprehensive IRIS intelligence report
- `/iris-experts` - List and analyze all expert models
- `/iris-transfer` - Transfer learning between experts
- `/iris-drift` - Detect and analyze performance drift

## Quick Start

```bash
# Check system health
/iris-health

# Evaluate current project
/iris-evaluate

# Auto-retrain drifting experts
/iris-auto-retrain
```

## Core Concepts

**IRIS Prime** is a self-improving intelligence system that:
- Learns from every interaction across all projects
- Maintains expert models per project/domain
- Detects performance drift and auto-retrains
- Discovers and transfers patterns between contexts
- Provides consensus-based decision making

## Integration

All IRIS commands integrate with:
- Supabase for persistence
- AgentDB for vector storage
- Reflexion monitoring for continuous learning
- Consensus tracking for decision quality
- Pattern discovery for knowledge transfer
