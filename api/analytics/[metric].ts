/**
 * API Route: Analytics Data
 * Direct Supabase queries - returns stub data until tables populated
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
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { metric } = req.query;
    const projectId = req.query.projectId as string | undefined;
    const hours = parseInt(req.query.hours as string) || 24;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId required' });
    }

    let data;

    switch (metric) {
      case 'health-trends':
        // Query model_run_logs for health trends (stub for now)
        data = generateStubHealthTrends(projectId, hours);
        break;

      case 'success-rate':
        // Query model_run_logs for success rate (stub for now)
        data = generateStubSuccessRateTrends(projectId, hours);
        break;

      case 'latency':
        // Query model_run_logs for latency (stub for now)
        data = generateStubLatencyTrends(projectId, hours);
        break;

      case 'reflexion-impact':
        // Query reflexion_bank for real impact data
        const { data: reflexions } = await supabase
          .from('reflexion_bank')
          .select('*')
          .eq('project', projectId)
          .then(r => r)
          .catch(() => ({ data: [] }));

        data = {
          totalReflexions: reflexions?.length || 0,
          successfulReflexions: reflexions?.filter(r => r.impact_score > 0.7).length || 0,
          avgImpact: reflexions?.reduce((acc, r) => acc + (r.impact_score || 0), 0) / (reflexions?.length || 1) || 0,
          reusedCount: reflexions?.reduce((acc, r) => acc + (r.reused_count || 0), 0) || 0,
        };
        break;

      case 'expert-stats':
        // Query expert_signatures for real stats
        const { data: experts } = await supabase
          .from('expert_signatures')
          .select('*')
          .eq('project', projectId)
          .eq('active', true);

        data = experts?.map(e => ({
          expertId: e.expert_id,
          name: e.expert_id,
          accuracy: (e.performance_metrics?.accuracy ||
                     e.performance_metrics?.clinical_accuracy ||
                     e.performance_metrics?.win_rate ||
                     0) * 100,
          totalCalls: 0, // TODO: Query from model_run_logs
          avgLatency: 0, // TODO: Query from model_run_logs
          version: e.version,
        })) || [];
        break;

      case 'expert-performance':
      case 'token-consumption':
      case 'error-distribution':
        // Stub data for now - populate with model_run_logs data later
        data = [];
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

// Generate stub time-series data until model_run_logs is populated
function generateStubHealthTrends(projectId: string, hours: number) {
  const data = [];
  const now = Date.now();

  for (let i = hours; i >= 0; i--) {
    data.push({
      timestamp: new Date(now - i * 60 * 60 * 1000).toISOString(),
      healthScore: 65 + Math.random() * 20,
      project: projectId,
    });
  }

  return data;
}

function generateStubSuccessRateTrends(projectId: string, hours: number) {
  const data = [];
  const now = Date.now();

  for (let i = hours; i >= 0; i--) {
    data.push({
      timestamp: new Date(now - i * 60 * 60 * 1000).toISOString(),
      successRate: 60 + Math.random() * 30,
      project: projectId,
    });
  }

  return data;
}

function generateStubLatencyTrends(projectId: string, hours: number) {
  const data = [];
  const now = Date.now();

  for (let i = hours; i >= 0; i--) {
    data.push({
      timestamp: new Date(now - i * 60 * 60 * 1000).toISOString(),
      avgLatency: 200 + Math.random() * 300,
      project: projectId,
    });
  }

  return data;
}
