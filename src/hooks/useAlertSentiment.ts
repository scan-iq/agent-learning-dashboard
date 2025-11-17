import { useState, useEffect, useCallback } from 'react';
import { AlertFeedback, SentimentAnalysis, ThresholdRecommendation } from '@/types/alert-sentiment';
import { AlertNotification, AlertRule } from '@/types/alerts';

const STORAGE_KEY = 'alert_feedback_data';
const MIN_SAMPLES = 5; // Minimum samples needed for recommendations

export function useAlertSentiment(rules: AlertRule[]) {
  const [feedback, setFeedback] = useState<AlertFeedback[]>([]);

  // Load feedback from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setFeedback(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load feedback data:', e);
      }
    }
  }, []);

  // Save feedback to localStorage
  const saveFeedback = useCallback((newFeedback: AlertFeedback[]) => {
    setFeedback(newFeedback);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFeedback));
  }, []);

  // Record feedback
  const recordFeedback = useCallback((
    alert: AlertNotification,
    action: 'acknowledged' | 'dismissed'
  ) => {
    const newFeedbackEntry: AlertFeedback = {
      alertId: alert.id,
      ruleId: alert.ruleId,
      metric: alert.metric,
      threshold: alert.threshold,
      value: alert.value,
      action,
      timestamp: new Date().toISOString(),
      severity: alert.severity,
    };

    saveFeedback([...feedback, newFeedbackEntry]);
  }, [feedback, saveFeedback]);

  // Analyze feedback and generate recommendations
  const analyzeSentiment = useCallback((): SentimentAnalysis => {
    if (feedback.length === 0) {
      return {
        totalFeedback: 0,
        acknowledgmentRate: 0,
        dismissalRate: 0,
        recommendations: [],
        learningProgress: [],
      };
    }

    const acknowledged = feedback.filter(f => f.action === 'acknowledged').length;
    const dismissed = feedback.filter(f => f.action === 'dismissed').length;

    // Group feedback by rule
    const feedbackByRule = feedback.reduce((acc, f) => {
      if (!acc[f.ruleId]) acc[f.ruleId] = [];
      acc[f.ruleId].push(f);
      return acc;
    }, {} as Record<string, AlertFeedback[]>);

    // Generate recommendations for each rule
    const recommendations: ThresholdRecommendation[] = [];
    
    Object.entries(feedbackByRule).forEach(([ruleId, ruleFeedback]) => {
      if (ruleFeedback.length < MIN_SAMPLES) return;

      const rule = rules.find(r => r.id === ruleId);
      if (!rule) return;

      const dismissals = ruleFeedback.filter(f => f.action === 'dismissed');
      const dismissalRate = dismissals.length / ruleFeedback.length;

      // If dismissal rate is high (>40%), suggest threshold adjustment
      if (dismissalRate > 0.4) {
        const dismissedValues = dismissals.map(f => f.value);
        const avgDismissedValue = dismissedValues.reduce((a, b) => a + b, 0) / dismissedValues.length;
        
        // Calculate recommended threshold based on dismissed values
        let recommendedThreshold: number;
        if (rule.condition === 'gt' || rule.condition === 'gte') {
          // For "greater than" conditions, increase threshold
          recommendedThreshold = Math.round(avgDismissedValue * 1.15);
        } else {
          // For "less than" conditions, decrease threshold
          recommendedThreshold = Math.round(avgDismissedValue * 0.85);
        }

        const confidence = Math.min(
          0.95,
          0.5 + (ruleFeedback.length / 20) * 0.45
        );

        recommendations.push({
          ruleId: rule.id,
          ruleName: rule.name,
          metric: rule.metric,
          currentThreshold: rule.threshold,
          recommendedThreshold,
          confidence,
          reason: `${Math.round(dismissalRate * 100)}% of alerts dismissed. Adjusting threshold to reduce false positives.`,
          dismissalRate,
          sampleSize: ruleFeedback.length,
        });
      }
    });

    // Calculate learning progress by metric
    const feedbackByMetric = feedback.reduce((acc, f) => {
      if (!acc[f.metric]) acc[f.metric] = [];
      acc[f.metric].push(f);
      return acc;
    }, {} as Record<string, AlertFeedback[]>);

    const learningProgress = Object.entries(feedbackByMetric).map(([metric, data]) => ({
      metric: metric as any,
      feedbackCount: data.length,
      confidence: Math.min(0.95, 0.3 + (data.length / 30) * 0.65),
    }));

    return {
      totalFeedback: feedback.length,
      acknowledgmentRate: acknowledged / feedback.length,
      dismissalRate: dismissed / feedback.length,
      recommendations,
      learningProgress,
    };
  }, [feedback, rules]);

  // Apply a recommendation
  const applyRecommendation = useCallback((ruleId: string) => {
    // This returns the recommendation so the parent component can apply it
    const analysis = analyzeSentiment();
    return analysis.recommendations.find(r => r.ruleId === ruleId);
  }, [analyzeSentiment]);

  // Clear all feedback
  const clearFeedback = useCallback(() => {
    setFeedback([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    recordFeedback,
    analyzeSentiment,
    applyRecommendation,
    clearFeedback,
    feedbackCount: feedback.length,
  };
}
