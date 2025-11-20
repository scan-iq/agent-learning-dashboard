# Developer Quickstart - IRIS Console

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
# Install console dependencies
cd /home/iris/code/experimental/iris-prime-console
npm install

# Install core library dependencies
cd /home/iris/code/experimental/agent-learning-core
npm install
```

### 2. Configure Supabase (Optional)

```bash
cd /home/iris/code/experimental/iris-prime-console
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-key-here
```

**Without Supabase**: The app works fine without credentials - it just shows empty data.

### 3. Run Development Server

```bash
cd /home/iris/code/experimental/iris-prime-console
npm run dev
```

Open http://localhost:8080

## 📊 Data Sources

### Currently Using Real API:
- ✅ Project health scores (from `iris_reports` table)
- ✅ System events (from report history)
- ✅ Anomaly detection (from critical reports)
- ✅ Overview metrics (calculated from reports)

### Still Using Mock Data:
- ⏳ Diagnostic details (will need `diagnostics` table)
- ⏳ Expert performance (will need `expert_signatures` + `telemetry`)
- ⏳ Reflexions (will need `reflexions` table)
- ⏳ Consensus history (will need `consensus_lineage` table)

## 🔧 How to Add New Data Sources

### Step 1: Check if Supabase Function Exists

Look in `/home/iris/code/experimental/agent-learning-core/src/supabase/`:
- `iris-reports.ts` - IRIS evaluation reports ✅
- `signatures.ts` - Expert signatures
- `telemetry.ts` - Performance metrics
- `reflexions.ts` - Learning patterns
- `consensus.ts` - Multi-expert decisions
- `patterns.ts` - Discovered patterns

### Step 2: Create Hook in `src/hooks/useIrisData.ts`

```typescript
export function useExpertPerformance(projectId: string) {
  return useQuery({
    queryKey: ['expert-performance', projectId],
    queryFn: async () => {
      if (!isSupabaseInitialized()) return [];

      const stats = await getExpertStats(projectId);
      return transformToUIFormat(stats);
    },
    refetchInterval: 60000, // 1 minute
    staleTime: 30000, // 30 seconds
  });
}
```

### Step 3: Use in Component

```typescript
const { data: experts, isLoading, error } = useExpertPerformance('my-project');

if (isLoading) return <Skeleton />;
if (error) return <ErrorDisplay error={error} />;

return <ExpertsList experts={experts} />;
```

## 🎨 UI Patterns

### Loading State
```typescript
if (isLoading) {
  return <Skeleton className="h-64 w-full" />;
}
```

### Error State
```typescript
if (error) {
  return (
    <div className="text-destructive">
      <AlertTriangle />
      <p>{error.message}</p>
    </div>
  );
}
```

### Empty State
```typescript
if (!data || data.length === 0) {
  return <EmptyState message="No data available" />;
}
```

## 🔍 Debugging

### Check Supabase Connection
```typescript
import { isSupabaseInitialized } from '@foxruv/agent-learning-core';

console.log('Supabase initialized:', isSupabaseInitialized());
```

### View React Query Cache
Install React Query DevTools:
```bash
npm install @tanstack/react-query-devtools
```

Add to `App.tsx`:
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Inside QueryClientProvider
<ReactQueryDevtools initialIsOpen={false} />
```

### Check Network Requests
1. Open browser DevTools
2. Go to Network tab
3. Filter by "supabase"
4. Watch for API calls

## 📝 Common Tasks

### Add New Metric Card
1. Add to `OverviewMetrics` type in `src/types/iris.ts`
2. Update `useIrisOverview` to calculate metric
3. Add `<MetricCard>` in `Index.tsx`

### Add New Chart
1. Create data transformation function in hook
2. Add query to `useIrisOverview` or create new hook
3. Use `<AnalyticsSection>` or create new component

### Handle Real-time Updates
```typescript
// In hook
refetchInterval: 5000, // Refetch every 5 seconds

// Or use Supabase subscriptions (future)
supabase
  .channel('iris-reports')
  .on('postgres_changes', {}, handleChange)
  .subscribe();
```

## 🧪 Testing

### Test with Real Data
1. Ensure Supabase has data in `iris_reports` table
2. Configure `.env` with credentials
3. Run app and verify data displays

### Test without Supabase
1. Remove credentials from `.env`
2. App should show empty state
3. No errors in console (just warnings)

### Test Error Handling
1. Use invalid Supabase URL
2. Should show error state with retry button

## 📚 Key Files

- `src/App.tsx` - Supabase initialization
- `src/hooks/useIrisData.ts` - All data fetching hooks
- `src/pages/Index.tsx` - Main dashboard component
- `vite.config.ts` - Alias configuration
- `tsconfig.json` - TypeScript paths

## 🎯 Best Practices

1. **Always check Supabase initialization** before queries
2. **Use React Query** for all data fetching
3. **Transform data in hooks** not in components
4. **Handle all states**: loading, error, empty, success
5. **Set appropriate refetch intervals** (balance freshness vs performance)
6. **Use TypeScript** for type safety
7. **Log errors** but don't crash the app

## 🚨 Troubleshooting

### "Module not found: @foxruv/agent-learning-core"
- Check `vite.config.ts` has the alias
- Check `tsconfig.json` has the path
- Restart dev server

### "Supabase is not initialized"
- Check `.env` has credentials
- Check `App.tsx` calls `initSupabase()`
- Check browser console for init errors

### Data not showing
- Check Supabase has data in tables
- Check network tab for API calls
- Check React Query DevTools for cache state
- Check browser console for errors

### Build fails
- Check TypeScript errors: `npm run build`
- Check imports are correct
- Check all dependencies installed

## 🎓 Learn More

- [React Query Docs](https://tanstack.com/query/latest)
- [Supabase Docs](https://supabase.com/docs)
- [Agent Learning Core](../agent-learning-core/README.md)
- [IRIS Architecture](./TECHNICAL_GUIDE.md)

## 💡 Pro Tips

1. Use React Query's `staleTime` to reduce unnecessary refetches
2. Set longer `refetchInterval` for expensive queries
3. Use `enabled: false` to delay queries until needed
4. Transform data in hooks to keep components clean
5. Use Skeleton components for smooth loading UX
6. Always provide fallback/empty states
