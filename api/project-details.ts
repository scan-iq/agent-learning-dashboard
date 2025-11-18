/**
 * API Route: Project Details
 * Direct Supabase queries - comprehensive project data
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

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
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Project ID required in query param: ?id=PROJECT_ID' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all project data in parallel
    const [expertsResult, reportsResult, reflexionsResult] = await Promise.all([
      supabase.from('expert_signatures').select('*').eq('project', id).eq('active', true),
      supabase.from('iris_reports').select('*').eq('project', id).order('created_at', { ascending: false }).limit(10)
        .then(r => r)
        .catch(() => ({ data: [], error: null })),
      supabase.from('reflexion_bank').select('*').eq('project', id).order('created_at', { ascending: false }).limit(10)
        .then(r => r)
        .catch(() => ({ data: [], error: null })),
    ]);

    const experts = expertsResult.data;
    const reports = reportsResult.data;
    const reflexions = reflexionsResult.data;

    if (!experts || experts.length === 0) {
      return res.status(404).json({
        error: 'Project not found',
        message: `No active experts found for project: ${id}`,
      });
    }

    // Calculate project health
    const avgAccuracy = experts.reduce((acc: number, e: any) => {
      const metrics = e.performance_metrics || {};
      return acc + (metrics.accuracy || metrics.clinical_accuracy || metrics.win_rate || 0);
    }, 0) / experts.length;

    const healthScore = avgAccuracy * 100;

    let status: 'healthy' | 'warning' | 'critical';
    if (healthScore >= 80) status = 'healthy';
    else if (healthScore >= 60) status = 'warning';
    else status = 'critical';

    // Format expert performance
    const expertPerformance = experts.map(expert => ({
      expert_id: expert.expert_id,
      name: expert.expert_id,
      accuracy: (expert.performance_metrics?.accuracy ||
                 expert.performance_metrics?.clinical_accuracy ||
                 expert.performance_metrics?.win_rate ||
                 0) * 100,
      calls: 0, // TODO: Query from model_run_logs
      avgLatency: 0, // TODO: Query from model_run_logs
      lastActive: expert.updated_at,
    }));

    // Format reflexions
    const recentReflexions = reflexions?.map(ref => ({
      id: ref.id,
      pattern: ref.pattern || ref.strategy,
      impact: ref.impact_score || 0,
      created_at: ref.created_at,
      reused_count: ref.reused_count || 0,
    })) || [];

    console.log('✅ Fetched details for', id);

    return res.status(200).json({
      id,
      name: id,
      status,
      health_score: healthScore,
      last_run: reports?.[0]?.created_at || experts[0].updated_at,
      total_runs: reports?.length || 0,
      success_rate: avgAccuracy * 100,
      active_experts: experts.length,
      reflexions_count: reflexions?.length || 0,
      avg_latency: 0, // TODO: Calculate from model_run_logs
      recent_errors: [], // TODO: Query error logs
      expert_performance: expertPerformance,
      recent_reflexions: recentReflexions,
      consensus_history: [], // TODO: Query consensus_lineage
      latest_report: reports?.[0] || null,
      report_history: reports || [],
    });
  } catch (error) {
    console.error('Project details error:', error);
    return res.status(500).json({
      error: 'Failed to fetch project details',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
