/**
 * Browser polyfill for Node.js 'fs' module
 * Provides stub implementations to prevent errors when Node.js code is bundled for browser
 */

export const existsSync = () => false;
export const readFileSync = () => '';
export const writeFileSync = () => {};
export const mkdirSync = () => {};
export const readdirSync = () => [];
export const statSync = () => ({ isDirectory: () => false, isFile: () => false });
export const unlinkSync = () => {};
export const rmdirSync = () => {};

export default {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
  rmdirSync,
};
