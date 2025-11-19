/**
 * Debug endpoint: Check what tables exist in Supabase
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY?.trim();

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try different possible table names
    const tables = [
      'iris_reports',
      'iris_project_health',
      'telemetry',
      'consensus_records',
      'reflexions',
      'expert_signatures',
      'system_events',
      'anomalies',
    ];

    const results: any = {};

    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: false })
          .limit(3);

        results[table] = {
          exists: !error,
          count,
          error: error?.message,
          sample: data,
        };
      } catch (e) {
        results[table] = {
          exists: false,
          error: e instanceof Error ? e.message : 'Unknown error',
        };
      }
    }

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
