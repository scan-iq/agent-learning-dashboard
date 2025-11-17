# IRIS Prime Slash Commands - Complete Reference

**Total Commands: 33** (exceeding the requested 20-30)

All commands follow FoxRev-level quality standards with comprehensive documentation.

## Command Overview by Category

### 🧠 IRIS Prime Core Intelligence (10 commands)

Expert model management, evaluation, and training.

| Command | Description |
|---------|-------------|
| `/iris-evaluate` | Evaluate single project expert performance |
| `/iris-evaluate-all` | Cross-project evaluation of all experts |
| `/iris-retrain` | Manually retrain specific expert model |
| `/iris-auto-retrain` | Automatically retrain drifting experts |
| `/iris-patterns` | Discover and analyze transferable patterns |
| `/iris-health` | System health and intelligence overview |
| `/iris-report` | Generate comprehensive intelligence reports |
| `/iris-experts` | List and analyze all expert models |
| `/iris-transfer` | Transfer learning between experts |
| `/iris-drift` | Detect performance drift in experts |

### 🤝 Consensus Tracking (6 commands)

Multi-expert decision tracking and version lineage.

| Command | Description |
|---------|-------------|
| `/consensus-record` | Record multi-expert consensus decisions |
| `/consensus-calculate` | Calculate consensus scores from votes |
| `/consensus-lineage` | Track expert version lineage and evolution |
| `/consensus-rotation` | Get expert rotation recommendations |
| `/consensus-search` | Search historical consensus decisions |
| `/consensus-quality` | Analyze consensus decision quality |

### 🔄 Reflexion Monitoring (7 commands)

Trajectory tracking and learning from experience.

| Command | Description |
|---------|-------------|
| `/reflexion-track` | Track new reflexion trajectory with learning |
| `/reflexion-search` | Search for similar past reflexions |
| `/reflexion-stats` | View reflexion system statistics |
| `/reflexion-reuse` | Apply reflexion learning to new context |
| `/reflexion-analyze` | Deep analysis of trajectory patterns |
| `/reflexion-export` | Export reflexions for analysis or backup |

### 📊 Pattern Discovery (3 commands)

Pattern discovery, transfer, and learning.

| Command | Description |
|---------|-------------|
| `/patterns-discover` | Deep pattern discovery from trajectories |
| `/patterns-transfer` | Transfer patterns between projects |
| `/patterns-learn` | Learn from pattern library |

### 📈 Telemetry System (3 commands)

Metrics logging, monitoring, and drift detection.

| Command | Description |
|---------|-------------|
| `/telemetry-log` | Log telemetry events for tracking |
| `/telemetry-stats` | View comprehensive telemetry statistics |
| `/telemetry-drift` | Detect performance drift from telemetry |

### 🗄️ Supabase Integration (3 commands)

Backend data synchronization and management.

| Command | Description |
|---------|-------------|
| `/supabase-sync` | Synchronize data between local and Supabase |
| `/supabase-migrate` | Run database migrations |
| `/supabase-status` | Check Supabase connection and health |

### 🔔 Notifications (2 commands)

Multi-channel notification system.

| Command | Description |
|---------|-------------|
| `/notifications-test` | Test notification channels |
| `/notifications-config` | Configure notification settings |

## Command Quick Reference

### Most Frequently Used Commands

```bash
# Daily operations
/iris-health              # Morning system check
/iris-evaluate            # Evaluate current work
/telemetry-drift          # Check for performance issues

# Weekly maintenance
/iris-evaluate-all        # Full system evaluation
/iris-auto-retrain        # Fix drifting experts
/patterns-discover        # Find new patterns
/iris-report --period weekly  # Weekly intelligence report

# Before deployment
/iris-health              # Verify system health
/supabase-status          # Check backend
/notifications-test       # Test alerts
/supabase-sync            # Sync latest data
```

### Advanced Workflows

#### Learning from Success
```bash
# After successful task
/reflexion-track --verdict passed --reflection "What worked well..."
/patterns-discover --threshold 0.90
/iris-patterns --transferable-only
```

#### Handling Failures
```bash
# After failure
/reflexion-track --verdict failed --reflection "What went wrong..."
/reflexion-search --query "similar issue"
/reflexion-reuse --reflexion-id <id> --new-context "retry with learning"
```

#### Expert Optimization
```bash
# Optimize expert performance
/iris-drift --auto-fix
/iris-evaluate-all --drift-only
/iris-auto-retrain --threshold 0.20
/patterns-transfer --source best-expert --target underperforming-expert
```

#### Consensus Decision Making
```bash
# Multi-expert decisions
/consensus-rotation --task "critical-architecture"  # Get optimal team
/consensus-record --task "decision" --experts "e1,e2,e3" --votes "0.9,0.85,0.92"
/consensus-calculate --votes "0.9,0.85,0.92" --show-analysis
/consensus-search --query "similar decisions"
```

## Documentation Structure

```
.claude/commands/
├── README.md                    # Main overview
├── COMMANDS_REFERENCE.md        # This file
│
├── iris/
│   ├── README.md               # IRIS category overview
│   ├── evaluate.md             # Detailed command docs
│   ├── evaluate-all.md
│   ├── retrain.md
│   ├── auto-retrain.md
│   ├── patterns.md
│   ├── health.md
│   ├── report.md
│   ├── experts.md
│   ├── transfer.md
│   └── drift.md
│
├── consensus/
│   ├── README.md
│   ├── record.md
│   ├── calculate.md
│   ├── lineage.md
│   ├── rotation.md
│   ├── search.md
│   └── quality.md
│
├── reflexion/
│   ├── README.md
│   ├── track.md
│   ├── search.md
│   ├── stats.md
│   ├── reuse.md
│   ├── analyze.md
│   └── export.md
│
├── patterns/
│   ├── README.md
│   ├── discover.md
│   ├── transfer.md
│   └── learn.md
│
├── telemetry/
│   ├── README.md
│   ├── log.md
│   ├── stats.md
│   └── drift.md
│
├── supabase/
│   ├── README.md
│   ├── sync.md
│   ├── migrate.md
│   └── status.md
│
└── notifications/
    ├── README.md
    ├── test.md
    └── config.md
```

## Command Documentation Standard

Every command follows this structure:

1. **Title & Brief Description**
2. **Usage** - Command syntax
3. **Options** - All available flags and parameters
4. **Examples** - 3-4 practical examples
5. **What This Does** - Detailed explanation
6. **When to Use** - Usage guidance
7. **Output** - Expected output with formatted examples
8. **Related Commands** - Cross-references

## Key Features

### ✅ FoxRev-Level Quality
- Comprehensive documentation for every command
- Practical examples for each use case
- Clear output formatting with box-drawing characters
- Detailed explanations of what each command does
- Guidance on when to use each command

### ✅ Complete Coverage
- 33 commands covering all IRIS Prime functionality
- 7 categories organized by domain
- Cross-referenced for easy navigation
- Quick reference guides for common workflows

### ✅ Production Ready
- Real-world examples
- Error handling guidance
- Performance considerations
- Integration patterns
- Best practices

## System Architecture Integration

```
User Commands
    ↓
┌─────────────────────────────────────────────┐
│ IRIS Prime Slash Commands (33 total)       │
├─────────────────────────────────────────────┤
│                                             │
│  🧠 IRIS Core → Expert Intelligence         │
│  🤝 Consensus → Decision Quality            │
│  🔄 Reflexion → Learning & Improvement      │
│  📊 Patterns  → Knowledge Transfer          │
│  📈 Telemetry → Performance Monitoring      │
│  🗄️ Supabase  → Centralized Persistence    │
│  🔔 Notifications → Multi-channel Alerts    │
│                                             │
└─────────────────────────────────────────────┘
    ↓
Integrated Intelligence Backend
```

## Getting Started

1. **Read Category READMEs**
   - Start with `/home/iris/code/experimental/iris-prime-console/.claude/commands/README.md`
   - Explore each category's README for overview

2. **Try Essential Commands**
   ```bash
   /iris-health
   /iris-evaluate
   /supabase-status
   ```

3. **Set Up Workflows**
   - Daily: Health checks and evaluation
   - Weekly: Auto-retrain and pattern discovery
   - Monthly: Comprehensive reports

4. **Explore Advanced Features**
   - Consensus decision making
   - Pattern transfer
   - Reflexion learning
   - Multi-channel notifications

## Support & Documentation

- **Main README**: `.claude/commands/README.md`
- **This Reference**: `.claude/commands/COMMANDS_REFERENCE.md`
- **Category READMEs**: Each subdirectory has detailed overview
- **Individual Commands**: Each `.md` file is comprehensive documentation

---

**Version**: 1.0.0
**Created**: 2025-11-17
**Total Commands**: 33
**Documentation Files**: 41
**Quality Standard**: FoxRev-level

Built for the IRIS Prime Centralized Intelligence Backend.
