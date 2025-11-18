/**
 * API Route: Project Details
 * Get comprehensive project information using agent-learning-core
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  initSupabase,
  irisPrime,
  getLatestIrisReport,
  getIrisReportHistory,
  getProjectExpertStats,
  getRecentLogs,
  getSuccessfulReflexions,
  getConsensusHistory,
} from '@foxruv/agent-learning-core';

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
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Project ID required' });
    }

    ensureInitialized();

    console.log('📊 Fetching project details for:', id);

    // Fetch all project data in parallel using agent-learning-core
    const [
      latestReport,
      reportHistory,
      expertStats,
      recentLogs,
      reflexions,
      consensusHistory,
    ] = await Promise.all([
      getLatestIrisReport(id).catch(() => null),
      getIrisReportHistory({ projectId: id, limit: 10 }).catch(() => []),
      getProjectExpertStats(id).catch(() => []),
      getRecentLogs(id, { limit: 50, hoursBack: 24 }).catch(() => []),
      getSuccessfulReflexions(id, { limit: 10 }).catch(() => []),
      getConsensusHistory(id, { limit: 24, daysBack: 7 }).catch(() => []),
    ]);

    // Extract errors from logs
    const recentErrors = recentLogs
      ?.filter(log => log.error || log.status === 'error')
      .map(log => ({
        timestamp: log.timestamp,
        expert: log.expert_id,
        message: log.error || 'Unknown error',
        severity: log.severity || 'medium',
      }))
      .slice(0, 10) || [];

    // Format expert performance
    const expertPerformance = expertStats?.map(expert => ({
      expert_id: expert.expert_id,
      name: expert.name || expert.expert_id,
      accuracy: (expert.accuracy || 0) * 100,
      calls: expert.total_calls || 0,
      avgLatency: expert.avg_latency_ms || 0,
      lastActive: expert.last_active,
    })) || [];

    // Format reflexions
    const recentReflexions = reflexions?.map(ref => ({
      id: ref.id,
      pattern: ref.pattern,
      impact: ref.impact_score,
      created_at: ref.created_at,
      reused_count: ref.reused_count,
    })) || [];

    // Calculate project health
    const healthScore = latestReport?.health_score ||
      (expertStats?.reduce((acc, e) => acc + (e.accuracy || 0), 0) / (expertStats?.length || 1)) * 100 || 0;

    const successRate = recentLogs?.length > 0
      ? (recentLogs.filter(l => l.status === 'success' || !l.error).length / recentLogs.length) * 100
      : 0;

    console.log('✅ Project details fetched:', {
      reports: reportHistory?.length || 0,
      experts: expertStats?.length || 0,
      reflexions: reflexions?.length || 0,
    });

    return res.status(200).json({
      id,
      name: id,
      status: latestReport?.overall_health || (healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'warning' : 'critical'),
      health_score: healthScore,
      last_run: latestReport?.timestamp || recentLogs?.[0]?.timestamp || new Date().toISOString(),
      total_runs: recentLogs?.length || 0,
      success_rate: successRate,
      active_experts: expertStats?.length || 0,
      reflexions_count: reflexions?.length || 0,
      avg_latency: expertStats?.reduce((acc, e) => acc + (e.avg_latency_ms || 0), 0) / (expertStats?.length || 1) || 0,
      recent_errors: recentErrors,
      expert_performance: expertPerformance,
      recent_reflexions: recentReflexions,
      consensus_history: consensusHistory || [],
      latest_report: latestReport,
      report_history: reportHistory || [],
    });
  } catch (error) {
    console.error('❌ Error in /api/project/[id]:', error);
    return res.status(500).json({
      error: 'Failed to fetch project details',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
