/**
 * Browser stub for agentdb (server-only package)
 * Provides minimal interface to prevent errors
 */

export class AgentDB {
  constructor() {}
  async init() {}
  async close() {}
  async query() { return []; }
  async insert() {}
  async update() {}
  async delete() {}
}

export function createDatabase(config?: any) {
  return new AgentDB();
}

export function getDatabase() {
  return new AgentDB();
}

export default AgentDB;
