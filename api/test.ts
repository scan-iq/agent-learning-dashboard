/**
 * Simple test endpoint - no dependencies
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL?.trim(),
      hasSupabaseKey: !!process.env.VITE_SUPABASE_ANON_KEY?.trim(),
    }
  });
}
