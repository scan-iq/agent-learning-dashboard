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

    // Fetch expert signatures (actual data source)
    const { data: experts, error: expertsError } = await supabase
      .from('expert_signatures')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (expertsError) throw expertsError;

    // Group by project and calculate per-project metrics
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

    // Calculate metrics from REAL data only
    const projects = Array.from(projectMap.values()).map(p => {
      // Calculate per-project accuracy from expert performance_metrics
      // Support multiple accuracy field names
      const projectAccuracy = p.experts.reduce((acc: number, e: any) => {
        const metrics = e.performance_metrics || {};
        // Try multiple accuracy fields (different experts use different names)
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
        totalRuns: 0, // TODO: Query model_run_logs when available
        avgSuccessRate: projectAccuracy,
        activeExperts: p.experts.length,
        totalReflexions: 0, // TODO: Query reflexion_bank when available
        experts: p.experts, // Include for detailed metrics
      };
    });

    const totalExperts = experts?.length || 0;
    const healthyCount = projects.filter(p => p.overallHealth === 'healthy').length;
    const warningCount = projects.filter(p => p.overallHealth === 'warning').length;
    const criticalCount = projects.filter(p => p.overallHealth === 'critical').length;

    // Calculate global average accuracy (support multiple metric names)
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
        total_runs_today: 0, // TODO: Query model_run_logs for today's runs
        avg_success_rate: globalAvgAccuracy,
        active_experts: totalExperts,
        total_reflexions: 0, // TODO: Query reflexion_bank total count
      },
      projects: projects.map(p => ({
        project: p.project,
        overallHealth: p.overallHealth,
        latestHealthScore: p.latestHealthScore,
        lastReportDate: p.lastReportDate,
        totalRuns: p.totalRuns,
        avgSuccessRate: p.avgSuccessRate,
        activeExperts: p.activeExperts,
        totalReflexions: p.totalReflexions,
      })),
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
