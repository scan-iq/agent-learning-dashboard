# Supabase Integration Commands

Commands for managing Supabase backend integration and data synchronization.

## Available Commands

- `/supabase-sync` - Synchronize data between local and Supabase
- `/supabase-migrate` - Run database migrations
- `/supabase-status` - Check Supabase connection and health

## Quick Start

```bash
# Check connection
/supabase-status

# Sync data
/supabase-sync --mode bidirectional

# Run migrations
/supabase-migrate --version latest
```

## Core Concepts

**Supabase Backend** provides:
- Centralized data persistence
- Real-time synchronization
- Scalable storage
- Cross-project data sharing

## Integration

Works with:
- IRIS Prime (expert data)
- Reflexion (trajectory storage)
- Consensus (decision tracking)
- Telemetry (metrics storage)
- Patterns (pattern library)
