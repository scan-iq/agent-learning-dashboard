# Real-Time Telemetry API Documentation

## Overview

The IRIS Dashboard supports real-time telemetry updates through WebSocket and Server-Sent Events (SSE) using the **midstreamer** library. This enables live metrics, instant notifications, and real-time activity feeds without manual page refreshes or constant polling.

## Architecture

### Hybrid Approach: REST + WebSocket/SSE

The system uses a hybrid architecture combining the best of both worlds:

1. **Initial Load**: REST API via React Query
   - Fast initial page load
   - Cached data for instant navigation
   - Automatic retry and error handling

2. **Real-Time Updates**: WebSocket/SSE via midstreamer
   - Incremental updates as data changes
   - Low latency (~50-200ms)
   - Automatic reconnection with exponential backoff

3. **Fallback Mode**: Polling when connection fails
   - Graceful degradation if WebSocket/SSE unavailable
   - 30-second polling interval
   - Seamless transition between modes

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐         ┌─────────────────┐            │
│  │  React Query    │         │  Midstreamer    │            │
│  │  (Initial Load) │         │  (Live Updates) │            │
│  └────────┬────────┘         └────────┬────────┘            │
│           │                           │                      │
│           │  REST API                 │  WebSocket/SSE       │
│           │  (HTTP)                   │                      │
└───────────┼───────────────────────────┼──────────────────────┘
            │                           │
            ▼                           ▼
┌───────────────────────────────────────────────────────────┐
│                     Backend Server                         │
├───────────────────────────────────────────────────────────┤
│                                                             │
│  /api/overview          /api/stream/overview              │
│  /api/events            /api/stream/events                │
│  /api/project-details   /api/stream/telemetry             │
│                                                             │
└───────────────────────────────────────────────────────────┘
```

## API Endpoints

### REST Endpoints (Existing)

These endpoints provide initial data and fallback polling:

- `GET /api/overview` - Dashboard overview data
- `GET /api/events?limit=20` - Recent events
- `GET /api/project-details?id={projectId}` - Project details
- `GET /api/anomalies` - Anomaly data
- `GET /api/patterns` - Pattern analysis

### Real-Time Stream Endpoints (New)

These endpoints provide WebSocket/SSE connections for real-time updates:

#### 1. Overview Stream
```
GET /api/stream/overview
```

**Protocol**: WebSocket or Server-Sent Events (SSE)

**Message Format**:
```json
{
  "type": "update",
  "timestamp": "2025-11-23T04:00:00Z",
  "data": {
    "metrics": {
      "total_projects": 5,
      "healthy_projects": 3,
      "warning_projects": 1,
      "critical_projects": 1,
      "total_runs_today": 142,
      "avg_success_rate": 0.87,
      "active_experts": 12,
      "total_reflexions": 45
    },
    "projects": [
      {
        "id": "nfl-predictions",
        "name": "nfl-predictions",
        "status": "healthy",
        "health_score": 0.92,
        "last_run": "2025-11-23T03:55:00Z",
        "total_runs": 1523,
        "success_rate": 0.89,
        "active_experts": 4,
        "reflexions_count": 12,
        "avg_latency": 245
      }
    ],
    "events": [
      {
        "id": "evt_123abc",
        "timestamp": "2025-11-23T03:59:45Z",
        "project": "nfl-predictions",
        "event_type": "evaluation",
        "severity": "info",
        "message": "Expert rotation completed successfully",
        "metadata": {
          "experts_rotated": 2,
          "new_accuracy": 0.91
        }
      }
    ]
  }
}
```

**Update Frequency**: Real-time as changes occur

**Connection Lifespan**: Persistent (with heartbeat every 30s)

#### 2. Events Stream
```
GET /api/stream/events
```

**Protocol**: WebSocket or Server-Sent Events (SSE)

**Message Format**:
```json
{
  "type": "event",
  "timestamp": "2025-11-23T04:00:00Z",
  "data": {
    "id": "evt_456def",
    "timestamp": "2025-11-23T04:00:00Z",
    "project": "sentiment-analysis",
    "event_type": "reflexion",
    "severity": "info",
    "message": "New pattern detected: API timeout on OpenAI calls",
    "metadata": {
      "pattern_id": "pat_789",
      "confidence": 0.85
    }
  }
}
```

**Update Frequency**: Immediate (pushed as events occur)

#### 3. Telemetry Stream
```
GET /api/stream/telemetry
```

**Protocol**: WebSocket or Server-Sent Events (SSE)

**Message Format**:
```json
{
  "type": "telemetry",
  "timestamp": "2025-11-23T04:00:00Z",
  "data": {
    "metrics": {
      "total_projects": 5,
      "healthy_projects": 3,
      "warning_projects": 1,
      "critical_projects": 1,
      "total_runs_today": 142,
      "avg_success_rate": 0.87,
      "active_experts": 12,
      "total_reflexions": 45
    },
    "recentEvents": [
      {
        "id": "evt_123abc",
        "timestamp": "2025-11-23T03:59:45Z",
        "project": "nfl-predictions",
        "event_type": "evaluation",
        "severity": "info",
        "message": "Expert rotation completed successfully"
      }
    ]
  }
}
```

**Update Frequency**: Every 5-10 seconds or on significant changes

## Connection Protocol

### WebSocket Handshake

```
GET /api/stream/overview HTTP/1.1
Host: your-api-domain.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Authorization: Bearer YOUR_API_KEY
```

### SSE Connection

```
GET /api/stream/overview HTTP/1.1
Host: your-api-domain.com
Accept: text/event-stream
Cache-Control: no-cache
Authorization: Bearer YOUR_API_KEY
```

**SSE Response Format**:
```
event: update
data: {"type":"update","timestamp":"2025-11-23T04:00:00Z","data":{...}}

event: heartbeat
data: {"type":"ping","timestamp":"2025-11-23T04:00:30Z"}

event: update
data: {"type":"update","timestamp":"2025-11-23T04:01:00Z","data":{...}}
```

## Client-Side Integration

### Using the useMidstreamer Hook

```typescript
import { useMidstreamer } from '@/hooks/useMidstreamer';

function MyComponent() {
  const {
    data,
    isConnected,
    isConnecting,
    error,
    reconnectAttempt,
    connect,
    disconnect,
    reset,
  } = useMidstreamer('/api/stream/overview', {
    reconnect: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: 10,
    heartbeatInterval: 30000,
  });

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <p>Data: {JSON.stringify(data)}</p>
    </div>
  );
}
```

### Using the Hybrid Hook (Recommended)

```typescript
import { useRealtimeOverview } from '@/hooks/useIrisData';

function Dashboard() {
  const { data, isLoading, isError, isLive } = useRealtimeOverview({
    enableRealtime: true,
    realtimeEndpoint: '/api/stream/overview',
  });

  return (
    <div>
      <Badge variant={isLive ? 'success' : 'warning'}>
        {isLive ? 'Live' : 'Polling'}
      </Badge>
      {/* Render data... */}
    </div>
  );
}
```

### Using the RealTimeTelemetry Component

```typescript
import { RealTimeTelemetry } from '@/components/dashboard/RealTimeTelemetry';

function DashboardPage() {
  return (
    <RealTimeTelemetry
      endpoint="/api/stream/telemetry"
      fallbackInterval={30000}
      enableOptimistic={true}
      showConnectionStatus={true}
    />
  );
}
```

## Connection Management

### Reconnection Strategy

The system implements exponential backoff with jitter:

```
Attempt 1: 3s delay
Attempt 2: 6s delay
Attempt 3: 12s delay
Attempt 4: 24s delay
Attempt 5: 48s delay
Attempt 6+: 60s delay (max)

With ±20% random jitter to prevent thundering herd
```

After 10 failed attempts, the system falls back to polling mode.

### Heartbeat

- Sent every 30 seconds to detect dead connections
- If no response within 60 seconds, connection is considered dead
- Automatic reconnection triggered

### Graceful Degradation

```
┌─────────────────┐
│  WebSocket/SSE  │  ← Primary mode (low latency)
└────────┬────────┘
         │ Connection fails
         ▼
┌─────────────────┐
│  Retry 10x      │  ← Exponential backoff
└────────┬────────┘
         │ All retries fail
         ▼
┌─────────────────┐
│  Polling Mode   │  ← Fallback mode (30s interval)
└─────────────────┘
```

## Message Types

### Update Message
```json
{
  "type": "update",
  "timestamp": "ISO 8601 timestamp",
  "data": { /* Full or partial data */ }
}
```

### Event Message
```json
{
  "type": "event",
  "timestamp": "ISO 8601 timestamp",
  "data": { /* Single event object */ }
}
```

### Heartbeat Message
```json
{
  "type": "ping",
  "timestamp": "ISO 8601 timestamp"
}
```

### Error Message
```json
{
  "type": "error",
  "timestamp": "ISO 8601 timestamp",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retryAfter": 30
  }
}
```

## Error Handling

### Client-Side Error Handling

```typescript
const { error, isConnected, reset } = useMidstreamer('/api/stream/overview');

useEffect(() => {
  if (error) {
    console.error('Stream error:', error);

    // Show notification
    toast({
      title: 'Connection error',
      description: error.message,
      variant: 'destructive',
    });

    // Optionally retry
    setTimeout(() => reset(), 5000);
  }
}, [error, reset]);
```

### Server-Side Error Codes

| Code | Description | Action |
|------|-------------|--------|
| `AUTH_REQUIRED` | Missing or invalid API key | Redirect to login |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait and retry |
| `STREAM_UNAVAILABLE` | Service temporarily down | Fall back to polling |
| `INVALID_ENDPOINT` | Endpoint not found | Check endpoint URL |

## Performance Considerations

### Bandwidth Usage

- **WebSocket**: ~50-200 bytes per update
- **SSE**: ~100-300 bytes per update (includes event headers)
- **Polling**: Full payload (~5-50KB) every 30s

### Recommended Limits

- **Max concurrent connections**: 100 per client IP
- **Max message rate**: 10 messages/second
- **Max payload size**: 100KB per message
- **Connection timeout**: 5 minutes idle

### Optimization Tips

1. **Use incremental updates**: Send only changed data, not full snapshots
2. **Batch events**: Group multiple events into single message
3. **Compress payloads**: Use gzip for messages > 1KB
4. **Debounce rapid changes**: Aggregate changes over 100-500ms window

## Security

### Authentication

All real-time endpoints require authentication via API key:

```typescript
const streamer = new MidStreamer({
  url: '/api/stream/overview',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
  },
});
```

### Rate Limiting

- 100 connections per hour per IP
- 1000 messages per minute per connection
- Auto-throttle when limits approached

### CORS

Real-time endpoints support CORS for browser clients:

```
Access-Control-Allow-Origin: https://your-frontend-domain.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, OPTIONS
```

## Testing

### Local Development

For local testing without a real-time backend:

```typescript
// Mock WebSocket server (for testing)
const mockServer = new WebSocket.Server({ port: 8080 });

mockServer.on('connection', (ws) => {
  // Send updates every 5 seconds
  const interval = setInterval(() => {
    ws.send(JSON.stringify({
      type: 'update',
      timestamp: new Date().toISOString(),
      data: generateMockData(),
    }));
  }, 5000);

  ws.on('close', () => clearInterval(interval));
});
```

### Integration Testing

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useMidstreamer } from '@/hooks/useMidstreamer';

test('connects and receives data', async () => {
  const { result } = renderHook(() =>
    useMidstreamer('/api/stream/test')
  );

  await waitFor(() => {
    expect(result.current.isConnected).toBe(true);
  });

  // Simulate server message
  mockServer.send({ type: 'update', data: { foo: 'bar' } });

  await waitFor(() => {
    expect(result.current.data).toEqual({ foo: 'bar' });
  });
});
```

## Troubleshooting

### Common Issues

1. **Connection keeps dropping**
   - Check firewall settings
   - Verify proxy allows WebSocket upgrade
   - Increase heartbeat interval

2. **High latency**
   - Check network conditions
   - Verify server load
   - Consider using SSE instead of WebSocket

3. **Memory leaks**
   - Ensure proper cleanup in useEffect
   - Disconnect when component unmounts
   - Clear event listeners

4. **Stale data**
   - Verify timestamp in messages
   - Check client-side caching logic
   - Ensure proper merge strategy

## Future Enhancements

- [ ] Binary message protocol (Protocol Buffers)
- [ ] Delta compression for large payloads
- [ ] Multi-channel subscriptions
- [ ] Priority queues for critical updates
- [ ] Client-side event replay on reconnection
- [ ] GraphQL subscriptions support

## Resources

- [Midstreamer Documentation](https://github.com/midstreamer/midstreamer)
- [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Server-Sent Events (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [React Query Documentation](https://tanstack.com/query/latest)

## Support

For issues or questions about real-time integration:

1. Check the troubleshooting section above
2. Review browser console for error messages
3. Test with fallback polling mode disabled
4. Contact the development team with connection logs
