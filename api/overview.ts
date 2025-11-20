/**
 * API Route: Dashboard Overview
 * Direct Supabase queries with IRIS logic (no agentdb dependencies)
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
    const supabaseUrl = (process.env.VITE_SUPABASE_URL?.trim() || process.env.SUPABASE_URL?.trim())?.trim();
    const supabaseKey = (process.env.VITE_SUPABASE_ANON_KEY?.trim() || process.env.SUPABASE_ANON_KEY?.trim())?.trim();

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials:', { hasUrl: !!supabaseUrl, hasKey: !!supabaseKey });
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch real data from multiple tables
    const [expertsResult, reportsResult, reflexionsResult] = await Promise.all([
      supabase.from('expert_signatures').select('*').eq('active', true),
      supabase.from('iris_reports').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('reflexion_bank').select('*').order('created_at', { ascending: false}).limit(20)
        .then(r => r, () => ({ data: [], error: null })),
    ]);

    const experts = expertsResult.data;
    const reports = reportsResult.data;
    const reflexions = reflexionsResult.data;

    // Group by project and calculate metrics
    const projectMap = new Map();
    experts?.forEach(expert => {
      if (!projectMap.has(expert.project)) {
        projectMap.set(expert.project, {
          project: expert.project,
          experts: [],
          lastUpdate: expert.updated_at,
        });
      }
      const proj = projectMap.get(expert.project);
      proj.experts.push(expert);
      proj.lastUpdate = expert.updated_at > proj.lastUpdate ? expert.updated_at : proj.lastUpdate;
    });

    const projects = Array.from(projectMap.values()).map(p => {
      // Calculate per-project accuracy from expert performance_metrics
      const projectAccuracy = p.experts.reduce((acc: number, e: any) => {
        const metrics = e.performance_metrics || {};
        const accuracy = metrics.accuracy ||
                        metrics.clinical_accuracy ||
                        metrics.win_rate ||
                        metrics.roi ||
                        0;
        return acc + accuracy;
      }, 0) / p.experts.length;

      // Determine health based on accuracy
      let health: 'healthy' | 'warning' | 'critical';
      if (projectAccuracy >= 0.8) health = 'healthy';
      else if (projectAccuracy >= 0.6) health = 'warning';
      else health = 'critical';

      return {
        project: p.project,
        overallHealth: health,
        latestHealthScore: projectAccuracy,
        lastReportDate: p.lastUpdate,
        totalRuns: reports?.filter(r => r.project === p.project).length || 0,
        avgSuccessRate: projectAccuracy,
        activeExperts: p.experts.length,
        totalReflexions: reflexions?.filter(r => r.project === p.project).length || 0,
      };
    });

    const totalExperts = experts?.length || 0;
    const healthyCount = projects.filter(p => p.overallHealth === 'healthy').length;
    const warningCount = projects.filter(p => p.overallHealth === 'warning').length;
    const criticalCount = projects.filter(p => p.overallHealth === 'critical').length;

    // Calculate global average accuracy
    const globalAvgAccuracy = experts?.reduce((acc, e) => {
      const metrics = e.performance_metrics || {};
      const accuracy = metrics.accuracy ||
                      metrics.clinical_accuracy ||
                      metrics.win_rate ||
                      metrics.roi ||
                      0;
      return acc + accuracy;
    }, 0) / (totalExperts || 1);

    return res.status(200).json({
      metrics: {
        total_projects: projects.length,
        healthy_projects: healthyCount,
        warning_projects: warningCount,
        critical_projects: criticalCount,
        total_runs_today: reports?.filter(r => {
          const today = new Date().toISOString().split('T')[0];
          return r.created_at?.startsWith(today);
        }).length || 0,
        avg_success_rate: globalAvgAccuracy,
        active_experts: totalExperts,
        total_reflexions: reflexions?.length || 0,
      },
      projects,
      events: [], // TODO: Query system_events table when available
      anomalies: [], // TODO: Query anomalies table when available
    });
  } catch (error) {
    console.error('Error in /api/overview:', error);
    return res.status(500).json({
      error: 'Failed to fetch overview data',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
