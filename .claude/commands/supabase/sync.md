# supabase-sync

Synchronize data between local storage and Supabase backend.

## Usage

```bash
/supabase-sync [--mode <type>] [--tables <list>] [--force]
```

## Options

- `--mode` - Sync mode: upload, download, bidirectional (default: bidirectional)
- `--tables` - Specific tables to sync (comma-separated, default: all)
- `--force` - Force sync ignoring conflicts
- `--dry-run` - Preview sync without executing
- `--resolve` - Conflict resolution: local, remote, merge (default: merge)

## Examples

### Bidirectional sync all tables
```bash
/supabase-sync
```

### Upload local data to Supabase
```bash
/supabase-sync --mode upload --tables reflexions,patterns
```

### Download from Supabase
```bash
/supabase-sync --mode download --force
```

### Preview sync
```bash
/supabase-sync --dry-run
```

## What This Does

1. **Comparison**: Compares local and remote data
2. **Conflict Detection**: Identifies conflicting changes
3. **Resolution**: Resolves conflicts using specified strategy
4. **Synchronization**: Syncs data bidirectionally
5. **Validation**: Verifies data integrity
6. **Reporting**: Provides sync summary

## When to Use

- **Regular Sync**: Daily synchronization of learning data
- **After Offline Work**: Sync changes after working offline
- **Before Deployment**: Ensure latest data before deploying
- **Data Recovery**: Download data from Supabase
- **Backup**: Upload local data to cloud

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ Supabase Synchronization                                     ║
╠══════════════════════════════════════════════════════════════╣
║ Mode: Bidirectional                                          ║
║ Tables: All (7 tables)                                       ║
║ Started: 2025-11-17 17:15:00                                ║
╠══════════════════════════════════════════════════════════════╣

🔍 Analyzing differences...
  ✓ Connected to Supabase
  ✓ Comparing local and remote data
  ✓ Conflict detection complete

╔══════════════════════════════════════════════════════════════╗
║ SYNC ANALYSIS                                                ║
╠══════════════════════════════════════════════════════════════╣
║ Table: reflexions                                            ║
║   Local → Remote: 12 new entries                            ║
║   Remote → Local: 3 new entries                             ║
║   Conflicts: 0                                               ║
║                                                              ║
║ Table: patterns                                              ║
║   Local → Remote: 5 new entries                             ║
║   Remote → Local: 8 new entries                             ║
║   Conflicts: 1 (will merge)                                  ║
║                                                              ║
║ Table: consensus                                             ║
║   Local → Remote: 7 new entries                             ║
║   Remote → Local: 0 new entries                             ║
║   Conflicts: 0                                               ║
║                                                              ║
║ ... [4 more tables]                                          ║
╠══════════════════════════════════════════════════════════════╣

⬆️  Uploading to Supabase...
  ✓ reflexions: 12 entries uploaded
  ✓ patterns: 5 entries uploaded
  ✓ consensus: 7 entries uploaded
  ✓ telemetry: 142 entries uploaded
  ✓ experts: 2 entries updated

⬇️  Downloading from Supabase...
  ✓ reflexions: 3 entries downloaded
  ✓ patterns: 8 entries downloaded
  ✓ iris_reports: 1 entry downloaded

🔄 Resolving conflicts...
  ✓ patterns: 1 conflict merged successfully

╔══════════════════════════════════════════════════════════════╗
║ SYNC SUMMARY                                                 ║
╠══════════════════════════════════════════════════════════════╣
║ Total Uploaded:   168 entries                                ║
║ Total Downloaded: 12 entries                                 ║
║ Conflicts Resolved: 1                                        ║
║ Errors:           0                                          ║
║ Duration:         4.2s                                       ║
╠══════════════════════════════════════════════════════════════╣
║ Status: ✅ SYNC COMPLETE                                     ║
╚══════════════════════════════════════════════════════════════╝
```

## Related Commands

- `/supabase-status` - Check connection health
- `/supabase-migrate` - Run database migrations
- `/iris-health` - Overall system health
