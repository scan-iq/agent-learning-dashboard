/**
 * API Route: Evaluate All Projects
 * Uses IRIS Prime orchestrator to evaluate all projects
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  initSupabase,
  irisPrime,
  storeIrisReport,
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    ensureInitialized();

    console.log('🔍 Starting IRIS Prime evaluation for all projects...');

    // Use IRIS Prime orchestrator to evaluate all projects
    const report = await irisPrime.evaluateAllProjects();

    // Store report in database
    if (report && Array.isArray(report)) {
      await Promise.all(
        report.map(r => storeIrisReport(r))
      );
    }

    console.log('✅ Evaluation complete:', {
      projectsEvaluated: Array.isArray(report) ? report.length : 0,
    });

    // Calculate summary
    const summary = Array.isArray(report) ? {
      total: report.length,
      excellent: report.filter(r => r.overallHealth === 'excellent').length,
      good: report.filter(r => r.overallHealth === 'good').length,
      fair: report.filter(r => r.overallHealth === 'fair').length,
      poor: report.filter(r => r.overallHealth === 'poor').length,
      critical: report.filter(r => r.overallHealth === 'critical').length,
    } : { total: 0, excellent: 0, good: 0, fair: 0, poor: 0, critical: 0 };

    return res.status(200).json({
      success: true,
      reports: report || [],
      summary,
      message: `Evaluated ${summary.total} projects successfully`,
    });
  } catch (error) {
    console.error('❌ Error in /api/iris/evaluate-all:', error);
    return res.status(500).json({
      success: false,
      error: 'Evaluation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
