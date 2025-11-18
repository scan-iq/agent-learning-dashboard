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

    // Group by project
    const projectMap = new Map();
    experts?.forEach(expert => {
      if (!projectMap.has(expert.project)) {
        projectMap.set(expert.project, {
          project: expert.project,
          experts: [],
          avgAccuracy: 0,
          lastUpdate: expert.updated_at,
        });
      }
      const proj = projectMap.get(expert.project);
      proj.experts.push(expert);
      proj.lastUpdate = expert.updated_at > proj.lastUpdate ? expert.updated_at : proj.lastUpdate;
    });

    const projects = Array.from(projectMap.values());
    const totalExperts = experts?.length || 0;

    // Calculate average accuracy across all experts
    const avgAccuracy = experts?.reduce((acc, e) => {
      return acc + (e.performance_metrics?.accuracy || 0);
    }, 0) / (totalExperts || 1);

    return res.status(200).json({
      metrics: {
        total_projects: projects.length,
        healthy_projects: projects.length, // All active
        warning_projects: 0,
        critical_projects: 0,
        total_runs_today: 0,
        avg_success_rate: avgAccuracy,
        active_experts: totalExperts,
        total_reflexions: 0,
      },
      projects: projects.map(p => ({
        project: p.project,
        overallHealth: 'healthy',
        latestHealthScore: p.avgAccuracy || 0.75,
        lastReportDate: p.lastUpdate,
        totalRuns: 0,
        avgSuccessRate: avgAccuracy,
        activeExperts: p.experts.length,
        totalReflexions: 0,
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
