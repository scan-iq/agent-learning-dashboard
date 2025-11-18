/**
 * Browser polyfill for Node.js 'fs/promises' module
 * Provides async stub implementations
 */

export const readFile = async () => '';
export const writeFile = async () => {};
export const mkdir = async () => {};
export const readdir = async () => [];
export const stat = async () => ({ isDirectory: () => false, isFile: () => false });
export const unlink = async () => {};
export const rmdir = async () => {};
export const access = async () => {};

export default {
  readFile,
  writeFile,
  mkdir,
  readdir,
  stat,
  unlink,
  rmdir,
  access,
};
