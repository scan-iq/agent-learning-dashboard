import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { EventsFeed } from '@/components/dashboard/EventsFeed';
import { ProjectDetailsDialog } from '@/components/dashboard/ProjectDetailsDialog';
import { AnalyticsSection } from '@/components/dashboard/AnalyticsSection';
import { AnomalyDetectionCard } from '@/components/dashboard/AnomalyDetectionCard';
import { AnomalyInvestigationDialog } from '@/components/dashboard/AnomalyInvestigationDialog';
import { RemediationExecutionDialog, ExecutionState, ExecutionStep } from '@/components/dashboard/RemediationExecutionDialog';
import { ScheduleActionDialog } from '@/components/dashboard/ScheduleActionDialog';
import { ScheduledActionsCard } from '@/components/dashboard/ScheduledActionsCard';
import { LiveMonitoringDialog } from '@/components/dashboard/LiveMonitoringDialog';
import { mockOverviewMetrics, mockProjects, mockEvents, mockProjectDetails, mockAnomalies, mockDiagnosticData, Anomaly } from '@/lib/mock-data';
import { RemediationAction } from '@/types/diagnostics';
import { Schedule, ScheduledAction } from '@/types/scheduling';
import { Activity, CheckCircle2, AlertTriangle, Brain, Play, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { addHours, addDays, addWeeks, addMonths } from 'date-fns';

const Index = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [investigatingAnomaly, setInvestigatingAnomaly] = useState<Anomaly | null>(null);
  const [executionState, setExecutionState] = useState<ExecutionState | null>(null);
  const [executionDialogOpen, setExecutionDialogOpen] = useState(false);
  const [schedulingAction, setSchedulingAction] = useState<RemediationAction | null>(null);
  const [scheduledActions, setScheduledActions] = useState<ScheduledAction[]>([]);
  const [monitoringDialogOpen, setMonitoringDialogOpen] = useState(false);
  const [currentActionTitle, setCurrentActionTitle] = useState('');

  const selectedProject = selectedProjectId ? mockProjectDetails[selectedProjectId] : null;
  const diagnosticData = investigatingAnomaly ? mockDiagnosticData[investigatingAnomaly.id] : null;

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
      toast.success('Rollback Complete', {
        description: 'All changes have been reverted successfully.',
      });
    }, 3000);
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
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
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

          {/* Analytics Section */}
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
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <Play className="w-5 h-5 text-primary" />
                <span className="text-sm">Evaluate All</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <RefreshCw className="w-5 h-5 text-primary" />
                <span className="text-sm">Auto Retrain</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <span className="text-sm">Find Patterns</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
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
    </div>
  );
};

export default Index;
