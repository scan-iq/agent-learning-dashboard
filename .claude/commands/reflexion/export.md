# reflexion-export

Export reflexions for external analysis, backup, or sharing.

## Usage

```bash
/reflexion-export [--format <type>] [--filter <criteria>] [--output <path>]
```

## Options

- `--format` - Export format: json, csv, markdown, html (default: json)
- `--filter` - Filter: verdict, date-range, project
- `--output` - Output file path
- `--include` - Data to include: metadata, trajectories, patterns (default: all)

## Examples

### Export all reflexions as JSON
```bash
/reflexion-export --format json --output /exports/reflexions.json
```

### Export successful reflexions only
```bash
/reflexion-export \
  --filter "verdict:passed" \
  --format markdown \
  --output /docs/successful-patterns.md
```

### Export for specific project
```bash
/reflexion-export \
  --filter "project:iris-prime-console" \
  --format csv
```

## What This Does

Exports reflexion data including:
- Task descriptions
- Trajectories
- Verdicts and outcomes
- Self-reflections
- Patterns identified
- Metadata

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ Reflexion Export                                             ║
╠══════════════════════════════════════════════════════════════╣
║ Format: JSON                                                 ║
║ Filter: verdict:passed                                       ║
║ Period: All time                                             ║
╠══════════════════════════════════════════════════════════════╣

📊 Exporting data...
  ✓ Found 215 matching reflexions
  ✓ Included trajectories
  ✓ Included patterns
  ✓ Generated JSON export

✅ Export complete!
   File: /exports/reflexions-2025-11-17.json
   Size: 8.4 MB
   Records: 215
```

## Related Commands

- `/reflexion-search` - Search before export
- `/reflexion-stats` - View statistics
- `/supabase-sync` - Sync to Supabase
