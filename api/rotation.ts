/**
 * API Route: Generate Rotation Report
 * Direct Supabase queries - expert rotation logic
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
    const { projectId } = req.query;

    if (!projectId || typeof projectId !== 'string') {
      return res.status(400).json({ error: 'projectId query parameter required' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get experts for this project
    const { data: experts } = await supabase
      .from('expert_signatures')
      .select('*')
      .eq('project', projectId)
      .eq('active', true);

    if (!experts || experts.length === 0) {
      return res.status(200).json({
        success: true,
        projectId,
        recommendations: [],
        summary: { total: 0, keep: 0, update: 0, replace: 0, addToEnsemble: 0 },
        message: 'No experts found for this project',
      });
    }

    // Generate rotation recommendations based on performance
    const recommendations = experts.map(expert => {
      const metrics = expert.performance_metrics || {};
      const accuracy = metrics.accuracy ||
                      metrics.clinical_accuracy ||
                      metrics.win_rate ||
                      metrics.roi ||
                      0;

      // Determine action based on performance
      let action: 'keep' | 'update' | 'replace' | 'add_to_ensemble';
      let confidence: number;
      let reasoning: string;

      if (accuracy >= 0.9) {
        action = 'keep';
        confidence = 0.95;
        reasoning = 'Excellent performance - maintain current version';
      } else if (accuracy >= 0.75) {
        action = 'keep';
        confidence = 0.85;
        reasoning = 'Good performance - monitor for drift';
      } else if (accuracy >= 0.6) {
        action = 'update';
        confidence = 0.75;
        reasoning = 'Moderate performance - consider retraining';
      } else {
        action = 'replace';
        confidence = 0.9;
        reasoning = 'Low performance - replacement recommended';
      }

      return {
        expertId: expert.expert_id,
        expertName: expert.expert_id,
        currentVersion: expert.version,
        action,
        confidence,
        reasoning,
        metrics: {
          accuracy,
          totalCalls: 0, // TODO: Query from model_run_logs
          participationRate: 1.0, // TODO: Calculate from consensus_lineage
          consensusRate: 1.0, // TODO: Calculate from consensus_lineage
        },
      };
    });

    const summary = {
      total: recommendations.length,
      keep: recommendations.filter(r => r.action === 'keep').length,
      update: recommendations.filter(r => r.action === 'update').length,
      replace: recommendations.filter(r => r.action === 'replace').length,
      addToEnsemble: recommendations.filter(r => r.action === 'add_to_ensemble').length,
    };

    console.log('✅ Generated rotation report for', projectId);

    return res.status(200).json({
      success: true,
      projectId,
      generatedAt: new Date().toISOString(),
      recommendations,
      summary,
      metadata: {
        totalExperts: experts.length,
        evaluationPeriod: '30 days',
      },
    });
  } catch (error) {
    console.error('Rotation report error:', error);
    return res.status(500).json({
      success: false,
      error: 'Rotation report generation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
