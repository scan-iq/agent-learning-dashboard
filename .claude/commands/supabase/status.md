# supabase-status

Check Supabase connection, health, and database status.

## Usage

```bash
/supabase-status [--detailed] [--test-queries]
```

## Options

- `--detailed` - Show detailed table and storage information
- `--test-queries` - Run test queries to verify performance
- `--check-auth` - Verify authentication and permissions

## Examples

### Quick status check
```bash
/supabase-status
```

### Detailed health report
```bash
/supabase-status --detailed --test-queries
```

## What This Does

1. **Connection Test**: Verifies Supabase connectivity
2. **Authentication**: Validates API keys and permissions
3. **Database Health**: Checks database status
4. **Table Analysis**: Shows table sizes and record counts
5. **Performance**: Tests query performance
6. **Storage**: Checks storage usage

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ Supabase Backend Status                                      ║
╠══════════════════════════════════════════════════════════════╣
║ CONNECTION                                                   ║
╠══════════════════════════════════════════════════════════════╣
║ Status:          ✅ Connected                                ║
║ URL:             https://xxx.supabase.co                     ║
║ Latency:         23ms (excellent)                            ║
║ Region:          us-east-1                                   ║
╠══════════════════════════════════════════════════════════════╣
║ AUTHENTICATION                                               ║
╠══════════════════════════════════════════════════════════════╣
║ API Key:         ✅ Valid                                    ║
║ Permissions:     ✅ Read/Write                               ║
║ RLS:             Enabled                                     ║
╠══════════════════════════════════════════════════════════════╣
║ DATABASE                                                     ║
╠══════════════════════════════════════════════════════════════╣
║ Schema Version:  6 (up to date)                              ║
║ Tables:          12                                          ║
║ Total Records:   5,847                                       ║
║ Size:            847 MB                                      ║
╠══════════════════════════════════════════════════════════════╣
║ TABLE DETAILS                                                ║
╠══════════════════════════════════════════════════════════════╣
║ reflexions:      3,492 records (412 MB)                     ║
║ telemetry:       1,847 records (156 MB)                     ║
║ patterns:        67 records (8.2 MB)                        ║
║ consensus:       298 records (23 MB)                        ║
║ experts:         12 records (45 MB)                         ║
║ iris_reports:    18 records (12 MB)                         ║
║ ... [6 more tables]                                          ║
╠══════════════════════════════════════════════════════════════╣
║ PERFORMANCE                                                  ║
╠══════════════════════════════════════════════════════════════╣
║ Avg Query Time:  18ms                                        ║
║ Cache Hit Rate:  89.3%                                       ║
║ Active Conns:    3/10                                        ║
╠══════════════════════════════════════════════════════════════╣
║ STORAGE                                                      ║
╠══════════════════════════════════════════════════════════════╣
║ Used:            847 MB / 500 GB (0.17%)                     ║
║ Files:           0 (using database only)                     ║
╠══════════════════════════════════════════════════════════════╣
║ HEALTH:          ✅ EXCELLENT                                ║
╚══════════════════════════════════════════════════════════════╝
```

## Related Commands

- `/supabase-sync` - Sync data
- `/supabase-migrate` - Run migrations
- `/iris-health` - Overall system health
