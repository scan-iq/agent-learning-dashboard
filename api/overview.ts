/**
 * API Route: Get dashboard overview data
 * Uses Supabase directly (no agent-learning-core to avoid agentdb issues)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

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
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch iris reports (main data source)
    const { data: reports, error: reportsError } = await supabase
      .from('iris_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (reportsError) throw reportsError;

    // Basic aggregation
    const projects = new Set(reports?.map(r => r.project) || []).size;
    const healthyProjects = reports?.filter(r => r.overall_health === 'healthy').length || 0;

    return res.status(200).json({
      metrics: {
        total_projects: projects,
        healthy_projects: healthyProjects,
        warning_projects: 0,
        critical_projects: 0,
        total_runs_today: reports?.length || 0,
        avg_success_rate: 0,
        active_experts: 0,
        total_reflexions: 0,
      },
      projects: reports?.slice(0, 10).map(r => ({
        project: r.project,
        overallHealth: r.overall_health,
        latestHealthScore: r.health_score || 0,
        lastReportDate: r.created_at,
        totalRuns: 1,
        avgSuccessRate: r.avg_success_rate || 0,
        activeExperts: r.total_experts || 0,
        totalReflexions: r.total_reflexions || 0,
      })) || [],
      events: [],
      anomalies: [],
    });
  } catch (error) {
    console.error('Error in /api/overview:', error);
    return res.status(500).json({
      error: 'Failed to fetch overview data',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
