export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertChannel = 'email' | 'slack' | 'webhook' | 'in_app';
export type MetricType = 'cpu_usage' | 'memory_usage' | 'response_time' | 'error_rate' | 'queue_depth' | 'active_connections';

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  metric: MetricType;
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  severity: AlertSeverity;
  duration: number; // in seconds - how long condition must persist
  channels: AlertChannel[];
  cooldown: number; // in minutes - prevent alert spam
  lastTriggered?: string;
  createdAt: string;
}

export interface AlertNotification {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: AlertSeverity;
  metric: MetricType;
  value: number;
  threshold: number;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  channels: AlertChannel[];
  deliveryStatus: {
    [key in AlertChannel]?: 'pending' | 'sent' | 'failed';
  };
}

export interface NotificationChannel {
  type: AlertChannel;
  enabled: boolean;
  config: {
    // Email
    recipients?: string[];
    // Slack
    webhookUrl?: string;
    channel?: string;
    // Webhook
    url?: string;
    headers?: Record<string, string>;
    method?: 'POST' | 'PUT';
  };
}
