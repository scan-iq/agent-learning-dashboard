import { RemediationAction } from './diagnostics';

export type ScheduleType = 'once' | 'recurring';
export type RecurrencePattern = 'hourly' | 'daily' | 'weekly' | 'monthly';
export type ConditionType = 'threshold' | 'anomaly_detected' | 'health_score' | 'success_rate';

export interface ScheduleCondition {
  type: ConditionType;
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: number;
}

export interface Schedule {
  type: ScheduleType;
  scheduledTime?: string; // ISO timestamp for 'once', start time for 'recurring'
  recurrence?: {
    pattern: RecurrencePattern;
    interval: number; // e.g., every 2 hours, every 3 days
    endDate?: string;
  };
  conditions?: ScheduleCondition[];
}

export interface ScheduledAction {
  id: string;
  actionId: string;
  actionTitle: string;
  actionDescription: string;
  projectId: string;
  projectName: string;
  schedule: Schedule;
  enabled: boolean;
  createdAt: string;
  lastExecuted?: string;
  nextExecution?: string;
  executionCount: number;
  status: 'pending' | 'active' | 'paused' | 'completed' | 'failed';
}
