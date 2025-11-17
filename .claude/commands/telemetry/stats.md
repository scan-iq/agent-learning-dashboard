# telemetry-stats

View comprehensive telemetry statistics and system metrics.

## Usage

```bash
/telemetry-stats [--period <timeframe>] [--metric <type>] [--export]
```

## Options

- `--period` - Time period: hourly, daily, weekly, monthly (default: daily)
- `--metric` - Specific metric: all, performance, errors, usage (default: all)
- `--project` - Filter by project
- `--export` - Export format: json, csv, markdown
- `--compare` - Compare with previous period

## Examples

### Daily statistics
```bash
/telemetry-stats
```

### Weekly performance metrics
```bash
/telemetry-stats --period weekly --metric performance
```

### Compare with previous month
```bash
/telemetry-stats --period monthly --compare
```

## What This Does

Analyzes telemetry data to provide:
- Event counts and trends
- Performance metrics (latency, throughput)
- Error rates and patterns
- Resource utilization
- Token usage
- Task completion rates

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ Telemetry Statistics - Last 24 Hours                        ║
╠══════════════════════════════════════════════════════════════╣
║ EVENTS                                                       ║
╠══════════════════════════════════════════════════════════════╣
║ Total Events:        1,847                                   ║
║ Tasks Completed:     264 (87.3% success)                    ║
║ Errors:              34 (1.8% error rate)                   ║
║ Performance Samples: 892                                     ║
╠══════════════════════════════════════════════════════════════╣
║ PERFORMANCE                                                  ║
╠══════════════════════════════════════════════════════════════╣
║ Avg Latency:         187ms                                   ║
║ P95 Latency:         421ms                                   ║
║ P99 Latency:         892ms                                   ║
║ Throughput:          ~110 req/hour                           ║
╠══════════════════════════════════════════════════════════════╣
║ RESOURCE USAGE                                               ║
╠══════════════════════════════════════════════════════════════╣
║ Total Tokens:        142,338                                 ║
║ Avg Tokens/Task:     539                                     ║
║ API Calls:           2,347                                   ║
║ Cache Hit Rate:      67.8%                                   ║
╚══════════════════════════════════════════════════════════════╝
```

## Related Commands

- `/telemetry-log` - Log new events
- `/telemetry-drift` - Drift detection
- `/iris-health` - Overall system health
