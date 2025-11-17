/**
 * Client-side IP check
 * Calls our API to verify IP is allowed
 */

export async function checkIpAccess(): Promise<boolean> {
  try {
    const response = await fetch('/api/check-ip');
    const data = await response.json();
    
    if (!data.allowed) {
      console.warn('🚫 Access denied from IP:', data.ip);
      return false;
    }
    
    console.log('✅ Access granted from IP:', data.ip);
    return true;
  } catch (error) {
    console.error('IP check failed:', error);
    // Fail open (allow access) if check fails
    return true;
  }
}

