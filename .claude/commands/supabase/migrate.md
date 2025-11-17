# supabase-migrate

Run database migrations for Supabase schema updates.

## Usage

```bash
/supabase-migrate [--version <num>] [--direction <type>] [--dry-run]
```

## Options

- `--version` - Migration version: latest, specific version number
- `--direction` - Migration direction: up, down (default: up)
- `--dry-run` - Preview migration without executing
- `--force` - Force migration even with warnings
- `--create` - Create new migration file

## Examples

### Run latest migrations
```bash
/supabase-migrate --version latest
```

### Preview migration
```bash
/supabase-migrate --version latest --dry-run
```

### Rollback migration
```bash
/supabase-migrate --version 5 --direction down
```

### Create new migration
```bash
/supabase-migrate --create "add_expert_metadata_column"
```

## What This Does

1. **Version Check**: Identifies current schema version
2. **Migration Discovery**: Finds pending migrations
3. **Validation**: Checks migration safety
4. **Execution**: Runs migrations in order
5. **Verification**: Validates schema changes
6. **Rollback**: Supports rollback if needed

## When to Use

- **Schema Updates**: Add new tables or columns
- **Data Migrations**: Transform existing data
- **Performance**: Add indexes or optimize queries
- **Cleanup**: Remove deprecated structures
- **Versioning**: Keep schema version controlled

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ Supabase Database Migration                                  ║
╠══════════════════════════════════════════════════════════════╣
║ Target Version: latest                                       ║
║ Direction: up                                                ║
╠══════════════════════════════════════════════════════════════╣

🔍 Checking current schema version...
  ✓ Connected to Supabase
  ✓ Current version: 4
  ✓ Latest version: 6
  ✓ Pending migrations: 2

╔══════════════════════════════════════════════════════════════╗
║ PENDING MIGRATIONS                                           ║
╠══════════════════════════════════════════════════════════════╣
║ 5_add_expert_metadata.sql                                   ║
║   • Add metadata column to experts table                     ║
║   • Add indexes for performance                              ║
║   Estimated time: 2s                                         ║
║                                                              ║
║ 6_iris_reports_table.sql                                    ║
║   • Create iris_reports table                                ║
║   • Add foreign key constraints                              ║
║   Estimated time: 1s                                         ║
╠══════════════════════════════════════════════════════════════╣

⚡ Running migrations...

[1/2] Migration 5: add_expert_metadata
  ✓ Add metadata column (jsonb)
  ✓ Create index on metadata->>project
  ✓ Backfill existing experts with empty metadata
  ✓ Migration 5 complete (1.8s)

[2/2] Migration 6: iris_reports_table
  ✓ Create iris_reports table
  ✓ Add foreign key to experts
  ✓ Create indexes
  ✓ Migration 6 complete (0.9s)

╔══════════════════════════════════════════════════════════════╗
║ MIGRATION SUMMARY                                            ║
╠══════════════════════════════════════════════════════════════╣
║ Migrations Run:   2                                          ║
║ New Version:      6                                          ║
║ Duration:         2.7s                                       ║
║ Errors:           0                                          ║
╠══════════════════════════════════════════════════════════════╣
║ Status: ✅ MIGRATIONS COMPLETE                               ║
╚══════════════════════════════════════════════════════════════╝
```

## Related Commands

- `/supabase-status` - Check database health
- `/supabase-sync` - Sync data after migration
