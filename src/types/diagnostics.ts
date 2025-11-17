export interface DiagnosticLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  source: string;
  message: string;
  context?: Record<string, any>;
}

export interface ExpertTrace {
  id: string;
  expert_name: string;
  timestamp: string;
  input: string;
  output: string;
  confidence: number;
  latency: number;
  success: boolean;
  error_message?: string;
}

export interface RemediationAction {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  automated: boolean;
  estimated_time: string;
  steps: string[];
}

export interface DiagnosticData {
  anomaly_id: string;
  summary: {
    root_cause: string;
    impact: string;
    affected_components: string[];
  };
  logs: DiagnosticLog[];
  expert_traces: ExpertTrace[];
  remediation_actions: RemediationAction[];
  system_metrics: {
    cpu_usage: number;
    memory_usage: number;
    active_connections: number;
    queue_depth: number;
  };
}
