# IRIS Prime Slash Commands

Comprehensive command suite for the IRIS Prime Centralized Intelligence Backend.

## Command Categories

### 🧠 IRIS Prime (Core Intelligence)
Intelligence system commands for expert evaluation, training, and pattern management.

- `/iris-evaluate` - Evaluate single project performance
- `/iris-evaluate-all` - Cross-project evaluation
- `/iris-retrain` - Manually retrain expert
- `/iris-auto-retrain` - Auto-retrain drifting experts
- `/iris-patterns` - Discover and analyze patterns
- `/iris-health` - System health overview
- `/iris-report` - Generate intelligence reports

[→ See iris/README.md for details](iris/README.md)

### 🤝 Consensus Tracking
Multi-expert decision tracking and expert version lineage management.

- `/consensus-record` - Record consensus decisions
- `/consensus-calculate` - Calculate consensus scores
- `/consensus-lineage` - Track expert version lineage
- `/consensus-rotation` - Expert rotation recommendations

[→ See consensus/README.md for details](consensus/README.md)

### 🔄 Reflexion Monitoring
Trajectory tracking and learning from experience.

- `/reflexion-track` - Track new reflexion trajectory
- `/reflexion-search` - Search similar reflexions
- `/reflexion-stats` - Reflexion system statistics
- `/reflexion-reuse` - Reuse reflexion learning

[→ See reflexion/README.md for details](reflexion/README.md)

### 📊 Pattern Discovery
Pattern discovery, transfer, and learning across projects.

- `/patterns-discover` - Deep pattern discovery
- `/patterns-transfer` - Transfer patterns between projects
- `/patterns-learn` - Learn from pattern library

[→ See patterns/README.md for details](patterns/README.md)

### 📈 Telemetry
System metrics, logging, and performance monitoring.

- `/telemetry-log` - Log telemetry events
- `/telemetry-stats` - View statistics
- `/telemetry-drift` - Detect performance drift

[→ See telemetry/README.md for details](telemetry/README.md)

### 🗄️ Supabase Integration
Backend data synchronization and management.

- `/supabase-sync` - Synchronize data
- `/supabase-migrate` - Run database migrations
- `/supabase-status` - Connection and health status

[→ See supabase/README.md for details](supabase/README.md)

### 🔔 Notifications
Multi-channel notification system (WhatsApp, Email, Slack, SMS, Discord).

- `/notifications-test` - Test notification channels
- `/notifications-config` - Configure notifications

[→ See notifications/README.md for details](notifications/README.md)

## Quick Start

### Daily Operations
```bash
# Morning health check
/iris-health

# Evaluate current work
/iris-evaluate

# Check for drift
/telemetry-drift
```

### Weekly Maintenance
```bash
# Full system evaluation
/iris-evaluate-all

# Auto-retrain drifting experts
/iris-auto-retrain

# Discover new patterns
/patterns-discover

# Generate weekly report
/iris-report --period weekly
```

### Before Deployment
```bash
# System health check
/iris-health

# Verify Supabase connection
/supabase-status

# Test notifications
/notifications-test

# Sync latest data
/supabase-sync
```

## Command Naming Convention

All commands follow the pattern: `/<category>-<action>`

Examples:
- `/iris-evaluate` - IRIS category, evaluate action
- `/consensus-record` - Consensus category, record action
- `/reflexion-search` - Reflexion category, search action

## Getting Help

Each command supports `--help` flag:
```bash
/iris-evaluate --help
```

View category README for detailed information:
```bash
# Read iris/README.md
# Read consensus/README.md
# etc.
```

## Architecture

```
IRIS Prime Console
├── IRIS Prime Core (Expert Intelligence)
│   ├── Expert Models (per-project learning)
│   ├── Pattern Discovery (cross-project knowledge)
│   └── Auto-Retraining (drift detection)
│
├── Consensus Tracking (Multi-expert decisions)
│   ├── Decision Recording
│   ├── Score Calculation
│   └── Version Lineage
│
├── Reflexion Monitor (Learning from experience)
│   ├── Trajectory Capture
│   ├── Vector Search
│   └── Pattern Recognition
│
├── Telemetry System (Metrics & Monitoring)
│   ├── Event Logging
│   ├── Performance Tracking
│   └── Drift Detection
│
├── Supabase Backend (Centralized Persistence)
│   ├── Data Storage
│   ├── Real-time Sync
│   └── Cross-project Sharing
│
└── Notifications (Multi-channel Alerts)
    ├── WhatsApp (Zapier + 2Chat)
    ├── Email, Slack, SMS, Discord
    └── Intelligent Routing
```

## Integration Flow

```
User Task
    ↓
Telemetry Logging → Supabase
    ↓
Reflexion Tracking → Pattern Discovery → IRIS Learning
    ↓
Consensus Recording → Expert Updates
    ↓
Drift Detection → Auto-Retraining
    ↓
Notifications → User Alerts
```

## Total Commands: 25

- IRIS Prime: 7 commands
- Consensus: 4 commands
- Reflexion: 4 commands
- Patterns: 3 commands
- Telemetry: 3 commands
- Supabase: 3 commands
- Notifications: 2 commands

---

Built with FoxRev-level quality and documentation standards.
