/**
 * API Route: Get dashboard overview data
 * Runs on Vercel serverless function (Node.js environment)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  getOverviewMetrics,
  getAllProjectsSummary,
  getRecentEvents,
  getAnomalies,
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
    } else {
      throw new Error('Supabase credentials not configured');
    }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
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

    // Fetch all data in parallel
    const [metrics, projectSummaries, events, anomalies] = await Promise.all([
      getOverviewMetrics(),
      getAllProjectsSummary(),
      getRecentEvents(undefined, 20),
      getAnomalies(undefined, 20),
    ]);

    return res.status(200).json({
      metrics,
      projects: projectSummaries,
      events,
      anomalies,
    });
  } catch (error) {
    console.error('Error in /api/overview:', error);
    return res.status(500).json({
      error: 'Failed to fetch overview data',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
