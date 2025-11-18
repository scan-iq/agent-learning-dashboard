/**
 * API Route: Dashboard Overview
 * Uses @foxruv/agent-learning-core properly with IRIS Prime, AgentDB, and agentic-flow
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  initSupabase,
  getOverviewMetrics,
  getAllProjectsSummary,
  getRecentEvents,
  getAnomalies,
} from '@foxruv/agent-learning-core';

// Initialize Supabase once on cold start
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
      console.log('✅ Supabase initialized via agent-learning-core');
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

    console.log('📊 Fetching dashboard overview using agent-learning-core...');

    // Use agent-learning-core functions instead of direct Supabase queries
    const [metrics, projectSummaries, events, anomalies] = await Promise.all([
      getOverviewMetrics(),
      getAllProjectsSummary(),
      getRecentEvents(undefined, 20),
      getAnomalies(undefined, 20),
    ]);

    console.log('✅ Overview data fetched:', {
      projects: projectSummaries?.length || 0,
      events: events?.length || 0,
      anomalies: anomalies?.length || 0,
    });

    return res.status(200).json({
      metrics: metrics || {
        total_projects: 0,
        healthy_projects: 0,
        warning_projects: 0,
        critical_projects: 0,
        total_runs_today: 0,
        avg_success_rate: 0,
        active_experts: 0,
        total_reflexions: 0,
      },
      projects: projectSummaries || [],
      events: events || [],
      anomalies: anomalies || [],
    });
  } catch (error) {
    console.error('❌ Error in /api/overview:', error);
    return res.status(500).json({
      error: 'Failed to fetch overview data',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ?
        (error instanceof Error ? error.stack : undefined) : undefined,
    });
  }
}
