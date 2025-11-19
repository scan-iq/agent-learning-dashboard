/**
 * API Route: Evaluate All Projects (IRIS Prime Logic)
 * Direct Supabase queries - implements IRIS evaluation manually
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY?.trim();

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all active experts grouped by project
    const { data: experts } = await supabase
      .from('expert_signatures')
      .select('*')
      .eq('active', true);

    if (!experts ||experts.length === 0) {
      return res.status(200).json({
        success: true,
        reports: [],
        summary: { total: 0, excellent: 0, good: 0, fair: 0, poor: 0, critical: 0 },
        message: 'No projects to evaluate',
      });
    }

    // Group by project
    const projectsMap = new Map();
    experts.forEach(e => {
      if (!projectsMap.has(e.project)) {
        projectsMap.set(e.project, []);
      }
      projectsMap.get(e.project).push(e);
    });

    // Evaluate each project
    const evaluations = [];
    for (const [projectId, projectExperts] of projectsMap.entries()) {
      // Calculate health score
      const avgAccuracy = projectExperts.reduce((acc: number, e: any) => {
        const metrics = e.performance_metrics || {};
        return acc + (metrics.accuracy || metrics.clinical_accuracy || metrics.win_rate || 0);
      }, 0) / projectExperts.length;

      const healthScore = avgAccuracy * 100;

      // Determine overall health
      let overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
      if (healthScore >= 90) overallHealth = 'excellent';
      else if (healthScore >= 80) overallHealth = 'good';
      else if (healthScore >= 70) overallHealth = 'fair';
      else if (healthScore >= 60) overallHealth = 'poor';
      else overallHealth = 'critical';

      const evaluation = {
        project: projectId,
        overallHealth,
        healthScore,
        avgAccuracy,
        activeExperts: projectExperts.length,
        timestamp: new Date().toISOString(),
      };

      evaluations.push(evaluation);

      // Store evaluation in iris_reports table
      await supabase.from('iris_reports').insert({
        project: projectId,
        report_type: 'auto_evaluation',
        overall_health: overallHealth,
        health_score: healthScore,
        avg_success_rate: avgAccuracy,
        total_experts: projectExperts.length,
        drift_alerts: [],
        recommendations: [],
        created_at: new Date().toISOString(),
      });
    }

    const summary = {
      total: evaluations.length,
      excellent: evaluations.filter(e => e.overallHealth === 'excellent').length,
      good: evaluations.filter(e => e.overallHealth === 'good').length,
      fair: evaluations.filter(e => e.overallHealth === 'fair').length,
      poor: evaluations.filter(e => e.overallHealth === 'poor').length,
      critical: evaluations.filter(e => e.overallHealth === 'critical').length,
    };

    console.log('✅ Evaluated', evaluations.length, 'projects');

    return res.status(200).json({
      success: true,
      reports: evaluations,
      summary,
      message: `Evaluated ${summary.total} projects successfully`,
    });
  } catch (error) {
    console.error('Evaluate all error:', error);
    return res.status(500).json({
      success: false,
      error: 'Evaluation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
