/**
 * API Route: Auto Retrain Experts
 * Uses IRIS Prime to automatically retrain experts showing drift
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    ensureInitialized();

    const { projectId } = req.body || {};

    console.log('🔄 Starting auto-retrain...', projectId ? `for project: ${projectId}` : 'for all projects');

    // Use IRIS Prime to auto-retrain experts
    const result = await irisPrime.autoRetrainExperts(projectId);

    console.log('✅ Auto-retrain complete:', {
      expertsRetrained: Array.isArray(result) ? result.length : 0,
    });

    // Calculate summary
    const summary = Array.isArray(result) ? {
      total: result.length,
      successful: result.filter(r => r.status === 'success' || r.success).length,
      failed: result.filter(r => r.status === 'failed' || r.status === 'error').length,
      avgImprovement: result
        .filter(r => r.improvement !== undefined)
        .reduce((acc, r) => acc + (r.improvement || 0), 0) / result.length || 0,
    } : { total: 0, successful: 0, failed: 0, avgImprovement: 0 };

    return res.status(200).json({
      success: true,
      results: result || [],
      summary,
      message: `Retrained ${summary.successful}/${summary.total} experts successfully`,
    });
  } catch (error) {
    console.error('❌ Error in /api/iris/retrain:', error);
    return res.status(500).json({
      success: false,
      error: 'Auto-retrain failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
