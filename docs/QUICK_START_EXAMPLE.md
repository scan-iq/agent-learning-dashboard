# Quick Start: Using IRIS API in React Dashboard

## 1. Environment Setup

Create `.env.local`:
```bash
VITE_IRIS_API_BASE=http://localhost:3001
```

## 2. Simple Component Example

```typescript
// src/components/ProjectHealth.tsx
import { useQuery } from '@tanstack/react-query';
import * as iris from '@/servers/iris-prime';

export function ProjectHealth({ projectId }: { projectId: string }) {
  const { data: report, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => iris.evaluateProject({ projectId }),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return <div>Loading project health...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="project-health">
      <h2>Health Score: {report.healthScore}/100</h2>
      <div className={`status status-${report.status}`}>
        {report.status.toUpperCase()}
      </div>

      <div className="metrics">
        <div>Accuracy: {(report.metrics.accuracy * 100).toFixed(1)}%</div>
        <div>Performance: {(report.metrics.performance * 100).toFixed(1)}%</div>
        <div>Reliability: {(report.metrics.reliability * 100).toFixed(1)}%</div>
        <div>Latency: {report.metrics.latency}ms</div>
      </div>

      {report.recommendations.length > 0 && (
        <div className="recommendations">
          <h3>Recommendations</h3>
          <ul>
            {report.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

## 3. Dashboard with Multiple Metrics

```typescript
// src/components/Dashboard.tsx
import { useQuery } from '@tanstack/react-query';
import * as iris from '@/servers/iris-prime';

export function Dashboard() {
  // Get global metrics
  const { data: metrics } = useQuery({
    queryKey: ['metrics'],
    queryFn: () => iris.getMetrics({ timeRange: '24h' }),
    refetchInterval: 10000
  });

  // Get patterns
  const { data: patterns } = useQuery({
    queryKey: ['patterns'],
    queryFn: () => iris.findPatterns({ analysisType: 'all' })
  });

  return (
    <div className="dashboard">
      <h1>IRIS Dashboard</h1>

      {metrics && (
        <div className="metrics-grid">
          <MetricCard
            title="Total Projects"
            value={metrics.totalProjects}
          />
          <MetricCard
            title="Healthy"
            value={metrics.healthyProjects}
            color="green"
          />
          <MetricCard
            title="Warning"
            value={metrics.warningProjects}
            color="yellow"
          />
          <MetricCard
            title="Critical"
            value={metrics.criticalProjects}
            color="red"
          />
        </div>
      )}

      {patterns && (
        <div className="patterns">
          <h2>Discovered Patterns ({patterns.patterns.length})</h2>
          {patterns.patterns.slice(0, 5).map(pattern => (
            <div key={pattern.id} className="pattern-card">
              <h3>{pattern.description}</h3>
              <span>Type: {pattern.type}</span>
              <span>Confidence: {(pattern.confidence * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 4. Drift Alert Component

```typescript
// src/components/DriftAlert.tsx
import { useQuery } from '@tanstack/react-query';
import * as iris from '@/servers/iris-prime';

export function DriftAlert({
  expertId,
  version
}: {
  expertId: string;
  version: string;
}) {
  const { data: drift, isLoading } = useQuery({
    queryKey: ['drift', expertId, version],
    queryFn: () => iris.detectDrift({
      expertId,
      version,
      threshold: 0.15
    }),
    refetchInterval: 60000 // Check every minute
  });

  if (isLoading || !drift) return null;

  const severityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };

  return (
    <div className={`drift-alert ${severityColors[drift.severity]}`}>
      <h3>
        {drift.severity === 'critical' ? '🚨' : '⚠️'} Drift Detected
      </h3>
      <p>Drift Score: {(drift.driftScore * 100).toFixed(1)}%</p>
      <p>Severity: {drift.severity}</p>

      {drift.affectedMetrics.length > 0 && (
        <div>
          <strong>Affected Metrics:</strong>
          <ul>
            {drift.affectedMetrics.map(metric => (
              <li key={metric}>{metric}</li>
            ))}
          </ul>
        </div>
      )}

      <p>{drift.description}</p>
    </div>
  );
}
```

## 5. Custom Hook Pattern

```typescript
// src/hooks/useIris.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as iris from '@/servers/iris-prime';

export function useIrisProject(projectId: string) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => iris.evaluateProject({ projectId }),
    enabled: Boolean(projectId),
    refetchInterval: 30000
  });
}

export function useIrisMetrics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h') {
  return useQuery({
    queryKey: ['metrics', timeRange],
    queryFn: () => iris.getMetrics({ timeRange }),
    refetchInterval: 10000
  });
}

export function useTrackEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: iris.submitTelemetry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    }
  });
}

// Usage in component
function MyComponent({ projectId }: { projectId: string }) {
  const { data: project, isLoading } = useIrisProject(projectId);
  const trackEvent = useTrackEvent();

  const handleAction = () => {
    trackEvent.mutate({
      eventType: 'user_action',
      projectId,
      data: { action: 'manual_check' }
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>{project.projectId}</h2>
      <p>Health: {project.healthScore}</p>
      <button onClick={handleAction}>Track Event</button>
    </div>
  );
}
```

## 6. Error Handling

```typescript
// src/components/SafeComponent.tsx
import { useQuery } from '@tanstack/react-query';
import * as iris from '@/servers/iris-prime';
import { IrisApiError } from '@/servers/iris-prime';

export function SafeComponent({ projectId }: { projectId: string }) {
  const { data, error, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => iris.evaluateProject({ projectId }),
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error instanceof IrisApiError && error.status && error.status < 500) {
        return false;
      }
      return failureCount < 3;
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error instanceof IrisApiError) {
    return (
      <div className="error-alert">
        <h3>Error: {error.message}</h3>
        <p>Status: {error.status}</p>
        <p>Code: {error.code}</p>
        {error.details && (
          <pre>{JSON.stringify(error.details, null, 2)}</pre>
        )}
      </div>
    );
  }

  return <div>{/* render data */}</div>;
}
```

## 7. Complete Example: Project Page

```typescript
// src/pages/ProjectPage.tsx
import { useIrisProject, useIrisMetrics } from '@/hooks/useIris';
import * as iris from '@/servers/iris-prime';
import { useQuery } from '@tanstack/react-query';

export function ProjectPage({ projectId }: { projectId: string }) {
  const { data: project, isLoading } = useIrisProject(projectId);
  const { data: metrics } = useIrisMetrics('24h');

  const { data: patterns } = useQuery({
    queryKey: ['patterns', projectId],
    queryFn: () => iris.findPatterns({
      analysisType: 'consensus',
      projectId,
      timeRange: '7d'
    })
  });

  const { data: reflexions } = useQuery({
    queryKey: ['reflexions', projectId],
    queryFn: () => iris.queryReflexions({
      projectId,
      minImpact: 0.7,
      limit: 10
    })
  });

  if (isLoading) {
    return <div className="loading">Loading project...</div>;
  }

  return (
    <div className="project-page">
      <header>
        <h1>{projectId}</h1>
        <div className={`status-badge status-${project.status}`}>
          {project.status}
        </div>
      </header>

      <div className="project-stats">
        <div className="stat">
          <label>Health Score</label>
          <value>{project.healthScore}/100</value>
        </div>
        <div className="stat">
          <label>Accuracy</label>
          <value>{(project.metrics.accuracy * 100).toFixed(1)}%</value>
        </div>
        <div className="stat">
          <label>Latency</label>
          <value>{project.metrics.latency}ms</value>
        </div>
      </div>

      {project.recommendations.length > 0 && (
        <section className="recommendations">
          <h2>Recommendations</h2>
          <ul>
            {project.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </section>
      )}

      {patterns && patterns.patterns.length > 0 && (
        <section className="patterns">
          <h2>Discovered Patterns</h2>
          <div className="pattern-grid">
            {patterns.patterns.map(pattern => (
              <div key={pattern.id} className="pattern-card">
                <h3>{pattern.description}</h3>
                <div className="pattern-meta">
                  <span>Type: {pattern.type}</span>
                  <span>Confidence: {(pattern.confidence * 100).toFixed(0)}%</span>
                  <span>Frequency: {pattern.frequency}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {reflexions && reflexions.patterns.length > 0 && (
        <section className="reflexions">
          <h2>Learning Insights</h2>
          <div className="reflexion-list">
            {reflexions.patterns.map(pattern => (
              <div key={pattern.id} className="reflexion-item">
                <strong>{pattern.pattern}</strong>
                <span>Impact: {(pattern.impact * 100).toFixed(0)}%</span>
                <span>Frequency: {pattern.frequency}x</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

## Next Steps

1. **Set environment variable** in `.env.local`
2. **Import functions** from `@/servers/iris-prime`
3. **Use with React Query** for caching and refetching
4. **Handle errors** with `IrisApiError`
5. **Create custom hooks** for reusability

## API Functions Available

- `evaluateProject()` - Project health evaluation
- `detectDrift()` - Model drift detection
- `findPatterns()` - Pattern discovery
- `getMetrics()` - Global metrics
- `getConsensusLineage()` - Decision lineage
- `queryReflexions()` - Reflexion queries
- `getExpertSignatures()` - Expert signatures
- `submitTelemetry()` - Event tracking

See `/servers/README.md` for complete API reference.
