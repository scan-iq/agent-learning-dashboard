/**
 * API Route: Find Transferable Patterns
 * Uses IRIS Prime to discover cross-project patterns
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  initSupabase,
  irisPrime,
  getCrossProjectPatterns,
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

    const { projectId, minSuccessRate = 0.7, limit = 20 } = req.query;

    console.log('🔍 Discovering patterns...', { projectId, minSuccessRate, limit });

    // Get cross-project patterns
    const patterns = await getCrossProjectPatterns({
      minSuccessRate: parseFloat(minSuccessRate as string),
      minUsageCount: 3,
      limit: parseInt(limit as string),
    });

    // If specific project, find transferable patterns for it
    let transferablePatterns = [];
    if (projectId && typeof projectId === 'string') {
      const context = {
        sourceProjects: ['all'],
        targetProject: projectId,
      };
      transferablePatterns = await irisPrime.findTransferablePatterns(projectId, context);
    }

    // Group patterns by type
    const grouped = {
      strategy: patterns?.filter(p => p.pattern_type === 'strategy') || [],
      reasoning_chain: patterns?.filter(p => p.pattern_type === 'reasoning_chain') || [],
      few_shot: patterns?.filter(p => p.pattern_type === 'few_shot') || [],
      decision_tree: patterns?.filter(p => p.pattern_type === 'decision_tree') || [],
    };

    console.log('✅ Patterns discovered:', {
      total: patterns?.length || 0,
      transferable: transferablePatterns?.length || 0,
    });

    return res.status(200).json({
      success: true,
      patterns: grouped,
      transferablePatterns: transferablePatterns || [],
      summary: {
        total: patterns?.length || 0,
        byType: {
          strategy: grouped.strategy.length,
          reasoning_chain: grouped.reasoning_chain.length,
          few_shot: grouped.few_shot.length,
          decision_tree: grouped.decision_tree.length,
        },
        transferable: transferablePatterns?.length || 0,
      },
    });
  } catch (error) {
    console.error('❌ Error in /api/iris/patterns:', error);
    return res.status(500).json({
      success: false,
      error: 'Pattern discovery failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
