/**
 * API Route: Find Transferable Patterns
 * Direct Supabase queries - pattern discovery logic
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
    const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY?.trim();

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { projectId, minSuccessRate = 0.7, limit = 20 } = req.query;

    // Try to fetch from stored_patterns table
    const patternsResult = await supabase
      .from('stored_patterns')
      .select('*')
      .gte('success_rate', parseFloat(minSuccessRate as string))
      .order('success_rate', { ascending: false })
      .limit(parseInt(limit as string))
      .then(r => r, () => ({ data: null, error: null }));

    const patterns = patternsResult.data;

    // If no stored_patterns table, derive from reflexions
    let derivedPatterns: any[] = [];
    if (!patterns || patterns.length === 0) {
      const reflexionsResult = await supabase
        .from('reflexion_bank')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
        .then(r => r, () => ({ data: [], error: null }));

      const reflexions = reflexionsResult.data;

      // Extract patterns from successful reflexions
      derivedPatterns = reflexions?.map((ref, idx) => ({
        id: ref.id || `pattern-${idx}`,
        name: ref.pattern || ref.strategy || 'Unnamed Pattern',
        pattern_type: ref.type || 'reflexion',
        success_rate: ref.impact_score || 0.7,
        usage_count: ref.reused_count || 1,
        project: ref.project,
        description: ref.description || ref.pattern,
        reusable: true,
        created_at: ref.created_at,
      })) || [];
    }

    const allPatterns = patterns || derivedPatterns;

    // Group by type
    const grouped = {
      strategy: allPatterns.filter(p => p.pattern_type === 'strategy' || p.pattern_type === 'reflexion'),
      reasoning_chain: allPatterns.filter(p => p.pattern_type === 'reasoning_chain'),
      few_shot: allPatterns.filter(p => p.pattern_type === 'few_shot'),
      decision_tree: allPatterns.filter(p => p.pattern_type === 'decision_tree'),
    };

    // Find transfer opportunities for specific project
    const transferablePatterns = projectId
      ? allPatterns.filter(p => p.project !== projectId && p.reusable).slice(0, 10)
      : [];

    console.log('✅ Found', allPatterns.length, 'patterns');

    return res.status(200).json({
      success: true,
      patterns: grouped,
      transferablePatterns,
      summary: {
        total: allPatterns.length,
        byType: {
          strategy: grouped.strategy.length,
          reasoning_chain: grouped.reasoning_chain.length,
          few_shot: grouped.few_shot.length,
          decision_tree: grouped.decision_tree.length,
        },
        transferable: transferablePatterns.length,
      },
    });
  } catch (error) {
    console.error('Pattern discovery error:', error);
    return res.status(500).json({
      success: false,
      error: 'Pattern discovery failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
