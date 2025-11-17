export interface SystemMetricSnapshot {
  timestamp: string;
  cpu_usage: number;
  memory_usage: number;
  active_connections: number;
  queue_depth: number;
  response_time: number;
  error_rate: number;
}

export interface MetricThreshold {
  metric: keyof Omit<SystemMetricSnapshot, 'timestamp'>;
  warningThreshold: number;
  criticalThreshold: number;
  label: string;
}

export interface DetectedAnomaly {
  id: string;
  timestamp: string;
  metric: string;
  value: number;
  threshold: number;
  severity: 'warning' | 'critical';
  message: string;
}

export interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'critical';
  metrics: {
    [key: string]: 'healthy' | 'warning' | 'critical';
  };
}
