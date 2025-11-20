# Telemetry Commands

Commands for logging, analyzing, and monitoring system telemetry data.

## Available Commands

- `/telemetry-log` - Log telemetry events
- `/telemetry-stats` - View telemetry statistics
- `/telemetry-drift` - Detect performance drift

## Quick Start

```bash
# Log telemetry event
/telemetry-log --event task_complete --metadata '{"duration": 120}'

# View stats
/telemetry-stats --period weekly

# Check for drift
/telemetry-drift --metric accuracy
```

## Core Concepts

**Telemetry System** provides:
- Event logging and tracking
- Performance monitoring
- Drift detection
- Trend analysis

## Integration

Works with:
- IRIS for evaluation data
- Reflexion for trajectory tracking
- Supabase for persistence
- Pattern discovery for insights
