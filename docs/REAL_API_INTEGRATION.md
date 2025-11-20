# IRIS Console - Real API Integration

## Overview
This document describes the integration of real Supabase API calls in the IRIS Console dashboard, replacing the mock data implementation.

## Changes Made

### 1. Created React Query Hooks (`src/hooks/useIrisData.ts`)

**New file** that provides React Query hooks for fetching real data from the Supabase backend:

- `useIrisOverview()` - Main hook for dashboard overview data
  - Fetches projects, events, metrics, and anomalies
  - Auto-refetches every 30 seconds
  - Returns transformed data matching the mock data structure

- `useProjectDetails(projectId)` - Individual project details
  - Fetches project summary and history
  - Only enabled when projectId is provided

- `useAnomalies()` - Anomaly detection data
  - Fetches critical reports
  - Auto-refetches every minute

- `useEvents()` - Recent system events
  - Fetches report history
  - Auto-refetches every 30 seconds

**Key Features:**
- Gracefully handles uninitialized Supabase (returns empty data)
- Transforms Supabase data structures to match UI expectations
- Implements intelligent refetch intervals
- Error handling with console warnings

### 2. Updated Dashboard Page (`src/pages/Index.tsx`)

**Minimal changes to preserve all existing functionality:**

- Added import for `useIrisOverview` hook
- Added import for `Skeleton` component
- Removed direct imports of mock data (except for diagnostic data which isn't yet in Supabase)
- Added hook call at component start:
  ```typescript
  const { data: overviewData, isLoading, error } = useIrisOverview();
  ```
- Extract data with fallbacks to empty structures
- Added loading state with skeleton UI
- Added error state with retry button

**All preserved:**
- All state management
- All event handlers
- All dialogs and interactions
- All UI components
- Diagnostic data (still using mocks)

### 3. Supabase Initialization (`src/App.tsx`)

Added Supabase client initialization on app startup:

```typescript
import { initSupabase } from '@foxruv/agent-learning-core';

function initializeSupabase() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    initSupabase(supabaseUrl, supabaseKey, {
      projectId: 'iris-prime-console',
      tenantId: 'default',
    });
  }
}
```

**Behavior:**
- Checks for environment variables
- Initializes if credentials present
- Logs warnings if not available (graceful degradation)

### 4. TypeScript Configuration Updates

**`vite.config.ts`** - Added alias for agent-learning-core:
```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
    "@foxruv/agent-learning-core": path.resolve(__dirname, "../agent-learning-core/src"),
  },
}
```

**`tsconfig.json`** - Added path mappings:
```json
"paths": {
  "@/*": ["./src/*"],
  "@foxruv/agent-learning-core": ["../agent-learning-core/src/index.ts"],
  "@foxruv/agent-learning-core/*": ["../agent-learning-core/src/*"]
}
```

### 5. Environment Variables

Updated `.env.example` with Supabase configuration:
```env
# Supabase (Optional - for direct client access)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd /home/iris/code/experimental/iris-prime-console
npm install
```

### 2. Configure Environment

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Build Agent Learning Core

```bash
cd /home/iris/code/experimental/agent-learning-core
npm install
npm run build
```

### 4. Run Dashboard

```bash
cd /home/iris/code/experimental/iris-prime-console
npm run dev
```

## Data Flow

```
Dashboard Component
    ↓
useIrisOverview() Hook (React Query)
    ↓
@foxruv/agent-learning-core Functions
    ↓
Supabase Client
    ↓
Supabase Database (iris_reports table)
```

## Graceful Degradation

The implementation gracefully handles missing Supabase configuration:

1. **No credentials**: Returns empty data, logs warning
2. **Supabase errors**: Caught and logged, displays error UI
3. **Network issues**: React Query retries automatically

## What's Still Mock Data

The following still use mock data (not yet in Supabase):
- `mockProjectDetails` - Detailed project information
- `mockDiagnosticData` - Anomaly diagnostic details
- Expert performance metrics
- Reflexion details
- Consensus history

These will be integrated in future updates when the corresponding Supabase tables are ready.

## Testing

### With Supabase:
1. Set environment variables
2. Ensure Supabase has iris_reports data
3. Dashboard should show real data
4. Auto-refresh every 30 seconds

### Without Supabase:
1. Don't set environment variables
2. Dashboard shows empty state
3. No errors, just empty data
4. Console shows warning message

## Next Steps

1. **Add more Supabase tables**:
   - Expert signatures
   - Telemetry/metrics
   - Reflexions
   - Consensus lineage

2. **Create hooks for**:
   - `useExpertPerformance()`
   - `useReflexions()`
   - `useConsensusHistory()`
   - `useTelemetryMetrics()`

3. **Real-time updates**:
   - Add Supabase realtime subscriptions
   - Live updates without polling

4. **Mutations**:
   - Add hooks for updating data
   - Optimistic updates
   - Cache invalidation

## Dependencies

- `@tanstack/react-query` - Data fetching and caching
- `@foxruv/agent-learning-core` - Supabase integration layer
- `@supabase/supabase-js` - Supabase client (via core)

## Files Modified

1. **New**: `src/hooks/useIrisData.ts` (239 lines)
2. **Modified**: `src/pages/Index.tsx` (~70 lines changed)
3. **Modified**: `src/App.tsx` (~30 lines changed)
4. **Modified**: `vite.config.ts` (1 line changed)
5. **Modified**: `tsconfig.json` (3 lines changed)
6. **New**: `docs/REAL_API_INTEGRATION.md` (this file)

## Architecture Benefits

✅ **Separation of Concerns**: Hooks separate data fetching from UI
✅ **Type Safety**: Full TypeScript support
✅ **Caching**: React Query handles caching automatically
✅ **Auto-refresh**: Configurable refetch intervals
✅ **Error Handling**: Centralized error management
✅ **Loading States**: Built-in loading state management
✅ **Graceful Degradation**: Works without Supabase
✅ **Reusability**: Hooks can be used across components
