# telemetry-log

Log telemetry events for tracking, analysis, and drift detection.

## Usage

```bash
/telemetry-log --event <type> [--metadata <json>] [--project <name>]
```

## Options

- `--event` - Event type (required): task_start, task_complete, error, performance, etc.
- `--metadata` - Event metadata (JSON)
- `--project` - Project identifier (default: current)
- `--severity` - Event severity: info, warning, error, critical
- `--batch` - Batch multiple events (JSON array)

## Examples

### Log task completion
```bash
/telemetry-log \
  --event task_complete \
  --metadata '{"duration": 120, "success": true, "tokens": 4500}'
```

### Log error event
```bash
/telemetry-log \
  --event error \
  --severity error \
  --metadata '{"type": "APIError", "message": "Rate limit exceeded"}'
```

### Batch log events
```bash
/telemetry-log --batch '[
  {"event": "task_start", "metadata": {"task": "api-build"}},
  {"event": "performance", "metadata": {"latency": 245}}
]'
```

## What This Does

1. **Event Capture**: Records event with timestamp and context
2. **Storage**: Saves to Supabase telemetry table
3. **Enrichment**: Adds project, expert, and environment context
4. **Indexing**: Enables efficient querying and analysis
5. **Alerting**: Triggers alerts for critical events

## When to Use

- **Task Tracking**: Log task start/complete events
- **Performance Monitoring**: Track latency and resource usage
- **Error Tracking**: Record failures and exceptions
- **Drift Detection**: Feed data for drift analysis
- **Audit Trail**: Maintain event history

## Output

```
✅ Telemetry event logged
Event ID: telem_9f3d8a2b
Type: task_complete
Timestamp: 2025-11-17 17:00:00
Project: iris-prime-console
```

## Related Commands

- `/telemetry-stats` - Analyze telemetry data
- `/telemetry-drift` - Detect drift from telemetry
- `/iris-health` - System health (uses telemetry)
