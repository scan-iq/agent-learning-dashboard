import { AlertSeverity, AlertChannel } from './alerts';

export interface AlertAnalytics {
  totalAlerts: number;
  acknowledgedAlerts: number;
  dismissedAlerts: number;
  activeAlerts: number;
  mttr: number; // Mean time to resolution in minutes
  falsePositiveRate: number; // Percentage
  alertsByRule: {
    ruleId: string;
    ruleName: string;
    count: number;
    severity: AlertSeverity;
  }[];
  alertsBySeverity: {
    severity: AlertSeverity;
    count: number;
  }[];
  alertsByChannel: {
    channel: AlertChannel;
    count: number;
    successRate: number;
  }[];
  alertsOverTime: {
    timestamp: string;
    count: number;
    severity: AlertSeverity;
  }[];
  resolutionTimes: {
    ruleId: string;
    ruleName: string;
    avgResolutionTime: number;
    minTime: number;
    maxTime: number;
  }[];
  channelPerformance: {
    channel: AlertChannel;
    totalSent: number;
    successful: number;
    failed: number;
    avgDeliveryTime: number;
  }[];
}

export interface AlertMetric {
  id: string;
  alertId: string;
  ruleId: string;
  triggerTime: string;
  acknowledgeTime?: string;
  dismissTime?: string;
  resolutionTime?: number; // in minutes
  wasFalsePositive: boolean;
  channelsUsed: AlertChannel[];
  deliverySuccess: {
    [key in AlertChannel]?: boolean;
  };
}
