/**
 * Simple IP check for dashboard access
 * Free, no Vercel Enterprise needed!
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Your allowed IP addresses (comma-separated)
const ALLOWED_IPS = process.env.ALLOWED_IPS?.split(',').map(ip => ip.trim()) || [
  '47.200.113.5',  // Your current IP
  '127.0.0.1',     // Localhost
  // Add more IPs here
];

export default function handler(req: VercelRequest, res: VercelResponse) {
  const ip = 
    req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
    req.headers['x-real-ip']?.toString() ||
    req.socket.remoteAddress ||
    'unknown';

  const allowed = ALLOWED_IPS.includes(ip);

  return res.status(200).json({
    ip,
    allowed,
    timestamp: new Date().toISOString(),
  });
}

