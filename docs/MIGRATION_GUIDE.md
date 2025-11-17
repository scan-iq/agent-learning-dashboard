# Migration Guide: Mock Data → Real API Hooks

This guide shows how to replace mock data with real API hooks in existing components.

## Quick Reference

| Mock Data | Real Hook | Auto-Refresh |
|-----------|-----------|--------------|
| `mockOverviewMetrics` | `useIrisOverview()` | 30s |
| `mockProjects` | `useIrisOverview().data.projects` | 30s |
| `mockEvents` | `useIrisOverview().data.events` | 30s |
| `mockAnomalies` | `useIrisOverview().data.anomalies` | 30s |
| `mockProjectDetails[id]` | `useProjectDetails(id)` | On-demand |

## Migration Examples

### 1. Dashboard Overview (Index.tsx)

**Current Code (Lines 22, 74-76, 681-706):**
```typescript
import { mockOverviewMetrics, mockProjects, mockEvents, mockAnomalies } from '@/lib/mock-data';

// Usage
<MetricCard
  title="Total Projects"
  value={mockOverviewMetrics.total_projects}
  icon={Activity}
/>

<MetricCard
  title="Healthy Projects"
  value={mockOverviewMetrics.healthy_projects}
  icon={CheckCircle2}
/>

{mockProjects.map((project) => (
  <ProjectCard key={project.id} project={project} />
))}

<AnomalyDetectionCard anomalies={mockAnomalies} onInvestigate={handleInvestigate} />
```

**New Code:**
```typescript
import { useIrisOverview } from '@/hooks';

function Index() {
  const { data, isLoading, error } = useIrisOverview();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading IRIS data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-4" />
          <p>Failed to load data: {error.message}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const { metrics, projects, events, anomalies } = data;

  return (
    <div>
      {/* Overview Metrics */}
      <MetricCard
        title="Total Projects"
        value={metrics.total_projects}
        icon={Activity}
      />

      <MetricCard
        title="Healthy Projects"
        value={metrics.healthy_projects}
        icon={CheckCircle2}
        trend={{ value: 12, direction: 'up' }}
      />

      {/* Projects */}
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}

      {/* Anomalies */}
      <AnomalyDetectionCard anomalies={anomalies} onInvestigate={handleInvestigate} />

      {/* Events */}
      <EventsFeed events={events} />
    </div>
  );
}
```

### 2. Project Details Dialog

**Current Code:**
```typescript
const selectedProject = selectedProjectId ? mockProjectDetails[selectedProjectId] : null;

<ProjectDetailsDialog
  project={selectedProject}
  open={selectedProjectId !== null}
  onClose={() => setSelectedProjectId(null)}
/>
```

**New Code:**
```typescript
import { useProjectDetails } from '@/hooks';

function Index() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { data: projectDetails, isLoading: projectLoading } = useProjectDetails(selectedProjectId);

  return (
    <ProjectDetailsDialog
      project={projectDetails}
      isLoading={projectLoading}
      open={selectedProjectId !== null}
      onClose={() => setSelectedProjectId(null)}
    />
  );
}
```

### 3. Events Feed Component

**Current Code:**
```typescript
// EventsFeed.tsx
interface EventsFeedProps {
  events: IrisEvent[];
}

export function EventsFeed({ events }: EventsFeedProps) {
  return (
    <div>
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

// Usage in parent
<EventsFeed events={mockEvents} />
```

**New Code (Option 1: Pass data from parent):**
```typescript
// Parent component
const { data } = useIrisOverview();

<EventsFeed events={data.events} />
```

**New Code (Option 2: Self-contained component):**
```typescript
// EventsFeed.tsx
import { useIrisOverview } from '@/hooks';

export function EventsFeed() {
  const { data, isLoading } = useIrisOverview();

  if (isLoading) return <Skeleton />;

  return (
    <div>
      {data.events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

// Usage in parent (no props needed)
<EventsFeed />
```

### 4. Action Buttons with Mutations

**Add Retrain Button:**
```typescript
import { useRetrainExpert } from '@/hooks';

function ProjectCard({ project }: { project: Project }) {
  const { mutate: retrain, isPending } = useRetrainExpert();

  const handleRetrain = () => {
    retrain({
      project_id: project.id,
      config: {
        epochs: 50,
        learning_rate: 0.001,
      }
    });
  };

  return (
    <div>
      <h3>{project.name}</h3>
      <Button onClick={handleRetrain} disabled={isPending}>
        {isPending ? 'Retraining...' : 'Retrain Expert'}
      </Button>
    </div>
  );
}
```

**Add Evaluate All Button:**
```typescript
import { useExecuteEvaluation } from '@/hooks';

function Header() {
  const { mutate: evaluate, isPending } = useExecuteEvaluation();

  return (
    <Button
      onClick={() => evaluate({ include_consensus: true })}
      disabled={isPending}
    >
      {isPending ? 'Evaluating...' : 'Evaluate All'}
    </Button>
  );
}
```

### 5. Real-Time Updates

**Add WebSocket for Live Data:**
```typescript
import { useIrisWebSocket, useIrisOverview } from '@/hooks';

function Dashboard() {
  const { data, refetch } = useIrisOverview();

  // Connect to WebSocket for real-time updates
  const { isConnected, lastMessage } = useIrisWebSocket({
    autoConnect: true,
    onMessage: (msg) => {
      console.log('Received update:', msg.type);
      // Queries auto-invalidate, but you can manually refetch too
      if (msg.type === 'project_update') {
        refetch();
      }
    }
  });

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm">
          {isConnected ? 'Live Updates Active' : 'Disconnected'}
        </span>
      </div>

      {/* Dashboard content */}
    </div>
  );
}
```

## Step-by-Step Migration Process

### Step 1: Update Imports

**Replace:**
```typescript
import { mockOverviewMetrics, mockProjects, mockEvents } from '@/lib/mock-data';
```

**With:**
```typescript
import { useIrisOverview, useProjectDetails } from '@/hooks';
```

### Step 2: Add Hook to Component

**Add at top of component:**
```typescript
function Dashboard() {
  const { data, isLoading, error, refetch } = useIrisOverview();

  // ... rest of component
}
```

### Step 3: Add Loading State

```typescript
if (isLoading) {
  return <LoadingSpinner />;
}
```

### Step 4: Add Error State

```typescript
if (error) {
  return (
    <ErrorDisplay
      message={error.message}
      onRetry={() => refetch()}
    />
  );
}
```

### Step 5: Replace Mock References

**Find and replace:**
- `mockOverviewMetrics` → `data.metrics`
- `mockProjects` → `data.projects`
- `mockEvents` → `data.events`
- `mockAnomalies` → `data.anomalies`

### Step 6: Test

```bash
npm run dev
```

Open console and verify:
1. ✅ Data loads from Supabase
2. ✅ Auto-refresh works (30s interval)
3. ✅ Error handling works (disconnect backend)
4. ✅ No console errors

## Common Patterns

### Pattern 1: Show Refresh Indicator

```typescript
const { data, isFetching, refetch } = useIrisOverview();

return (
  <div>
    <div className="flex justify-between items-center">
      <h2>Dashboard</h2>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => refetch()}
        disabled={isFetching}
      >
        <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
      </Button>
    </div>
    {/* Content */}
  </div>
);
```

### Pattern 2: Skeleton Loader

```typescript
import { Skeleton } from '@/components/ui/skeleton';

if (isLoading) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
```

### Pattern 3: Empty State

```typescript
const { data } = useIrisOverview();

if (data.projects.length === 0) {
  return (
    <div className="text-center py-12">
      <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
      <p className="text-muted-foreground">
        Start by creating your first IRIS project
      </p>
      <Button className="mt-4">Create Project</Button>
    </div>
  );
}
```

### Pattern 4: Conditional Queries

```typescript
// Only fetch project details when dialog is open
const [dialogOpen, setDialogOpen] = useState(false);
const [projectId, setProjectId] = useState<string | null>(null);

const { data } = useProjectDetails(dialogOpen ? projectId : null);
```

### Pattern 5: Manual Invalidation

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { irisQueryKeys } from '@/hooks';

function RefreshButton() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: irisQueryKeys.all });
  };

  return <Button onClick={handleRefresh}>Refresh All</Button>;
}
```

## Testing Checklist

After migration, verify:

- [ ] **Data loads correctly** from Supabase
- [ ] **Loading states** show appropriate UI
- [ ] **Error states** handle failures gracefully
- [ ] **Auto-refresh works** (check network tab)
- [ ] **Manual refresh** button works
- [ ] **Project selection** loads details
- [ ] **Mutations work** (retrain, evaluate, etc.)
- [ ] **Toast notifications** appear on actions
- [ ] **WebSocket connects** (if implemented)
- [ ] **No console errors**
- [ ] **TypeScript compiles** without errors
- [ ] **Performance** is acceptable

## Troubleshooting

### Issue: "Supabase not initialized"

**Solution:**
```typescript
// In your main.tsx or App.tsx
import { initializeSupabase } from '@foxruv/agent-learning-core';

// Initialize before rendering
await initializeSupabase({
  url: import.meta.env.VITE_SUPABASE_URL,
  key: import.meta.env.VITE_SUPABASE_KEY
});
```

### Issue: Query never resolves

**Check:**
1. Network tab - are requests being made?
2. Console errors - any Supabase errors?
3. Environment variables - are they set?

**Fix:**
```typescript
const { data, isLoading, error } = useIrisOverview();

console.log('Loading:', isLoading);
console.log('Error:', error);
console.log('Data:', data);
```

### Issue: Stale data after mutation

**Solution:**
```typescript
// Mutations auto-invalidate, but you can force:
const queryClient = useQueryClient();
const { mutate } = useRetrainExpert();

mutate(params, {
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: irisQueryKeys.projects() });
  }
});
```

## Performance Tips

1. **Avoid unnecessary re-renders:**
```typescript
// Instead of destructuring everything
const { data, isLoading, error, isFetching, isRefetching, ... } = useIrisOverview();

// Only get what you need
const { data, isLoading } = useIrisOverview();
```

2. **Use React.memo for expensive components:**
```typescript
const ProjectCard = React.memo(({ project }) => {
  // Component code
});
```

3. **Prefetch on hover:**
```typescript
const queryClient = useQueryClient();

const handleHover = (projectId: string) => {
  queryClient.prefetchQuery({
    queryKey: irisQueryKeys.project(projectId),
    queryFn: () => fetchProjectDetails(projectId)
  });
};

<ProjectCard onMouseEnter={() => handleHover(project.id)} />
```

## Next Steps

1. ✅ Replace all mock data imports
2. ✅ Add loading/error states
3. ✅ Test with real backend
4. ✅ Add WebSocket for real-time
5. ✅ Implement optimistic updates
6. ✅ Add integration tests
7. ✅ Monitor performance
8. ✅ Deploy to production

**Happy migrating!** 🚀
