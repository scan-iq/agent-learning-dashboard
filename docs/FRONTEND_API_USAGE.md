# Frontend API Usage Guide

This guide shows how to use the IRIS REST API wrappers in your React dashboard components.

## Pattern Comparison

### Backend (MCP Server)
```typescript
// Backend/CLI projects use MCP servers
// claude mcp add iris-prime npx iris-prime mcp start

// Tools available as MCP functions
const report = await mcp.callTool('iris_evaluate_project', {
  project_id: 'nfl-predictor'
});
```

### Frontend (REST API Wrapper)
```typescript
// Frontend projects use REST API wrappers
import * as iris from '@/servers/iris-prime';

// Same developer UX, different transport
const report = await iris.evaluateProject({
  projectId: 'nfl-predictor'
});
```

## Environment Setup

Create `.env.local`:
```bash
VITE_IRIS_API_BASE=http://localhost:3001
# or production: https://api.iris-prime.io
```

## Usage Examples

### 1. Project Dashboard Component

```typescript
import { useQuery } from '@tanstack/react-query';
import * as iris from '@/servers/iris-prime';

function ProjectDashboard({ projectId }: { projectId: string }) {
  const { data: report, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => iris.evaluateProject({
      projectId,
      includeRecommendations: true
    }),
    refetchInterval: 30000 // Refresh every 30s
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorAlert error={error} />;

  return (
    <div className="dashboard">
      <HealthScore score={report.healthScore} />
      <StatusBadge status={report.status} />

      <Metrics metrics={report.metrics} />

      <RecommendationsList
        recommendations={report.recommendations}
      />
    </div>
  );
}
```

### 2. Drift Detection Monitor

```typescript
import { useQuery } from '@tanstack/react-query';
import * as iris from '@/servers/iris-prime';

function DriftMonitor({ expertId, version }: {
  expertId: string;
  version: string;
}) {
  const { data: drift } = useQuery({
    queryKey: ['drift', expertId, version],
    queryFn: () => iris.detectDrift({
      expertId,
      version,
      threshold: 0.15
    }),
    refetchInterval: 60000 // Check every minute
  });

  if (!drift) return null;

  const isCritical = drift.severity === 'critical';

  return (
    <Alert severity={drift.severity}>
      <AlertTitle>
        {isCritical ? '🚨 Critical Drift Detected' : 'Drift Warning'}
      </AlertTitle>

      <p>Drift Score: {(drift.driftScore * 100).toFixed(1)}%</p>

      <ul>
        {drift.affectedMetrics.map(metric => (
          <li key={metric}>{metric}</li>
        ))}
      </ul>

      <p>{drift.description}</p>
    </Alert>
  );
}
```

### 3. Pattern Discovery

```typescript
import { useQuery } from '@tanstack/react-query';
import * as iris from '@/servers/iris-prime';

function PatternInsights({ projectId }: { projectId: string }) {
  const { data: patterns } = useQuery({
    queryKey: ['patterns', projectId],
    queryFn: () => iris.findPatterns({
      analysisType: 'consensus',
      projectId,
      timeRange: '7d'
    })
  });

  if (!patterns) return null;

  return (
    <div className="patterns">
      <h3>Discovered Patterns ({patterns.patterns.length})</h3>

      {patterns.patterns.map(pattern => (
        <PatternCard key={pattern.id} pattern={pattern}>
          <Badge>{pattern.type}</Badge>
          <h4>{pattern.description}</h4>
          <Progress
            value={pattern.confidence * 100}
            label="Confidence"
          />
          <div className="stats">
            <Stat label="Frequency" value={pattern.frequency} />
            <Stat label="Impact" value={pattern.impact} />
          </div>
        </PatternCard>
      ))}
    </div>
  );
}
```

### 4. Global Metrics Dashboard

```typescript
import { useQuery } from '@tanstack/react-query';
import * as iris from '@/servers/iris-prime';

function MetricsDashboard() {
  const { data: metrics } = useQuery({
    queryKey: ['metrics', 'global'],
    queryFn: () => iris.getMetrics({ timeRange: '24h' }),
    refetchInterval: 10000 // Refresh every 10s
  });

  if (!metrics) return null;

  return (
    <Grid>
      <MetricCard
        title="Total Projects"
        value={metrics.totalProjects}
        breakdown={{
          healthy: metrics.healthyProjects,
          warning: metrics.warningProjects,
          critical: metrics.criticalProjects
        }}
      />

      <MetricCard
        title="Success Rate"
        value={`${(metrics.successRate * 100).toFixed(1)}%`}
        trend={metrics.successRate > 0.9 ? 'up' : 'down'}
      />

      <MetricCard
        title="Avg Health Score"
        value={metrics.avgHealthScore.toFixed(1)}
      />

      <MetricCard
        title="Active Experts"
        value={metrics.activeExperts}
      />
    </Grid>
  );
}
```

### 5. Reflexion Timeline

```typescript
import { useQuery } from '@tanstack/react-query';
import * as iris from '@/servers/iris-prime';

function ReflexionTimeline({ projectId }: { projectId: string }) {
  const { data } = useQuery({
    queryKey: ['reflexions', projectId],
    queryFn: () => iris.queryReflexions({
      projectId,
      minImpact: 0.7,
      limit: 50
    })
  });

  if (!data) return null;

  return (
    <div className="timeline">
      <h3>Learning Insights ({data.totalCount})</h3>

      {data.patterns.map(pattern => (
        <TimelineItem key={pattern.id}>
          <Badge>{pattern.pattern}</Badge>
          <div className="impact">
            Impact: {(pattern.impact * 100).toFixed(0)}%
          </div>
          <div className="frequency">
            Frequency: {pattern.frequency}x
          </div>
          <time>{new Date(pattern.createdAt).toLocaleString()}</time>
        </TimelineItem>
      ))}
    </div>
  );
}
```

### 6. Expert Signatures

```typescript
import { useQuery } from '@tantml:react-query';
import * as iris from '@/servers/iris-prime';

function ExpertProfile({ expertId }: { expertId: string }) {
  const { data: signature } = useQuery({
    queryKey: ['expert', expertId],
    queryFn: () => iris.getExpertSignatures({
      expertId,
      version: 'latest'
    })
  });

  if (!signature) return null;

  return (
    <Card>
      <h3>Expert {expertId}</h3>
      <p>Model: {signature.signature.modelType}</p>
      <p>Version: {signature.version}</p>

      <div className="performance">
        <Metric
          label="Accuracy"
          value={`${(signature.signature.performance.accuracy * 100).toFixed(1)}%`}
        />
        <Metric
          label="Latency"
          value={`${signature.signature.performance.latency}ms`}
        />
        <Metric
          label="Reliability"
          value={`${(signature.signature.performance.reliability * 100).toFixed(1)}%`}
        />
      </div>
    </Card>
  );
}
```

### 7. Telemetry Submission

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as iris from '@/servers/iris-prime';

function useTrackEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (event: {
      eventType: string;
      projectId?: string;
      data: Record<string, any>;
    }) => iris.submitTelemetry(event),

    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    }
  });
}

// Usage in component
function ActionButton({ projectId }: { projectId: string }) {
  const trackEvent = useTrackEvent();

  const handleAction = async () => {
    await performAction();

    trackEvent.mutate({
      eventType: 'user_action',
      projectId,
      data: {
        action: 'manual_evaluation',
        timestamp: Date.now()
      }
    });
  };

  return <Button onClick={handleAction}>Evaluate</Button>;
}
```

## Error Handling

```typescript
import { IrisApiError } from '@/servers/iris-prime';

function MyComponent() {
  const { data, error } = useQuery({
    queryKey: ['project'],
    queryFn: () => iris.evaluateProject({ projectId: 'abc' }),
    retry: (failureCount, error) => {
      // Don't retry on client errors
      if (error instanceof IrisApiError && error.status && error.status < 500) {
        return false;
      }
      return failureCount < 3;
    }
  });

  if (error instanceof IrisApiError) {
    return (
      <ErrorAlert>
        <h4>API Error: {error.message}</h4>
        <p>Code: {error.code}</p>
        <p>Status: {error.status}</p>
        {error.details && (
          <pre>{JSON.stringify(error.details, null, 2)}</pre>
        )}
      </ErrorAlert>
    );
  }

  return <div>{/* render data */}</div>;
}
```

## Custom Hooks

Create reusable hooks for common patterns:

```typescript
// hooks/useIrisProject.ts
import { useQuery } from '@tanstack/react-query';
import * as iris from '@/servers/iris-prime';

export function useIrisProject(projectId: string) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => iris.evaluateProject({ projectId }),
    refetchInterval: 30000,
    enabled: Boolean(projectId)
  });
}

// hooks/useIrisMetrics.ts
export function useIrisMetrics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h') {
  return useQuery({
    queryKey: ['metrics', timeRange],
    queryFn: () => iris.getMetrics({ timeRange }),
    refetchInterval: 10000
  });
}

// hooks/useIrisPatterns.ts
export function useIrisPatterns(analysisType: string, projectId?: string) {
  return useQuery({
    queryKey: ['patterns', analysisType, projectId],
    queryFn: () => iris.findPatterns({ analysisType, projectId }),
    enabled: Boolean(analysisType)
  });
}
```

## Benefits

1. **Consistent API**: Same interface as MCP server pattern
2. **Type Safety**: Full TypeScript support
3. **Error Handling**: Unified error types and retry logic
4. **Browser Compatible**: Works in any frontend framework
5. **Easy Testing**: Mock `apiRequest` for unit tests
6. **Auto Retry**: Built-in exponential backoff
7. **Timeout Protection**: Configurable request timeouts

## API Reference

See [`/servers/README.md`](/servers/README.md) for complete API documentation.
