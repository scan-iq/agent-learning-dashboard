/**
 * API Route: Get analytics data
 * Dynamic route handles: health-trends, success-rate, latency, etc.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  getHealthTrends,
  getSuccessRateTrends,
  getLatencyTrends,
  getReflexionImpactStats,
  getProjectExpertStats,
  getExpertPerformanceTrends,
  getTokenConsumptionTrends,
  getErrorDistribution,
  initSupabase,
} from '@foxruv/agent-learning-core';

// Initialize Supabase on first request
let initialized = false;
function ensureInitialized() {
  if (!initialized) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      initSupabase(supabaseUrl, supabaseKey, {
        projectId: 'iris-prime-console',
        tenantId: 'default',
      });
      initialized = true;
    }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    ensureInitialized();

    const { metric } = req.query;
    const projectId = req.query.projectId as string | undefined;
    const hours = parseInt(req.query.hours as string) || 24;

    let data;

    switch (metric) {
      case 'health-trends':
        data = projectId ? await getHealthTrends(projectId, hours) : [];
        break;
      case 'success-rate':
        data = projectId ? await getSuccessRateTrends(projectId, hours) : [];
        break;
      case 'latency':
        data = projectId ? await getLatencyTrends(projectId, hours) : [];
        break;
      case 'reflexion-impact':
        data = projectId ? await getReflexionImpactStats(projectId) : null;
        break;
      case 'expert-stats':
        data = projectId ? await getProjectExpertStats(projectId) : [];
        break;
      case 'expert-performance':
        data = projectId ? await getExpertPerformanceTrends(projectId, hours) : [];
        break;
      case 'token-consumption':
        data = projectId ? await getTokenConsumptionTrends(projectId, hours) : [];
        break;
      case 'error-distribution':
        data = projectId ? await getErrorDistribution(projectId, hours) : [];
        break;
      default:
        return res.status(400).json({ error: 'Invalid metric type' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error in /api/analytics/${req.query.metric}:`, error);
    return res.status(500).json({
      error: 'Failed to fetch analytics data',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
