# Task Split: Real Data Integration

**Date:** 2025-11-17  
**Repos:** `iris-prime-console` (frontend) + `agent-learning-core` (backend)

---

## 🎯 Overview

Both repos need changes, but they serve different purposes:

- **`agent-learning-core`**: Add helper functions for data aggregation and transformation
- **`iris-prime-console`**: Create hooks, replace mock data, wire up buttons

---

## 📦 **REPO 1: `agent-learning-core`** (Backend/NPM Package)

### **Goal:** Add helper functions for dashboard data aggregation

### **Tasks:**

#### **1. Add Project-Level Aggregation Functions**

**File:** `src/supabase/iris-reports.ts` (or new `src/supabase/dashboard-helpers.ts`)

**Functions to Add:**

```typescript
/**
 * Get all projects with their latest health status
 * Returns array of projects with health scores, status, etc.
 */
export async function getAllProjectsSummary(): Promise<Array<{
  project: string;
  latestHealthScore: number;
  overallHealth: 'healthy' | 'degraded' | 'critical';
  lastReportDate: string;
  totalRuns: number;
  avgSuccessRate: number;
  activeExperts: number;
  totalReflexions: number;
}>>

/**
 * Get overview metrics aggregated across all projects
 * Used for dashboard top-level metrics
 */
export async function getOverviewMetrics(): Promise<{
  total_projects: number;
  healthy_projects: number;
  warning_projects: number;
  critical_projects: number;
  total_runs_today: number;
  avg_success_rate: number;
  active_experts: number;
  total_reflexions: number;
}>

/**
 * Transform StoredIrisReport to frontend Project type
 */
export function transformReportToProject(report: StoredIrisReport): Project
```

**Why:** Current functions are project-specific. Dashboard needs cross-project aggregation.

---

#### **2. Add Expert Stats Aggregation by Project**

**File:** `src/supabase/telemetry.ts`

**Functions to Add:**

```typescript
/**
 * Get all expert stats for a project
 * Aggregates stats for all experts in a project
 */
export async function getProjectExpertStats(
  projectId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
  }
): Promise<Array<{
  expertId: string;
  expertName: string;
  accuracy: number;
  calls: number;
  latency: number;
  successRate: number;
}>>

/**
 * Get expert performance trends over time
 * Returns time-series data for charts
 */
export async function getExpertPerformanceTrends(
  projectId: string,
  expertId: string,
  hours: number = 24
): Promise<Array<{
  time: string;
  accuracy: number;
  latency: number;
  calls: number;
}>>
```

**Why:** `getExpertStats()` only works for one expert. Dashboard needs all experts for a project.

---

#### **3. Add Analytics Data Helpers**

**File:** `src/supabase/analytics.ts` (new file)

**Functions to Add:**

```typescript
/**
 * Get health trends over time for a project
 * Returns time-series data for health score chart
 */
export async function getHealthTrends(
  projectId: string,
  hours: number = 24
): Promise<Array<{
  time: string;
  healthScore: number;
}>>

/**
 * Get success rate trends over time
 * Returns time-series data for success rate chart
 */
export async function getSuccessRateTrends(
  projectId: string,
  hours: number = 24
): Promise<Array<{
  time: string;
  successRate: number;
}>>

/**
 * Get latency trends over time
 * Returns time-series data for latency chart
 */
export async function getLatencyTrends(
  projectId: string,
  hours: number = 24
): Promise<Array<{
  time: string;
  avgLatency: number;
}>>

/**
 * Get reflexion impact statistics
 * Returns reflexion usage and impact metrics
 */
export async function getReflexionImpactStats(
  projectId: string
): Promise<Array<{
  category: string;
  count: number;
  avg_impact: number;
}>>
```

**Why:** Dashboard charts need time-series data, not just aggregated stats.

---

#### **4. Add Events/Anomalies Helpers**

**File:** `src/supabase/events.ts` (new file, or add to existing)

**Functions to Add:**

```typescript
/**
 * Get recent events for dashboard feed
 * Combines data from iris_reports, model_run_log, etc.
 */
export async function getRecentEvents(
  projectId?: string,
  limit: number = 20
): Promise<Array<{
  id: string;
  timestamp: string;
  project: string;
  event_type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  metadata?: Record<string, any>;
}>>

/**
 * Get anomalies detected from drift detection
 * Returns anomalies from recent drift checks
 */
export async function getAnomalies(
  projectId?: string,
  limit: number = 20
): Promise<Array<{
  id: string;
  timestamp: string;
  project: string;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  metric: string;
  value: number;
  expected: number;
  deviation: number;
  description: string;
  resolved: boolean;
}>>
```

**Why:** Dashboard needs events feed and anomaly list, but current functions don't aggregate this.

---

#### **5. Export New Functions**

**File:** `src/supabase/index.ts`

**Add exports:**

```typescript
// Dashboard helpers
export {
  getAllProjectsSummary,
  getOverviewMetrics,
  transformReportToProject,
} from './iris-reports';

export {
  getProjectExpertStats,
  getExpertPerformanceTrends,
} from './telemetry';

export {
  getHealthTrends,
  getSuccessRateTrends,
  getLatencyTrends,
  getReflexionImpactStats,
} from './analytics';

export {
  getRecentEvents,
  getAnomalies,
} from './events';
```

---

### **Summary for `agent-learning-core`:**

**Files to Create/Modify:**

1. ✅ `src/supabase/iris-reports.ts` - Add aggregation functions
2. ✅ `src/supabase/telemetry.ts` - Add project-level expert stats
3. ✅ `src/supabase/analytics.ts` - **NEW** - Analytics helpers
4. ✅ `src/supabase/events.ts` - **NEW** - Events/anomalies helpers
5. ✅ `src/supabase/index.ts` - Export new functions

**Estimated Effort:** 4-6 hours

---

## 🎨 **REPO 2: `iris-prime-console`** (Frontend)

### **Goal:** Replace mock data with real hooks and wire up buttons

### **Tasks:**

#### **1. Update `useIrisOverview()` Hook**

**File:** `src/hooks/useIrisData.ts`

**Changes:**

- Import functions from `@foxruv/agent-learning-core`
- Transform Supabase data to match `IrisOverviewData` interface
- Calculate metrics from real data (not zeros)
- Transform projects, events, anomalies from real data

**Example:**

```typescript
import { 
  getOverviewMetrics, 
  getAllProjectsSummary,
  getRecentEvents,
  getAnomalies 
} from '@foxruv/agent-learning-core';

export function useIrisOverview(): UseQueryResult<IrisOverviewData> {
  return useQuery({
    queryKey: irisQueryKeys.overview,
    queryFn: async () => {
      const [metrics, projects, events, anomalies] = await Promise.all([
        getOverviewMetrics(),
        getAllProjectsSummary(),
        getRecentEvents(undefined, 20),
        getAnomalies(undefined, 20),
      ]);

      return {
        metrics,
        projects: projects.map(transformToProject),
        events: events.map(transformToEvent),
        anomalies: anomalies.map(transformToAnomaly),
      };
    },
    refetchInterval: 30000,
  });
}
```

---

#### **2. Create New Hooks for Project Details**

**File:** `src/hooks/useIrisData.ts`

**Add:**

```typescript
export function useProjectDetails(projectId: string | null) {
  return useQuery({
    queryKey: irisQueryKeys.project(projectId || ''),
    queryFn: async () => {
      if (!projectId) return null;
      const report = await getLatestIrisReport(projectId);
      const history = await getIrisReportHistory({ projectId, limit: 10 });
      const expertStats = await getProjectExpertStats(projectId);
      // Transform to ProjectDetails type
      return transformToProjectDetails(report, history, expertStats);
    },
    enabled: !!projectId,
  });
}
```

---

#### **3. Create Hooks for Analytics Data**

**File:** `src/hooks/useAnalytics.ts` (new file)

**Add:**

```typescript
import { useQuery } from '@tanstack/react-query';
import {
  getHealthTrends,
  getSuccessRateTrends,
  getExpertPerformanceTrends,
  getLatencyTrends,
  getReflexionImpactStats,
} from '@foxruv/agent-learning-core';

export function useHealthTrends(projectId: string, hours = 24) {
  return useQuery({
    queryKey: ['health-trends', projectId, hours],
    queryFn: () => getHealthTrends(projectId, hours),
  });
}

export function useSuccessRateTrends(projectId: string, hours = 24) {
  return useQuery({
    queryKey: ['success-rate-trends', projectId, hours],
    queryFn: () => getSuccessRateTrends(projectId, hours),
  });
}

export function useExpertPerformance(projectId: string) {
  return useQuery({
    queryKey: ['expert-performance', projectId],
    queryFn: () => getProjectExpertStats(projectId),
  });
}

export function useLatencyTrends(projectId: string, hours = 24) {
  return useQuery({
    queryKey: ['latency-trends', projectId, hours],
    queryFn: () => getLatencyTrends(projectId, hours),
  });
}

export function useReflexionImpact(projectId: string) {
  return useQuery({
    queryKey: ['reflexion-impact', projectId],
    queryFn: () => getReflexionImpactStats(projectId),
  });
}
```

---

#### **4. Replace Mock Data in `Index.tsx`**

**File:** `src/pages/Index.tsx`

**Changes:**

- Remove `mockProjectDetails` import
- Remove `mockDiagnosticData` import
- Use `useProjectDetails()` hook instead
- Use `useAnomalies()` hook for diagnostic data
- Replace all `mock*` variable names with real data names

**Example:**

```typescript
// OLD:
const selectedProject = selectedProjectId ? mockProjectDetails[selectedProjectId] : null;

// NEW:
const { data: selectedProject } = useProjectDetails(selectedProjectId);
```

---

#### **5. Replace Mock Data in `AnalyticsSection.tsx`**

**File:** `src/components/dashboard/AnalyticsSection.tsx`

**Changes:**

- Remove all `mock*` imports
- Use analytics hooks instead
- Pass project IDs to hooks
- Handle loading/error states

**Example:**

```typescript
// OLD:
import { mockHealthTrendsWithAnomalies } from '@/lib/mock-data';
<AreaChart data={mockHealthTrendsWithAnomalies} />

// NEW:
const { data: healthTrends, isLoading } = useHealthTrends(projectId, 24);
if (isLoading) return <Skeleton />;
<AreaChart data={healthTrends} />
```

---

#### **6. Wire Up Button Handlers**

**File:** `src/pages/Index.tsx`

**Add onClick handlers:**

```typescript
// Refresh button
const handleRefresh = () => {
  queryClient.invalidateQueries({ queryKey: irisQueryKeys.overview });
  toast.success('Data refreshed');
};

// Evaluate All button
const handleEvaluateAll = async () => {
  toast.loading('Evaluating all projects...');
  try {
    // Call irisPrime.evaluateAllProjects() or API endpoint
    await fetch('/api/iris/evaluate-all', { method: 'POST' });
    queryClient.invalidateQueries({ queryKey: irisQueryKeys.overview });
    toast.success('All projects evaluated');
  } catch (error) {
    toast.error('Evaluation failed');
  }
};

// Quick Actions
const handleAutoRetrain = async () => {
  // Call retrain API
};

const handleFindPatterns = async () => {
  // Open patterns dialog or navigate
};

const handleRotationReport = async () => {
  // Generate rotation report
};
```

---

#### **7. Update `AnomalyInvestigationDialog`**

**File:** `src/components/dashboard/AnomalyInvestigationDialog.tsx`

**Changes:**

- Use `detectDrift()` for diagnostic data
- Use `getRecentLogs()` for logs
- Use `getExpertStats()` for expert traces
- Remove `mockDiagnosticData` dependency

---

### **Summary for `iris-prime-console`:**

**Files to Create/Modify:**

1. ✅ `src/hooks/useIrisData.ts` - Update existing hooks
2. ✅ `src/hooks/useAnalytics.ts` - **NEW** - Analytics hooks
3. ✅ `src/pages/Index.tsx` - Replace mock data, wire up buttons
4. ✅ `src/components/dashboard/AnalyticsSection.tsx` - Use real hooks
5. ✅ `src/components/dashboard/AnomalyInvestigationDialog.tsx` - Use real data
6. ✅ `src/components/dashboard/ProjectDetailsDialog.tsx` - Use real data

**Estimated Effort:** 6-8 hours

---

## 🔄 **Dependencies & Order**

### **Phase 1: Backend First** (`agent-learning-core`)

1. Add aggregation functions
2. Add analytics helpers
3. Add events/anomalies helpers
4. Export all new functions
5. **Test:** Verify functions work with Supabase

### **Phase 2: Frontend Integration** (`iris-prime-console`)

1. Update `useIrisOverview()` to use new functions
2. Create analytics hooks
3. Replace mock data in components
4. Wire up button handlers
5. **Test:** Verify dashboard shows real data

---

## ✅ **Testing Checklist**

### **agent-learning-core:**

- [ ] `getOverviewMetrics()` returns correct structure
- [ ] `getAllProjectsSummary()` returns all projects
- [ ] `getProjectExpertStats()` aggregates correctly
- [ ] Analytics functions return time-series data
- [ ] Events/anomalies functions return correct format
- [ ] All functions exported from `index.ts`

### **iris-prime-console:**

- [ ] Dashboard shows real metrics (not zeros)
- [ ] Projects list shows real projects
- [ ] Events feed shows real events
- [ ] Anomalies show real anomalies
- [ ] Analytics charts show real data
- [ ] Project details dialog shows real data
- [ ] Buttons trigger real actions
- [ ] Loading/error states work correctly

---

## 📝 **Notes**

1. **Data Transformation:** Both repos need transformation functions to convert Supabase types to frontend types
2. **Error Handling:** Add proper error handling and fallbacks
3. **Performance:** Consider caching and pagination for large datasets
4. **Type Safety:** Ensure TypeScript types match between repos
5. **Backward Compatibility:** Keep mock data as fallback until real data is stable

---

## 🚀 **Quick Start**

### **Start with agent-learning-core:**

```bash
cd agent-learning-core
# Add functions to src/supabase/
# Export from src/supabase/index.ts
npm run build
```

### **Then update iris-prime-console:**

```bash
cd iris-prime-console
# Update hooks in src/hooks/
# Replace mock data in components
npm run dev
```

---

**Total Estimated Time:** 10-14 hours (split between 2 repos)
