# IRIS Prime Console - React Query Hooks Usage Guide

This guide explains how to use the React Query hooks to fetch real data from the IRIS API.

## Setup

### 1. Configure API Base URL

Create a `.env` file in the project root:

```bash
VITE_API_BASE=http://localhost:3000
VITE_WS_BASE=ws://localhost:3000
```

### 2. Wrap App with QueryClientProvider

Update `main.tsx` to include the QueryClient provider:

```tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
```

## Data Fetching Hooks

### Overview Metrics

```tsx
import { useIrisOverview } from '@/hooks';

function Dashboard() {
  const { data, isLoading, error, refetch } = useIrisOverview();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Total Projects: {data.total_projects}</h2>
      <h2>Healthy: {data.healthy_projects}</h2>
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

**Auto-refresh:** This hook automatically refetches every 30 seconds.

### Projects List

```tsx
import { useIrisProjects } from '@/hooks';

function ProjectsList() {
  const { data: projects, isLoading } = useIrisProjects();

  return (
    <div>
      {projects?.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

### Project Details

```tsx
import { useProjectDetails } from '@/hooks';

function ProjectDetails({ projectId }: { projectId: string | null }) {
  const { data, isLoading } = useProjectDetails(projectId);

  // Query is automatically disabled when projectId is null
  if (!projectId) return null;
  if (isLoading) return <div>Loading details...</div>;

  return (
    <div>
      <h2>{data?.name}</h2>
      <p>Health: {data?.health_score}%</p>
      <p>Success Rate: {data?.success_rate}%</p>
    </div>
  );
}
```

### Events Feed

```tsx
import { useIrisEvents } from '@/hooks';

function EventsFeed() {
  const { data: events } = useIrisEvents(50); // Limit to 50 events

  return (
    <ul>
      {events?.map(event => (
        <li key={event.id}>
          <span>{event.event_type}</span>: {event.message}
        </li>
      ))}
    </ul>
  );
}
```

**Auto-refresh:** This hook refetches every 15 seconds.

### Anomalies

```tsx
import { useAnomalies } from '@/hooks';

function AnomaliesPanel() {
  const { data: anomalies } = useAnomalies();

  return (
    <div>
      {anomalies?.map(anomaly => (
        <AnomalyCard
          key={anomaly.id}
          anomaly={anomaly}
          severity={anomaly.severity}
        />
      ))}
    </div>
  );
}
```

**Auto-refresh:** This hook refetches every 20 seconds.

### Patterns

```tsx
import { usePatterns } from '@/hooks';

function PatternsView({ projectId }: { projectId?: string }) {
  // Get patterns for specific project or all patterns
  const { data: patterns } = usePatterns(projectId);

  return (
    <div>
      {patterns?.map(pattern => (
        <div key={pattern.id}>
          <h4>{pattern.pattern_type}</h4>
          <p>{pattern.description}</p>
          <p>Impact: {pattern.impact_score}</p>
        </div>
      ))}
    </div>
  );
}
```

### System Health

```tsx
import { useSystemHealth } from '@/hooks';

function SystemHealthIndicator() {
  const { data: health } = useSystemHealth();

  const statusColor = health?.status === 'healthy' ? 'green' :
                      health?.status === 'degraded' ? 'yellow' : 'red';

  return (
    <div style={{ color: statusColor }}>
      <h3>System: {health?.status}</h3>
      <p>CPU: {health?.metrics.cpu_usage}%</p>
      <p>Memory: {health?.metrics.memory_usage}%</p>
    </div>
  );
}
```

**Auto-refresh:** This hook refetches every 10 seconds.

## Mutation Hooks

### Retrain Expert

```tsx
import { useRetrainExpert } from '@/hooks';

function RetrainButton({ projectId }: { projectId: string }) {
  const { mutate, isPending } = useRetrainExpert();

  const handleRetrain = () => {
    mutate({
      project_id: projectId,
      config: {
        epochs: 50,
        learning_rate: 0.001,
      }
    });
  };

  return (
    <button onClick={handleRetrain} disabled={isPending}>
      {isPending ? 'Retraining...' : 'Retrain Expert'}
    </button>
  );
}
```

### Execute Evaluation

```tsx
import { useExecuteEvaluation } from '@/hooks';

function EvaluateAllButton() {
  const { mutate, isPending } = useExecuteEvaluation();

  const handleEvaluate = () => {
    mutate({
      include_consensus: true,
      include_reflexions: true,
    });
  };

  return (
    <button onClick={handleEvaluate} disabled={isPending}>
      {isPending ? 'Evaluating...' : 'Evaluate All Projects'}
    </button>
  );
}
```

### Send Event

```tsx
import { useSendEvent } from '@/hooks';

function LogEventButton() {
  const { mutate } = useSendEvent();

  const logCustomEvent = () => {
    mutate({
      project: 'nfl-predictor',
      event_type: 'evaluation',
      severity: 'info',
      message: 'Manual evaluation triggered',
      metadata: {
        triggered_by: 'user',
        source: 'dashboard',
      }
    });
  };

  return <button onClick={logCustomEvent}>Log Event</button>;
}
```

### Execute Remediation

```tsx
import { useExecuteRemediation } from '@/hooks';

function RemediateButton({ anomalyId, actionId }: { anomalyId: string, actionId: string }) {
  const { mutate, isPending } = useExecuteRemediation();

  const handleRemediate = () => {
    mutate({
      anomaly_id: anomalyId,
      action_id: actionId,
      dry_run: false, // Set to true for testing
    });
  };

  return (
    <button onClick={handleRemediate} disabled={isPending}>
      {isPending ? 'Executing...' : 'Execute Remediation'}
    </button>
  );
}
```

### Rotate Expert

```tsx
import { useRotateExpert } from '@/hooks';

function RotateExpertButton({ projectId }: { projectId: string }) {
  const { mutate, isPending } = useRotateExpert();

  return (
    <button
      onClick={() => mutate({ project_id: projectId, strategy: 'performance' })}
      disabled={isPending}
    >
      {isPending ? 'Rotating...' : 'Rotate Expert'}
    </button>
  );
}
```

## WebSocket Hooks

### Real-Time Updates

```tsx
import { useIrisWebSocket } from '@/hooks';

function RealTimeDashboard() {
  const { isConnected, lastMessage, connectionState } = useIrisWebSocket({
    autoConnect: true,
    onMessage: (msg) => {
      console.log('Received:', msg.type, msg.data);
    },
    onConnect: () => {
      console.log('WebSocket connected');
    },
  });

  return (
    <div>
      <div>Status: {connectionState}</div>
      {lastMessage && (
        <div>Last Update: {lastMessage.type}</div>
      )}
    </div>
  );
}
```

### Subscribe to Specific Events

```tsx
import { useIrisWebSocketSubscription } from '@/hooks';

function AnomalyAlerts() {
  useIrisWebSocketSubscription('anomaly_detected', (data) => {
    // Show notification when anomaly is detected
    showNotification({
      title: 'New Anomaly Detected',
      message: data.description,
      severity: data.severity,
    });
  });

  return <div>Real-time anomaly monitoring active</div>;
}
```

### Remediation Stream

```tsx
import { useRemediationStream } from '@/hooks';

function RemediationProgress({ executionId }: { executionId: string | null }) {
  const { progress, currentStep, status } = useRemediationStream(executionId);

  if (!executionId) return null;

  return (
    <div>
      <h3>Status: {status}</h3>
      <progress value={progress} max={100} />
      <p>{currentStep}</p>
    </div>
  );
}
```

## Advanced Patterns

### Optimistic Updates

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { useAcknowledgeAnomaly, irisQueryKeys } from '@/hooks';

function AcknowledgeButton({ anomaly }: { anomaly: Anomaly }) {
  const queryClient = useQueryClient();
  const { mutate } = useAcknowledgeAnomaly();

  const handleAcknowledge = () => {
    mutate(
      {
        anomaly_id: anomaly.id,
        acknowledged_by: 'current-user',
      },
      {
        // Optimistic update
        onMutate: async () => {
          await queryClient.cancelQueries({ queryKey: irisQueryKeys.anomalies() });

          const previousAnomalies = queryClient.getQueryData(irisQueryKeys.anomalies());

          queryClient.setQueryData(irisQueryKeys.anomalies(), (old: Anomaly[]) =>
            old?.filter(a => a.id !== anomaly.id)
          );

          return { previousAnomalies };
        },
        onError: (err, variables, context) => {
          // Rollback on error
          queryClient.setQueryData(irisQueryKeys.anomalies(), context?.previousAnomalies);
        },
      }
    );
  };

  return <button onClick={handleAcknowledge}>Acknowledge</button>;
}
```

### Manual Refetch

```tsx
import { useIrisProjects } from '@/hooks';

function RefreshableProjects() {
  const { data, refetch, isFetching } = useIrisProjects();

  return (
    <div>
      <button onClick={() => refetch()} disabled={isFetching}>
        {isFetching ? 'Refreshing...' : 'Refresh Projects'}
      </button>
      {/* Projects display */}
    </div>
  );
}
```

### Conditional Queries

```tsx
import { useProjectDetails } from '@/hooks';

function ConditionalDetails({ shouldFetch, projectId }: { shouldFetch: boolean, projectId: string }) {
  const { data } = useProjectDetails(shouldFetch ? projectId : null);

  // Query only runs when shouldFetch is true
  return data ? <div>{data.name}</div> : null;
}
```

## Error Handling

All hooks include built-in error handling with toast notifications. You can also handle errors manually:

```tsx
import { useIrisOverview } from '@/hooks';

function ErrorHandlingExample() {
  const { data, error, isError, refetch } = useIrisOverview();

  if (isError) {
    return (
      <div className="error-container">
        <h3>Failed to load data</h3>
        <p>{error.message}</p>
        <button onClick={() => refetch()}>Try Again</button>
      </div>
    );
  }

  return <div>{/* Normal content */}</div>;
}
```

## Loading States

```tsx
import { useIrisProjects, useIrisOverview } from '@/hooks';

function MultiQueryLoading() {
  const overview = useIrisOverview();
  const projects = useIrisProjects();

  const isLoading = overview.isLoading || projects.isLoading;
  const isError = overview.isError || projects.isError;

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorDisplay />;

  return (
    <div>
      {/* Render with overview.data and projects.data */}
    </div>
  );
}
```

## Testing

For testing, you can mock the hooks:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

test('loads and displays data', async () => {
  const { findByText } = render(<MyComponent />, { wrapper });
  const element = await findByText(/expected text/i);
  expect(element).toBeInTheDocument();
});
```

## API Reference

See the TypeScript definitions in each hook file for complete type information:

- `/src/hooks/useIrisData.ts` - All data fetching hooks
- `/src/hooks/useIrisMutations.ts` - All mutation hooks
- `/src/hooks/useIrisWebSocket.ts` - WebSocket and real-time hooks
