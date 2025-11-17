import { AlertSeverity, MetricType } from './alerts';

export interface AlertFeedback {
  alertId: string;
  ruleId: string;
  metric: MetricType;
  threshold: number;
  value: number;
  action: 'acknowledged' | 'dismissed';
  timestamp: string;
  severity: AlertSeverity;
}

export interface ThresholdRecommendation {
  ruleId: string;
  ruleName: string;
  metric: MetricType;
  currentThreshold: number;
  recommendedThreshold: number;
  confidence: number;
  reason: string;
  dismissalRate: number;
  sampleSize: number;
}

export interface SentimentAnalysis {
  totalFeedback: number;
  acknowledgmentRate: number;
  dismissalRate: number;
  recommendations: ThresholdRecommendation[];
  learningProgress: {
    metric: MetricType;
    feedbackCount: number;
    confidence: number;
  }[];
}
