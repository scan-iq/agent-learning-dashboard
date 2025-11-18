/**
 * API Route: Generate Rotation Report
 * Uses IRIS Prime to generate expert rotation recommendations
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  initSupabase,
  irisPrime,
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
    ensureInitialized();

    const { projectId } = req.query;

    if (!projectId || typeof projectId !== 'string') {
      return res.status(400).json({
        error: 'projectId query parameter required',
      });
    }

    console.log('🔄 Generating rotation report for:', projectId);

    // Use IRIS Prime to generate rotation recommendations
    const report = await irisPrime.generateRotationReport(projectId);

    console.log('✅ Rotation report generated:', {
      recommendations: Array.isArray(report) ? report.length : 0,
    });

    // Calculate summary
    const summary = Array.isArray(report) ? {
      total: report.length,
      keep: report.filter(r => r.action === 'keep').length,
      update: report.filter(r => r.action === 'update').length,
      replace: report.filter(r => r.action === 'replace').length,
      addToEnsemble: report.filter(r => r.action === 'add_to_ensemble').length,
    } : { total: 0, keep: 0, update: 0, replace: 0, addToEnsemble: 0 };

    return res.status(200).json({
      success: true,
      projectId,
      generatedAt: new Date().toISOString(),
      recommendations: report || [],
      summary,
      metadata: {
        totalExperts: summary.total,
        evaluationPeriod: '30 days',
      },
    });
  } catch (error) {
    console.error('❌ Error in /api/iris/rotation:', error);
    return res.status(500).json({
      success: false,
      error: 'Rotation report generation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
