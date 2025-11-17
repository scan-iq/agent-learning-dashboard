# Mock vs Real Data & Buttons Status

**Last Updated:** 2025-11-17  
**Frontend:** `iris-prime-console`  
**Backend:** `@foxruv/agent-learning-core` (Supabase)

---

## 📊 Data Status Overview

### ✅ **REAL DATA** (Connected to Supabase)

These use the `useIrisOverview()` hook which connects to Supabase via `@foxruv/agent-learning-core`:

| Data Type | Hook | Status | Notes |
|-----------|------|--------|-------|
| **Overview Metrics** | `useIrisOverview().data.metrics` | ⚠️ **Partial** | Returns real structure but currently shows zeros/empty (Supabase table exists but may be empty) |
| **Projects List** | `useIrisOverview().data.projects` | ⚠️ **Partial** | Returns empty array (needs data in `iris_reports` table) |
| **Events Feed** | `useIrisOverview().data.events` | ⚠️ **Partial** | Returns empty array (needs events data) |
| **Anomalies** | `useIrisOverview().data.anomalies` | ⚠️ **Partial** | Returns empty array (needs anomalies data) |

**Location:** `src/pages/Index.tsx` lines 37-52

**Current Implementation:**

```typescript
const { data: overviewData, isLoading, error } = useIrisOverview();
const mockOverviewMetrics = overviewData?.metrics || { /* defaults */ };
const mockProjects = overviewData?.projects || [];
const mockEvents = overviewData?.events || [];
const mockAnomalies = overviewData?.anomalies || [];
```

**Note:** Variable names still say "mock" but they're actually pulling from real Supabase data (just with fallbacks).

---

### ❌ **MOCK DATA** (Still Using Hardcoded Values)

| Data Type | Location | Used In | Available from agent-learning-core? |
|-----------|----------|---------|-------------------------------------|
| **Project Details** | `src/lib/mock-data.ts` line 431 | `ProjectDetailsDialog` | ✅ Yes - `getLatestIrisReport()`, `getIrisReportHistory()` |
| **Diagnostic Data** | `src/lib/mock-data.ts` line 235 | `AnomalyInvestigationDialog` | ⚠️ Partial - `detectDrift()`, `getExpertStats()` |
| **Health Trends Chart** | `src/lib/mock-data.ts` line 101 | `AnalyticsSection` | ✅ Yes - `getExpertStats()`, `getRecentLogs()` |
| **Success Rates Chart** | `src/lib/mock-data.ts` line 110 | `AnalyticsSection` | ✅ Yes - `getExpertStats()`, telemetry data |
| **Expert Performance** | `src/lib/mock-data.ts` line 119 | `AnalyticsSection` | ✅ Yes - `getExpertStats()`, `getExpertParticipationStats()` |
| **Latency Trends** | `src/lib/mock-data.ts` line 129 | `AnalyticsSection` | ✅ Yes - `getRecentLogs()`, telemetry data |
| **Reflexion Impact** | `src/lib/mock-data.ts` line 138 | `AnalyticsSection` | ✅ Yes - `getReflexionStats()`, `getSuccessfulReflexions()` |

---

## 🔘 Buttons & Actions Status

### Header Buttons (Top Right)

| Button | Icon | Status | Functionality |
|--------|------|--------|---------------|
| **Analytics** | `BarChart3` | ⚠️ **Partial** | Opens `AlertAnalyticsDashboard` - Uses mock alert analytics data |
| **Learning** | `Brain` | ✅ **Real** | Opens `AlertSentimentPanel` - Uses `useAlertSentiment()` hook (real sentiment analysis) |
| **Alerts** | `Bell` | ❌ **Mock** | Opens `AlertManagementDialog` - Uses mock alert rules/notifications from component state |
| **History** | `History` | ❌ **Mock** | Opens `ExecutionHistoryDialog` - Uses mock execution history from component state |
| **Refresh** | `RefreshCw` | ❌ **No Action** | No onClick handler - doesn't refresh data |
| **Evaluate All** | `Play` | ❌ **No Action** | No onClick handler - doesn't trigger evaluation |

**Location:** `src/pages/Index.tsx` lines 684-742

---

### Quick Actions Section

| Button | Icon | Status | Functionality |
|--------|------|--------|---------------|
| **Evaluate All** | `Play` | ❌ **No Action** | No onClick handler |
| **Auto Retrain** | `RefreshCw` | ❌ **No Action** | No onClick handler |
| **Find Patterns** | `Brain` | ❌ **No Action** | No onClick handler |
| **Rotation Report** | `Activity` | ❌ **No Action** | No onClick handler |

**Location:** `src/pages/Index.tsx` lines 840-856

**Available from agent-learning-core:**

- ✅ **Evaluate All**: `irisPrime.evaluateProject()` or `irisPrime.evaluateAllProjects()`
- ✅ **Auto Retrain**: `trainExpertsParallel()`, `SwarmCoordinator`
- ✅ **Find Patterns**: `PatternDiscovery.findSimilarPatterns()`, `findPatterns()`
- ✅ **Rotation Report**: `ConsensusLineageTracker.getRotationRecommendations()`

---

### Project Card Actions

| Action | Status | Functionality |
|--------|--------|---------------|
| **View Details** | ⚠️ **Partial** | Opens `ProjectDetailsDialog` - Shows mock project details |
| **Investigate Anomaly** | ⚠️ **Partial** | Opens `AnomalyInvestigationDialog` - Shows mock diagnostic data |

**Available from agent-learning-core:**

- ✅ **Project Details**: `getLatestIrisReport(projectId)`, `getIrisReportHistory(projectId)`
- ✅ **Anomaly Diagnostics**: `detectDrift()`, `getExpertStats()`, `getRecentLogs()`

---

### Anomaly Investigation Dialog Actions

| Action | Status | Functionality |
|--------|--------|---------------|
| **Execute Action** | ❌ **Simulated** | Simulates execution with setTimeout (not real API call) |
| **Schedule Action** | ❌ **Mock** | Stores in component state (not persisted) |

**Available from agent-learning-core:**

- ✅ **Execute Remediation**: Could use `irisPrime.evaluateProject()` or custom API
- ⚠️ **Schedule Actions**: Not directly available (would need backend scheduler)

---

### Alert Management Actions

| Action | Status | Functionality |
|--------|--------|---------------|
| **Add Alert Rule** | ❌ **Mock** | Stores in component state only |
| **Update Alert Rule** | ❌ **Mock** | Updates component state only |
| **Delete Alert Rule** | ❌ **Mock** | Removes from component state only |
| **Update Notification Channel** | ❌ **Mock** | Updates component state only |
| **Acknowledge Alert** | ⚠️ **Partial** | Updates state + calls `recordFeedback()` (real sentiment tracking) |
| **Dismiss Alert** | ⚠️ **Partial** | Updates state + calls `recordFeedback()` (real sentiment tracking) |

**Available from agent-learning-core:**

- ⚠️ **Alert Rules**: Not directly available (would need custom Supabase table)
- ✅ **Sentiment Tracking**: `useAlertSentiment()` hook (already working)

---

## 📦 Available Data from `@foxruv/agent-learning-core`

### ✅ **Supabase Functions Available:**

#### **IRIS Reports** (`src/supabase/iris-reports.ts`)

- `storeIrisReport()` - Store evaluation report
- `getLatestIrisReport(projectId)` - Get latest report for project
- `getIrisReportHistory(projectId)` - Get report history
- `getIrisReportSummary()` - Get summary across projects
- `getCriticalReports()` - Get critical health reports
- `compareProjectHealth()` - Compare multiple projects

#### **Telemetry** (`src/supabase/telemetry.ts`)

- `logTelemetry()` - Log expert performance metrics
- `getExpertStats(projectId, expertName)` - Get expert statistics
- `getRecentLogs(projectId, limit)` - Get recent execution logs
- `detectDrift(projectId)` - Detect performance drift

#### **Reflexions** (`src/supabase/reflexions.ts`)

- `saveReflexion()` - Save reflexion entry
- `findSimilarReflexions()` - Find similar patterns
- `getSuccessfulReflexions(projectId)` - Get successful reflexions
- `getReflexionStats(projectId)` - Get reflexion statistics

#### **Consensus** (`src/supabase/consensus.ts`)

- `recordConsensusLineage()` - Record expert consensus
- `getConsensusHistory(projectId)` - Get consensus history
- `getExpertParticipationStats(projectId)` - Get expert participation

#### **Patterns** (`src/supabase/patterns.ts`)

- `findPatterns(options)` - Find learned patterns
- `getPatternStats()` - Get pattern statistics
- `getCrossProjectPatterns()` - Get patterns across projects

#### **Signatures** (`src/supabase/signatures.ts`)

- `getSignatureHistory(projectId, expertName)` - Get signature versions
- `loadActiveExpertSignature()` - Load active signature

---

## 🎯 Integration Priority

### **High Priority** (Core Functionality)

1. **Project Details** → Use `getLatestIrisReport(projectId)` from agent-learning-core
2. **Expert Performance Charts** → Use `getExpertStats()` from agent-learning-core
3. **Reflexion Impact** → Use `getReflexionStats()` from agent-learning-core
4. **Health Trends** → Use `getRecentLogs()` + `getExpertStats()` to build trends
5. **Success Rates** → Use telemetry data from `getExpertStats()`

### **Medium Priority** (Enhanced Features)

6. **Anomaly Diagnostics** → Use `detectDrift()` + `getRecentLogs()` from agent-learning-core
7. **Latency Trends** → Use `getRecentLogs()` with latency metrics
8. **Alert Rules** → Create Supabase table for alert rules (not in agent-learning-core yet)
9. **Scheduled Actions** → Create backend scheduler (not in agent-learning-core yet)

### **Low Priority** (Nice to Have)

10. **Execution History** → Persist to Supabase (currently component state only)
11. **Quick Actions** → Wire up buttons to real functions:
    - Evaluate All → `irisPrime.evaluateAllProjects()`
    - Find Patterns → `PatternDiscovery.findSimilarPatterns()`
    - Rotation Report → `ConsensusLineageTracker.getRotationRecommendations()`

---

## 🔧 How to Connect Real Data

### Example: Replace Project Details Mock

**Current (Mock):**

```typescript
const selectedProject = selectedProjectId ? mockProjectDetails[selectedProjectId] : null;
```

**New (Real):**

```typescript
import { getLatestIrisReport } from '@foxruv/agent-learning-core';

const { data: projectDetails } = useQuery({
  queryKey: ['project-details', selectedProjectId],
  queryFn: () => getLatestIrisReport(selectedProjectId!),
  enabled: !!selectedProjectId,
});
```

### Example: Replace Expert Performance Mock

**Current (Mock):**

```typescript
import { mockExpertPerformance } from '@/lib/mock-data';
<BarChart data={mockExpertPerformance} />
```

**New (Real):**

```typescript
import { getExpertStats } from '@foxruv/agent-learning-core';

const { data: expertStats } = useQuery({
  queryKey: ['expert-stats', projectId],
  queryFn: () => getExpertStats(projectId),
});

// Transform to chart format
const chartData = expertStats?.map(stat => ({
  name: stat.expert_name,
  accuracy: stat.accuracy,
  calls: stat.total_calls,
  latency: stat.avg_latency,
}));
```

---

## 📝 Summary

### **What Works (Real Data):**

- ✅ Overview metrics structure (but empty data)
- ✅ Projects list structure (but empty data)
- ✅ Events structure (but empty data)
- ✅ Anomalies structure (but empty data)
- ✅ Alert sentiment analysis (real learning)

### **What's Mock:**

- ❌ Project details (full data)
- ❌ Diagnostic data
- ❌ All analytics charts (health, success, experts, latency, reflexions)
- ❌ Alert rules/notifications (component state)
- ❌ Execution history (component state)
- ❌ Scheduled actions (component state)

### **What's Available but Not Used:**

- ✅ `getLatestIrisReport()` - For project details
- ✅ `getExpertStats()` - For expert performance charts
- ✅ `getReflexionStats()` - For reflexion impact
- ✅ `getRecentLogs()` - For health/latency trends
- ✅ `detectDrift()` - For anomaly diagnostics
- ✅ `irisPrime.evaluateAllProjects()` - For Evaluate All button
- ✅ `PatternDiscovery.findSimilarPatterns()` - For Find Patterns button

---

**Next Steps:**

1. Create hooks in `src/hooks/useIrisData.ts` for each data type
2. Replace mock data imports with real hooks
3. Wire up button onClick handlers to real functions
4. Add loading/error states for all data fetching
