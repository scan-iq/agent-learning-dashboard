/**
 * Anomaly type definition
 * Copied from @foxruv/agent-learning-core to make frontend standalone
 */
export interface Anomaly {
  id: string;
  timestamp: string;
  project: string;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  metric: string;
  value: number;
  expected: number;
  deviation: number;
  description: string;
  resolved: boolean;
}
