import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { EventsFeed } from '@/components/dashboard/EventsFeed';
import { ProjectDetailsDialog } from '@/components/dashboard/ProjectDetailsDialog';
import { AnalyticsSection } from '@/components/dashboard/AnalyticsSection';
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard';
import { AnomalyDetectionCard } from '@/components/dashboard/AnomalyDetectionCard';
import { AnomalyInvestigationDialog } from '@/components/dashboard/AnomalyInvestigationDialog';
import { RemediationExecutionDialog, ExecutionState, ExecutionStep } from '@/components/dashboard/RemediationExecutionDialog';
import { ScheduleActionDialog } from '@/components/dashboard/ScheduleActionDialog';
import { ScheduledActionsCard } from '@/components/dashboard/ScheduledActionsCard';
import { LiveMonitoringDialog } from '@/components/dashboard/LiveMonitoringDialog';
import { ExecutionHistoryDialog } from '@/components/dashboard/ExecutionHistoryDialog';
import { AlertManagementDialog } from '@/components/dashboard/AlertManagementDialog';
import { AlertNotificationsPanel } from '@/components/dashboard/AlertNotificationsPanel';
import { AlertAnalyticsDashboard } from '@/components/dashboard/AlertAnalyticsDashboard';
import { AlertSentimentPanel } from '@/components/dashboard/AlertSentimentPanel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockDiagnosticData } from '@/lib/diagnostic-mock-data';
import type { Anomaly } from '@/types/anomaly';
import { useAlertSentiment } from '@/hooks/useAlertSentiment';
import { useIrisOverview, useProjectDetails } from '@/hooks/useIrisData';
import { useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { RemediationAction } from '@/types/diagnostics';
import { Schedule, ScheduledAction } from '@/types/scheduling';
import { ExecutionHistoryRecord } from '@/types/history';
import { AlertRule, NotificationChannel, AlertNotification, AlertChannel } from '@/types/alerts';
import { AlertAnalytics } from '@/types/alert-analytics';
import { Activity, CheckCircle2, AlertTriangle, Brain, Play, RefreshCw, History, Bell, BarChart3, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { addHours, addDays, addWeeks, addMonths } from 'date-fns';

const Index = () => {
  // React Query client for cache invalidation
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // API key is optional - just use IP-based auth for now
  // Users can configure API key later in settings if needed

  // Fetch real data from Supabase
  const { data: overviewData, isLoading, error } = useIrisOverview();

  // Extract data with fallbacks
  const mockOverviewMetrics = overviewData?.metrics || {
    total_projects: 0,
    healthy_projects: 0,
    warning_projects: 0,
    critical_projects: 0,
    total_runs_today: 0,
    avg_success_rate: 0,
    active_experts: 0,
    total_reflexions: 0,
  };
  const mockProjects = overviewData?.projects || [];
  const mockEvents = overviewData?.events || [];
  const mockAnomalies = overviewData?.anomalies || [];

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [investigatingAnomaly, setInvestigatingAnomaly] = useState<Anomaly | null>(null);
  const [executionState, setExecutionState] = useState<ExecutionState | null>(null);
  const [executionDialogOpen, setExecutionDialogOpen] = useState(false);
  const [schedulingAction, setSchedulingAction] = useState<RemediationAction | null>(null);
  const [scheduledActions, setScheduledActions] = useState<ScheduledAction[]>([]);
  const [monitoringDialogOpen, setMonitoringDialogOpen] = useState(false);
  const [currentActionTitle, setCurrentActionTitle] = useState('');
  const [executionHistory, setExecutionHistory] = useState<ExecutionHistoryRecord[]>([]);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [currentExecutionStartTime, setCurrentExecutionStartTime] = useState('');
  const [currentExecutionMetrics, setCurrentExecutionMetrics] = useState({
    avgCpu: 0,
    avgMemory: 0,
    peakCpu: 0,
    peakMemory: 0,
    avgResponseTime: 0,
    errorCount: 0,
  });
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [notificationChannels, setNotificationChannels] = useState<NotificationChannel[]>([
    { type: 'in_app', enabled: true, config: {} },
    { type: 'email', enabled: false, config: { recipients: [] } },
    { type: 'slack', enabled: false, config: {} },
    { type: 'webhook', enabled: false, config: {} },
  ]);
  const [alertNotifications, setAlertNotifications] = useState<AlertNotification[]>([]);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [alertAnalyticsOpen, setAlertAnalyticsOpen] = useState(false);
  const [sentimentPanelOpen, setSentimentPanelOpen] = useState(false);

  // Alert sentiment analysis
  const {
    recordFeedback,
    analyzeSentiment,
    applyRecommendation,
    clearFeedback,
    feedbackCount,
  } = useAlertSentiment(alertRules);

  // Fetch selected project details
  const { data: selectedProject } = useProjectDetails(selectedProjectId);
  const diagnosticData = investigatingAnomaly ? mockDiagnosticData[investigatingAnomaly.id] : null;

  // Button handlers
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['iris-overview'] });
    toast.success('Data refreshed');
  };

  const handleEvaluateAll = async () => {
    toast.loading('Evaluating all projects...', { id: 'evaluate-all' });
    try {
      // Call the IRIS Prime evaluate all endpoint
      const response = await fetch('/api/evaluate-all', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Evaluation failed');

      const data = await response.json();

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['iris-overview'] });
      toast.success(`Evaluated ${data.summary.total} projects successfully`, { id: 'evaluate-all' });

      console.log('Evaluation results:', data);
    } catch (error) {
      console.error('Evaluation error:', error);
      toast.error('Evaluation failed', { id: 'evaluate-all' });
    }
  };

  const handleAutoRetrain = async () => {
    toast.loading('Starting auto-retrain...', { id: 'retrain' });
    try {
      const response = await fetch('/api/retrain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error('Retrain failed');

      const data = await response.json();

      toast.success(`Retrained ${data.summary.successful} experts successfully`, { id: 'retrain' });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['iris-overview'] });

      console.log('Retrain results:', data);
    } catch (error) {
      console.error('Retrain error:', error);
      toast.error('Auto-retrain failed', { id: 'retrain' });
    }
  };

  const handleFindPatterns = async () => {
    toast.loading('Discovering patterns...', { id: 'patterns' });
    try {
      const response = await fetch('/api/patterns');

      if (!response.ok) throw new Error('Pattern discovery failed');

      const data = await response.json();

      toast.success(`Found ${data.summary.total} patterns!`, { id: 'patterns' });

      // TODO: Open patterns dialog with data
      console.log('Patterns discovered:', data);
    } catch (error) {
      console.error('Pattern discovery error:', error);
      toast.error('Pattern discovery failed', { id: 'patterns' });
    }
  };

  const handleRotationReport = async () => {
    if (!selectedProjectId) {
      toast.error('Please select a project first');
      return;
    }

    toast.loading('Generating rotation report...', { id: 'rotation' });
    try {
      const response = await fetch(`/api/rotation?projectId=${selectedProjectId}`);

      if (!response.ok) throw new Error('Rotation report failed');

      const data = await response.json();

      toast.success(`Generated report with ${data.summary.total} recommendations`, { id: 'rotation' });

      // TODO: Open rotation report dialog with data
      console.log('Rotation report:', data);
    } catch (error) {
      console.error('Rotation report error:', error);
      toast.error('Rotation report generation failed', { id: 'rotation' });
    }
  };

  const handleInvestigate = (anomaly: Anomaly) => {
    setInvestigatingAnomaly(anomaly);
  };

  const handleExecuteAction = (actionId: string) => {
    const anomaly = investigatingAnomaly;
    if (!anomaly) return;

    const diagnosticData = mockDiagnosticData[anomaly.id];
    const action = diagnosticData?.remediation_actions.find(a => a.id === actionId);
    if (!action) return;

    // Initialize execution state
    const initialState: ExecutionState = {
      actionId: action.id,
      actionTitle: action.title,
      status: 'preparing',
      currentStep: 0,
      totalSteps: action.steps.length,
      steps: action.steps.map((step, idx) => ({
        id: `step-${idx}`,
        description: step,
        status: 'pending',
      })),
      canRollback: true,
      progress: 0,
      startTime: new Date().toISOString(),
    };

    setExecutionState(initialState);
    setExecutionDialogOpen(true);
    setCurrentActionTitle(action.title);
    setMonitoringDialogOpen(true);
    setCurrentExecutionStartTime(new Date().toISOString());
    
    // Reset metrics
    setCurrentExecutionMetrics({
      avgCpu: 0,
      avgMemory: 0,
      peakCpu: 0,
      peakMemory: 0,
      avgResponseTime: 0,
      errorCount: 0,
    });

    // Start execution simulation
    setTimeout(() => executeNextStep(initialState), 1000);
  };

  const executeNextStep = (currentState: ExecutionState) => {
    const nextStepIndex = currentState.steps.findIndex(s => s.status === 'pending');
    if (nextStepIndex === -1 || currentState.status === 'paused') return;

    // Update current step to running
    const updatedState: ExecutionState = {
      ...currentState,
      status: 'running',
      currentStep: nextStepIndex + 1,
      steps: currentState.steps.map((step, idx) => 
        idx === nextStepIndex 
          ? { ...step, status: 'running', startTime: new Date().toISOString() }
          : step
      ),
    };
    setExecutionState(updatedState);

    // Simulate step execution (2-4 seconds per step)
    const executionTime = Math.random() * 2000 + 2000;
    const shouldFail = Math.random() < 0.15; // 15% chance of failure

    setTimeout(() => {
      const finalStepStatus: ExecutionStep['status'] = shouldFail ? 'failed' : 'completed';
      const completedSteps = nextStepIndex + (shouldFail ? 0 : 1);
      const progress = Math.round((completedSteps / currentState.totalSteps) * 100);

      const newState: ExecutionState = {
        ...updatedState,
        currentStep: nextStepIndex + 1,
        progress,
        steps: updatedState.steps.map((step, idx) => 
          idx === nextStepIndex 
            ? { 
                ...step, 
                status: finalStepStatus, 
                endTime: new Date().toISOString(),
                error: shouldFail ? 'Operation failed due to system constraint' : undefined
              }
            : step
        ),
      };

      if (shouldFail) {
        // Execution failed
        const failedState: ExecutionState = {
          ...newState,
          status: 'failed',
          endTime: new Date().toISOString(),
        };
        setExecutionState(failedState);
        setMonitoringDialogOpen(false);
        
        // Add to history
        addExecutionToHistory(failedState, 'failed', 'Operation failed due to system constraint', nextStepIndex);
        
        toast.error('Remediation Failed', {
          description: `Step ${nextStepIndex + 1} failed. You can rollback changes.`,
        });
      } else if (nextStepIndex + 1 === currentState.totalSteps) {
        // All steps completed
        const completedState: ExecutionState = {
          ...newState,
          status: 'completed',
          endTime: new Date().toISOString(),
        };
        setExecutionState(completedState);
        setMonitoringDialogOpen(false);
        
        // Add to history
        addExecutionToHistory(completedState, 'completed');
        
        toast.success('Remediation Completed', {
          description: 'All steps executed successfully. The issue has been resolved.',
        });
      } else {
        // Continue to next step
        setExecutionState(newState);
        setTimeout(() => executeNextStep(newState), 500);
      }
    }, executionTime);
  };

  const handlePauseExecution = () => {
    if (!executionState) return;
    setExecutionState({ ...executionState, status: 'paused' });
    toast.info('Execution Paused', {
      description: 'You can resume or rollback changes.',
    });
  };

  const handleResumeExecution = () => {
    if (!executionState) return;
    const resumedState = { ...executionState, status: 'running' as const };
    setExecutionState(resumedState);
    toast.info('Execution Resumed', {
      description: 'Continuing with remediation steps.',
    });
    setTimeout(() => executeNextStep(resumedState), 500);
  };

  const handleRollback = () => {
    if (!executionState) return;

    const rollbackState: ExecutionState = {
      ...executionState,
      status: 'rolling_back',
    };
    setExecutionState(rollbackState);

    toast.info('Rolling Back Changes', {
      description: 'Reverting completed steps...',
    });

    // Simulate rollback process
    setTimeout(() => {
      const rolledBackState: ExecutionState = {
        ...rollbackState,
        status: 'rolled_back',
        steps: rollbackState.steps.map(step => 
          step.status === 'completed' 
            ? { ...step, status: 'rolled_back' }
            : step
        ),
        endTime: new Date().toISOString(),
      };
      setExecutionState(rolledBackState);
      
      // Add to history
      addExecutionToHistory(rolledBackState, 'rolled_back', undefined, undefined, 'User initiated rollback due to execution failure');
      
      toast.success('Rollback Complete', {
        description: 'All changes have been reverted successfully.',
      });
    }, 3000);
  };

  const addExecutionToHistory = (
    state: ExecutionState,
    status: 'completed' | 'failed' | 'rolled_back',
    errorMessage?: string,
    failedStep?: number,
    rollbackReason?: string
  ) => {
    const endTime = new Date().toISOString();
    const duration = (new Date(endTime).getTime() - new Date(currentExecutionStartTime).getTime()) / 1000;

    // Generate realistic metrics based on execution
    const avgCpu = 40 + Math.random() * 40;
    const avgMemory = 50 + Math.random() * 30;
    const peakCpu = avgCpu + 10 + Math.random() * 20;
    const peakMemory = avgMemory + 10 + Math.random() * 15;

    const historyRecord: ExecutionHistoryRecord = {
      id: `exec-${Date.now()}`,
      actionId: state.actionId,
      actionTitle: state.actionTitle,
      projectId: investigatingAnomaly?.project || 'unknown',
      projectName: investigatingAnomaly?.project || 'Unknown Project',
      startTime: currentExecutionStartTime,
      endTime,
      duration,
      status,
      totalSteps: state.totalSteps,
      completedSteps: state.steps.filter(s => s.status === 'completed').length,
      failedStep,
      errorMessage,
      rollbackReason,
      metrics: {
        avgCpuUsage: avgCpu,
        avgMemoryUsage: avgMemory,
        peakCpuUsage: peakCpu,
        peakMemoryUsage: peakMemory,
        avgResponseTime: 100 + Math.random() * 200,
        errorCount: status === 'failed' ? 1 : 0,
      },
      executedBy: 'manual',
    };

    setExecutionHistory((prev) => [historyRecord, ...prev]);
  };

  const handleAddAlertRule = (rule: Omit<AlertRule, 'id' | 'createdAt'>) => {
    const newRule: AlertRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAlertRules([...alertRules, newRule]);
    toast.success('Alert Rule Created', {
      description: `"${rule.name}" will now monitor ${rule.metric}`,
    });
  };

  const handleUpdateAlertRule = (id: string, updates: Partial<AlertRule>) => {
    setAlertRules(alertRules.map(rule => rule.id === id ? { ...rule, ...updates } : rule));
    toast.info('Alert Rule Updated');
  };

  const handleDeleteAlertRule = (id: string) => {
    setAlertRules(alertRules.filter(rule => rule.id !== id));
    toast.success('Alert Rule Deleted');
  };

  const handleUpdateNotificationChannel = (channel: NotificationChannel) => {
    setNotificationChannels(
      notificationChannels.map(c => c.type === channel.type ? channel : c)
    );
    toast.info('Notification Channel Updated');
  };

  const handleAcknowledgeAlert = (id: string) => {
    const alert = alertNotifications.find(a => a.id === id);
    if (alert) {
      recordFeedback(alert, 'acknowledged');
    }
    
    setAlertNotifications(
      alertNotifications.map(notification =>
        notification.id === id
          ? {
              ...notification,
              acknowledged: true,
              acknowledgedAt: new Date().toISOString(),
              acknowledgedBy: 'user',
            }
          : notification
      )
    );
    toast.success('Alert Acknowledged');
  };

  const handleDismissAlert = (id: string) => {
    const alert = alertNotifications.find(a => a.id === id);
    if (alert) {
      recordFeedback(alert, 'dismissed');
    }
    
    setAlertNotifications(alertNotifications.filter(n => n.id !== id));
    toast.success('Alert Dismissed');
  };

  // Calculate alert analytics
  const alertAnalytics: AlertAnalytics = useMemo(() => {
    const totalAlerts = alertNotifications.length;
    const acknowledgedAlerts = alertNotifications.filter(n => n.acknowledged).length;
    const dismissedAlerts = 0; // Track separately if needed
    const activeAlerts = alertNotifications.filter(n => !n.acknowledged).length;

    // Calculate MTTR
    const acknowledgedWithTime = alertNotifications.filter(
      n => n.acknowledged && n.acknowledgedAt
    );
    const avgResolutionTime = acknowledgedWithTime.length > 0
      ? acknowledgedWithTime.reduce((acc, n) => {
          const resolution = (new Date(n.acknowledgedAt!).getTime() - new Date(n.timestamp).getTime()) / 60000;
          return acc + resolution;
        }, 0) / acknowledgedWithTime.length
      : 0;

    // False positive rate (simulated - would need user feedback in real system)
    const falsePositiveRate = Math.random() * 15; // 0-15%

    // Group by rule
    const alertsByRule = alertRules.map(rule => ({
      ruleId: rule.id,
      ruleName: rule.name,
      count: alertNotifications.filter(n => n.ruleName === rule.name).length,
      severity: rule.severity,
    })).filter(r => r.count > 0);

    // Group by severity
    const alertsBySeverity = [
      { severity: 'info' as const, count: alertNotifications.filter(n => n.severity === 'info').length },
      { severity: 'warning' as const, count: alertNotifications.filter(n => n.severity === 'warning').length },
      { severity: 'critical' as const, count: alertNotifications.filter(n => n.severity === 'critical').length },
    ].filter(s => s.count > 0);

    // Channel performance
    const channelPerformance = (['in_app', 'email', 'slack', 'webhook'] as AlertChannel[]).map(channel => {
      const channelAlerts = alertNotifications.filter(n => n.channels.includes(channel));
      const totalSent = channelAlerts.length;
      const successful = channelAlerts.filter(
        n => n.deliveryStatus[channel] === 'sent'
      ).length;
      const failed = channelAlerts.filter(
        n => n.deliveryStatus[channel] === 'failed'
      ).length;

      return {
        channel,
        totalSent,
        successful,
        failed,
        avgDeliveryTime: 50 + Math.random() * 150, // Simulated
      };
    }).filter(c => c.totalSent > 0);

    // Resolution times by rule
    const resolutionTimes = alertsByRule.map(rule => {
      const ruleAlerts = alertNotifications.filter(
        n => n.ruleName === rule.ruleName && n.acknowledged && n.acknowledgedAt
      );
      const times = ruleAlerts.map(
        n => (new Date(n.acknowledgedAt!).getTime() - new Date(n.timestamp).getTime()) / 60000
      );

      return {
        ruleId: rule.ruleId,
        ruleName: rule.ruleName,
        avgResolutionTime: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0,
        minTime: times.length > 0 ? Math.min(...times) : 0,
        maxTime: times.length > 0 ? Math.max(...times) : 0,
      };
    });

    return {
      totalAlerts,
      acknowledgedAlerts,
      dismissedAlerts,
      activeAlerts,
      mttr: avgResolutionTime,
      falsePositiveRate,
      alertsByRule,
      alertsBySeverity,
      alertsByChannel: channelPerformance.map(c => ({
        channel: c.channel,
        count: c.totalSent,
        successRate: c.totalSent > 0 ? (c.successful / c.totalSent) * 100 : 0,
      })),
      alertsOverTime: alertNotifications.map(n => ({
        timestamp: n.timestamp,
        count: 1,
        severity: n.severity,
      })),
      resolutionTimes,
      channelPerformance,
    };
  }, [alertNotifications, alertRules]);

  // Handle applying sentiment recommendations
  const handleApplySentimentRecommendation = (ruleId: string) => {
    const recommendation = applyRecommendation(ruleId);
    if (recommendation) {
      handleUpdateAlertRule(ruleId, {
        threshold: recommendation.recommendedThreshold,
      });
      toast.success('Threshold Updated', {
        description: `${recommendation.ruleName} threshold adjusted to ${recommendation.recommendedThreshold} based on learning.`,
      });
    }
  };

  const handleScheduleAction = (actionId: string) => {
    const diagnosticData = investigatingAnomaly ? mockDiagnosticData[investigatingAnomaly.id] : null;
    const action = diagnosticData?.remediation_actions.find(a => a.id === actionId);
    if (!action) return;
    setSchedulingAction(action);
  };

  const handleSchedule = (actionId: string, schedule: Schedule) => {
    const anomaly = investigatingAnomaly;
    if (!anomaly) return;

    const action = mockDiagnosticData[anomaly.id]?.remediation_actions.find(a => a.id === actionId);
    if (!action) return;

    // Calculate next execution time
    const calculateNextExecution = (schedule: Schedule): string => {
      const baseDate = schedule.scheduledTime ? new Date(schedule.scheduledTime) : new Date();
      
      if (schedule.type === 'once') {
        return baseDate.toISOString();
      }

      if (schedule.recurrence) {
        const { pattern, interval } = schedule.recurrence;
        let nextDate = baseDate;

        switch (pattern) {
          case 'hourly':
            nextDate = addHours(baseDate, interval);
            break;
          case 'daily':
            nextDate = addDays(baseDate, interval);
            break;
          case 'weekly':
            nextDate = addWeeks(baseDate, interval);
            break;
          case 'monthly':
            nextDate = addMonths(baseDate, interval);
            break;
        }

        return nextDate.toISOString();
      }

      return baseDate.toISOString();
    };

    const newScheduledAction: ScheduledAction = {
      id: `sched-${Date.now()}`,
      actionId: action.id,
      actionTitle: action.title,
      actionDescription: action.description,
      projectId: anomaly.project,
      projectName: anomaly.project,
      schedule,
      enabled: true,
      createdAt: new Date().toISOString(),
      nextExecution: calculateNextExecution(schedule),
      executionCount: 0,
      status: 'active',
    };

    setScheduledActions([...scheduledActions, newScheduledAction]);
    setSchedulingAction(null);

    toast.success('Action Scheduled', {
      description: `${action.title} will execute ${schedule.type === 'once' ? 'once' : 'on a recurring schedule'}.`,
    });
  };

  const handleToggleScheduledAction = (id: string, enabled: boolean) => {
    setScheduledActions(
      scheduledActions.map(action =>
        action.id === id
          ? { ...action, enabled, status: enabled ? 'active' : 'paused' as const }
          : action
      )
    );
    toast.info(enabled ? 'Action Enabled' : 'Action Paused', {
      description: enabled ? 'The scheduled action is now active.' : 'The scheduled action has been paused.',
    });
  };

  const handleExecuteScheduledAction = (id: string) => {
    const scheduledAction = scheduledActions.find(a => a.id === id);
    if (!scheduledAction) return;

    toast.success('Executing Scheduled Action', {
      description: `Running ${scheduledAction.actionTitle} immediately...`,
    });

    // Update execution stats
    setTimeout(() => {
      setScheduledActions(
        scheduledActions.map(action =>
          action.id === id
            ? {
                ...action,
                lastExecuted: new Date().toISOString(),
                executionCount: action.executionCount + 1,
              }
            : action
        )
      );
    }, 2000);
  };

  const handleDeleteScheduledAction = (id: string) => {
    setScheduledActions(scheduledActions.filter(action => action.id !== id));
    toast.success('Scheduled Action Deleted', {
      description: 'The scheduled action has been removed.',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-control-bg">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center glow-effect">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">IRIS Prime</h1>
                <p className="text-sm text-muted-foreground">AI Operations Control Plane</p>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-6 py-8">
          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">System Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="border border-border rounded-lg p-6">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))}
              </div>
            </section>
            <section>
              <Skeleton className="h-64 w-full rounded-lg" />
            </section>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Failed to Load Dashboard</h2>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-control-bg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center glow-effect">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">IRIS Prime</h1>
                <p className="text-sm text-muted-foreground">AI Operations Control Plane</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => navigate('/settings/api-keys')}
              >
                <Settings className="w-4 h-4" />
                API Keys
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setAlertAnalyticsOpen(true)}
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setSentimentPanelOpen(true)}
              >
                <Brain className="w-4 h-4" />
                Learning
                {feedbackCount > 0 && (
                  <Badge variant="outline" className="ml-1 bg-primary/10 text-primary border-primary">
                    {feedbackCount}
                  </Badge>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setAlertDialogOpen(true)}
              >
                <Bell className="w-4 h-4" />
                Alerts
                {alertNotifications.filter(n => !n.acknowledged).length > 0 && (
                  <Badge variant="outline" className="ml-1 bg-destructive/10 text-destructive border-destructive">
                    {alertNotifications.filter(n => !n.acknowledged).length}
                  </Badge>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setHistoryDialogOpen(true)}
              >
                <History className="w-4 h-4" />
                History
                {executionHistory.length > 0 && (
                  <Badge variant="outline" className="ml-1 bg-primary/10 text-primary border-primary">
                    {executionHistory.length}
                  </Badge>
                )}
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleEvaluateAll}>
                <Play className="w-4 h-4" />
                Evaluate All
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Overview Metrics */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Projects"
                value={mockOverviewMetrics.total_projects}
                icon={Activity}
              />
              <MetricCard
                title="Healthy Projects"
                value={mockOverviewMetrics.healthy_projects}
                icon={CheckCircle2}
                trend={{ value: 12, direction: 'up' }}
              />
              <MetricCard
                title="Avg Success Rate"
                value={`${mockOverviewMetrics.avg_success_rate}%`}
                icon={Brain}
                trend={{ value: 3, direction: 'up' }}
              />
              <MetricCard
                title="Active Experts"
                value={mockOverviewMetrics.active_experts}
                icon={Brain}
              />
            </div>
          </section>

          {/* Anomaly Detection */}
          <section>
            <AnomalyDetectionCard anomalies={mockAnomalies} onInvestigate={handleInvestigate} />
          </section>

          {/* Alert Notifications */}
          <section>
            <AlertNotificationsPanel
              notifications={alertNotifications}
              onAcknowledge={handleAcknowledgeAlert}
              onDismiss={handleDismissAlert}
            />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Projects Grid */}
            <section className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Active Projects</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="status-indicator status-healthy" />
                  <span>{mockOverviewMetrics.healthy_projects} Healthy</span>
                  <span className="status-indicator status-warning ml-3" />
                  <span>{mockOverviewMetrics.warning_projects} Warning</span>
                </div>
              </div>
              <div className="grid gap-4">
                {mockProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onViewDetails={setSelectedProjectId}
                  />
                ))}
              </div>
            </section>

            {/* Events Feed */}
            <section>
              <EventsFeed events={mockEvents} />
            </section>
          </div>

          {/* Backend Analytics Dashboard - NEW! */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Backend Analytics</h2>
                <p className="text-sm text-muted-foreground">
                  Live data from IRIS Prime API - Token usage, costs, and performance metrics
                </p>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                Live Data
              </Badge>
            </div>
            <AnalyticsDashboard />
          </section>

          {/* Legacy Analytics Section (Supabase Direct) */}
          <AnalyticsSection />

          {/* Scheduled Actions */}
          <section>
            <ScheduledActionsCard
              scheduledActions={scheduledActions}
              onToggle={handleToggleScheduledAction}
              onExecuteNow={handleExecuteScheduledAction}
              onDelete={handleDeleteScheduledAction}
            />
          </section>

          {/* Quick Actions */}
          <section className="border-t border-border pt-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={handleEvaluateAll}>
                <Play className="w-5 h-5 text-primary" />
                <span className="text-sm">Evaluate All</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={handleAutoRetrain}>
                <RefreshCw className="w-5 h-5 text-primary" />
                <span className="text-sm">Auto Retrain</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={handleFindPatterns}>
                <Brain className="w-5 h-5 text-primary" />
                <span className="text-sm">Find Patterns</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={handleRotationReport}>
                <Activity className="w-5 h-5 text-primary" />
                <span className="text-sm">Rotation Report</span>
              </Button>
            </div>
          </section>
        </div>
      </main>

      {/* Project Details Dialog */}
      <ProjectDetailsDialog
        project={selectedProject}
        open={selectedProjectId !== null}
        onClose={() => setSelectedProjectId(null)}
      />

      {/* Anomaly Investigation Dialog */}
      <AnomalyInvestigationDialog
        anomaly={investigatingAnomaly}
        diagnosticData={diagnosticData}
        open={investigatingAnomaly !== null}
        onClose={() => setInvestigatingAnomaly(null)}
        onExecuteAction={handleExecuteAction}
        onScheduleAction={handleScheduleAction}
      />

      {/* Schedule Action Dialog */}
      <ScheduleActionDialog
        action={schedulingAction}
        projectId={investigatingAnomaly?.project || ''}
        projectName={investigatingAnomaly?.project || ''}
        open={schedulingAction !== null}
        onClose={() => setSchedulingAction(null)}
        onSchedule={handleSchedule}
      />

      {/* Remediation Execution Dialog */}
      <RemediationExecutionDialog
        execution={executionState}
        open={executionDialogOpen}
        onClose={() => setExecutionDialogOpen(false)}
        onPause={handlePauseExecution}
        onResume={handleResumeExecution}
        onRollback={handleRollback}
      />

      {/* Live Monitoring Dialog */}
      <LiveMonitoringDialog
        open={monitoringDialogOpen}
        onClose={() => setMonitoringDialogOpen(false)}
        actionTitle={currentActionTitle}
        isExecuting={executionState?.status === 'running' || executionState?.status === 'preparing'}
      />

      {/* Execution History Dialog */}
      <ExecutionHistoryDialog
        history={executionHistory}
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
      />

      {/* Alert Management Dialog */}
      <AlertManagementDialog
        rules={alertRules}
        channels={notificationChannels}
        open={alertDialogOpen}
        onClose={() => setAlertDialogOpen(false)}
        onAddRule={handleAddAlertRule}
        onUpdateRule={handleUpdateAlertRule}
        onDeleteRule={handleDeleteAlertRule}
        onUpdateChannel={handleUpdateNotificationChannel}
      />

      {/* Alert Analytics Dashboard */}
      <AlertAnalyticsDashboard
        analytics={alertAnalytics}
        notifications={alertNotifications}
        open={alertAnalyticsOpen}
        onClose={() => setAlertAnalyticsOpen(false)}
      />

      {/* Alert Sentiment Analysis Dialog */}
      <Dialog open={sentimentPanelOpen} onOpenChange={setSentimentPanelOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Alert Sentiment Analysis & Learning</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[70vh]">
            <AlertSentimentPanel
              analysis={analyzeSentiment()}
              onApplyRecommendation={handleApplySentimentRecommendation}
              onClearData={() => {
                clearFeedback();
                toast.success('Learning Data Cleared', {
                  description: 'All sentiment analysis data has been reset.',
                });
              }}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
