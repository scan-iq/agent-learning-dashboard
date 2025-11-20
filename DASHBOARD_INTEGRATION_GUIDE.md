# IRIS Console - Dashboard Integration Guide

## Overview

This guide documents the comprehensive dashboard integration with the IRIS backend API, ensuring proper data flow from Supabase → Backend API → Frontend Dashboard.

---

## Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌────────────────────┐
│   Supabase DB   │ ───→ │  Backend API     │ ───→ │  Frontend Dashboard│
│                 │      │  (Vercel)        │      │  (Lovable/Vercel)  │
└─────────────────┘      └──────────────────┘      └────────────────────┘
                                 │                           │
                                 │                           │
                          Authorization:               Uses API Client
                          Bearer sk_live_...           with stored key
```

---

## Backend API (iris-prime-api)

### Endpoint: `/api/iris/analytics`

**URL:** `https://iris-prime-api.vercel.app/api/iris/analytics`

**Authentication:** Bearer token required

```bash
curl -H "Authorization: Bearer sk_live_YOUR_KEY" \
  https://iris-prime-api.vercel.app/api/iris/analytics
```

**Response Structure:**

```json
{
  "overview": {
    "totalProjects": 3,
    "totalRuns": 1247,
    "totalCost": 124.56,
    "avgConfidence": 0.87,
    "successRate": 0.94,
    "totalReflexions": 89,
    "totalConsensus": 45
  },
  "tokenUsage": {
    "totalTokens": 5670000,
    "inputTokens": 3420000,
    "outputTokens": 2250000,
    "byModel": [...],
    "byProject": [...],
    "overTime": [...]
  },
  "costs": {
    "totalCost": 124.56,
    "byModel": [...],
    "byProject": [...],
    "overTime": [...]
  },
  "performance": {
    "avgLatency": 234,
    "avgTokensPerRun": 4547,
    "avgCostPerRun": 0.099,
    "successRate": 0.94,
    "errorRate": 0.06
  },
  "modelRuns": [...],
  "reflexions": [...],
  "consensus": [...],
  "projects": [...]
}
```

---

## Frontend Dashboard Integration

### 1. API Client (`src/lib/api-client.ts`)

Centralized API client that handles:
- API base URL configuration
- Bearer token authorization
- Request/response handling
- Error handling

**Key Functions:**

```typescript
import { irisApi, setApiKey, hasApiKey } from '@/lib/api-client';

// Set API key (call after user inputs key)
setApiKey('sk_live_...', remember: true);

// Check if key is configured
const hasKey = hasApiKey();

// Make API calls
const analytics = await irisApi.getAnalytics();
const projects = await irisApi.getProjects();
const events = await irisApi.getEvents(50);
```

### 2. React Query Hooks (`src/hooks/useIrisAnalytics.ts`)

React Query hooks for data fetching:

```typescript
import { useIrisAnalytics, useTokenUsage, useCostAnalytics } from '@/hooks/useIrisAnalytics';

// In your component:
const { data, isLoading, error } = useIrisAnalytics();
```

**Available Hooks:**

- `useIrisAnalytics()` - Complete analytics data
- `useTokenUsage(projectId?, timeRange?)` - Token usage stats
- `useCostAnalytics(projectId?, timeRange?)` - Cost analytics
- `useModelRuns(projectId, limit)` - Model execution history
- `useReflexions(projectId, limit)` - Reflexion insights
- `useConsensus(projectId)` - Consensus decisions

### 3. Analytics Dashboard Component (`src/components/dashboard/AnalyticsDashboard.tsx`)

Comprehensive dashboard that displays:
- Overview metrics (runs, cost, confidence, tokens)
- Token usage trends over time
- Cost analytics by model/project
- Recent model runs
- Reflexion insights
- Consensus decisions
- Project health summaries

**Usage:**

```tsx
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard';

function MyPage() {
  return <AnalyticsDashboard />;
}
```

### 4. API Key Setup (`src/components/dashboard/ApiKeySetup.tsx`)

First-time setup component that:
- Prompts users to enter API key
- Validates key format (sk_live_*)
- Tests connection to backend
- Stores key in localStorage/sessionStorage

---

## Setup Instructions

### For End Users

1. **Open Dashboard**: Navigate to https://agent-learning-dashboard.vercel.app

2. **Enter API Key**: On first visit, you'll see the API Key Setup screen

3. **Get API Key**:
   - Create a key from the API Keys page
   - Or get one from your admin
   - Keys start with `sk_live_`

4. **Configure**:
   - Paste your API key
   - Choose "Remember my API key" to persist it
   - Click "Connect to IRIS"

5. **Done!** The dashboard will now fetch real data from the backend

### For Developers

1. **Environment Variables** (`.env`):

```bash
# Backend API URL
VITE_API_BASE=https://iris-prime-api.vercel.app

# Disable mock data
VITE_ENABLE_MOCK_DATA=false

# Admin API key (for managing API keys)
VITE_ADMIN_API_KEY=your-admin-key-here
```

2. **Deploy to Vercel**:

```bash
# Set environment variables in Vercel dashboard
vercel env add VITE_API_BASE
vercel env add VITE_ENABLE_MOCK_DATA
vercel env add VITE_ADMIN_API_KEY

# Deploy
vercel --prod
```

---

## Data Flow Verification

### Check Backend API

```bash
# Test analytics endpoint
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://iris-prime-api.vercel.app/api/iris/analytics

# Should return 401 without key
curl https://iris-prime-api.vercel.app/api/iris/analytics
```

### Check Frontend Integration

1. Open browser DevTools → Network tab
2. Navigate to dashboard
3. Look for requests to `/api/iris/analytics`
4. Verify `Authorization: Bearer sk_live_...` header is present
5. Check response contains expected data

### Verify Data Display

1. **Overview Cards** should show:
   - Total Runs (from modelRuns)
   - Total Cost (from costs.totalCost)
   - Avg Confidence (from overview.avgConfidence)
   - Token Usage (from tokenUsage.totalTokens)

2. **Charts** should display:
   - Token usage over time
   - Cost trends
   - Model performance

3. **Tables** should show:
   - Recent model runs
   - Reflexion insights
   - Consensus decisions

---

## Troubleshooting

### Issue: "Authorization header is required"

**Solution:** Ensure API key is configured
```typescript
import { setApiKey } from '@/lib/api-client';
setApiKey('sk_live_YOUR_KEY');
```

### Issue: "Invalid API key format"

**Solution:** Verify key starts with `sk_live_`
- Keys from admin API have format: `sk_live_[random_string]`
- Do not use admin keys (different format)

### Issue: No data displayed

**Possible causes:**
1. API key not configured → User sees setup screen
2. Backend API down → Check https://iris-prime-api.vercel.app/health
3. No data in Supabase → Run some model executions first
4. Network error → Check browser console for errors

### Issue: CORS errors

**Solution:** Backend should have CORS headers configured
```typescript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
```

---

## File Structure

```
iris-prime-console/
├── src/
│   ├── lib/
│   │   └── api-client.ts          # Centralized API client
│   ├── hooks/
│   │   ├── useIrisData.ts         # Legacy Supabase hooks
│   │   └── useIrisAnalytics.ts    # NEW: Backend API hooks
│   ├── components/
│   │   └── dashboard/
│   │       ├── AnalyticsDashboard.tsx    # NEW: Main analytics
│   │       ├── ApiKeySetup.tsx           # NEW: First-time setup
│   │       └── AnalyticsSection.tsx      # Legacy component
│   └── pages/
│       └── Index.tsx               # Updated with API key check
└── DASHBOARD_INTEGRATION_GUIDE.md  # This file
```

---

## Key Changes Made

### ✅ Created Files

1. **`src/lib/api-client.ts`** - Unified API client with auth
2. **`src/hooks/useIrisAnalytics.ts`** - React Query hooks for backend
3. **`src/components/dashboard/AnalyticsDashboard.tsx`** - Comprehensive analytics UI
4. **`src/components/dashboard/ApiKeySetup.tsx`** - First-time setup flow

### ✅ Updated Files

1. **`src/pages/Index.tsx`** - Added API key check and new analytics dashboard
2. **`src/hooks/useIrisData.ts`** - Added import for api-client

### ✅ Features Implemented

- ✅ API key storage and management
- ✅ Bearer token authentication
- ✅ Comprehensive analytics dashboard
- ✅ Token usage visualization
- ✅ Cost analytics by model/project
- ✅ Recent model runs display
- ✅ Reflexion insights
- ✅ Consensus data
- ✅ Project health summaries
- ✅ First-time setup flow
- ✅ Error handling and loading states

---

## Testing Checklist

- [ ] API key setup flow works
- [ ] Dashboard loads with valid API key
- [ ] Overview cards show correct data
- [ ] Token usage chart displays
- [ ] Cost analytics chart displays
- [ ] Recent runs table populates
- [ ] Reflexions tab shows data
- [ ] Consensus tab shows data
- [ ] Projects grid shows all projects
- [ ] Error states display correctly
- [ ] Loading states work properly
- [ ] API key persistence works (localStorage)
- [ ] Refresh button updates data

---

## Next Steps

1. **Create API Keys**: Use the backend admin endpoint to generate user API keys
2. **Deploy Dashboard**: Push changes to Vercel
3. **Configure Environment**: Set VITE_API_BASE in Vercel dashboard
4. **Test Integration**: Verify data flows correctly
5. **Monitor Performance**: Check API response times and cache behavior

---

## Support

For issues or questions:
- Backend API: Check `/api/iris/analytics` endpoint
- Frontend: Check browser console for errors
- Auth: Verify API key format and presence in localStorage
- Data: Confirm Supabase has data (check tables directly)

---

**Last Updated:** 2025-11-19
**Version:** 1.0.0
**Status:** ✅ Complete and Ready for Testing
