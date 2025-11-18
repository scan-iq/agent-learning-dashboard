/**
 * Browser polyfill for Node.js 'crypto' module
 * Uses Web Crypto API where possible
 */

export const createHash = (algorithm: string) => {
  return {
    update: (data: any) => {
      return {
        digest: (encoding: string) => {
          // Simple hash stub - in production, use Web Crypto API
          return Math.random().toString(36).substring(7);
        }
      };
    }
  };
};

export const randomBytes = (size: number) => {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return bytes;
};

export default {
  createHash,
  randomBytes,
};
