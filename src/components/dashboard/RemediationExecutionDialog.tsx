import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

export interface ExecutionStep {
  id: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
  startTime?: string;
  endTime?: string;
  error?: string;
}

export interface ExecutionState {
  actionId: string;
  actionTitle: string;
  status: 'preparing' | 'running' | 'paused' | 'completed' | 'failed' | 'rolling_back' | 'rolled_back';
  currentStep: number;
  totalSteps: number;
  steps: ExecutionStep[];
  canRollback: boolean;
  progress: number;
  startTime: string;
  endTime?: string;
}

interface RemediationExecutionDialogProps {
  execution: ExecutionState | null;
  open: boolean;
  onClose: () => void;
  onPause: () => void;
  onResume: () => void;
  onRollback: () => void;
}

export function RemediationExecutionDialog({
  execution,
  open,
  onClose,
  onPause,
  onResume,
  onRollback,
}: RemediationExecutionDialogProps) {
  if (!execution) return null;

  const getStatusIcon = (status: ExecutionStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case 'rolled_back':
        return <RotateCcw className="w-4 h-4 text-warning" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: ExecutionState['status']) => {
    const config = {
      preparing: { label: 'PREPARING', class: 'bg-primary/10 text-primary border-primary' },
      running: { label: 'RUNNING', class: 'bg-success/10 text-success border-success' },
      paused: { label: 'PAUSED', class: 'bg-warning/10 text-warning border-warning' },
      completed: { label: 'COMPLETED', class: 'bg-success/10 text-success border-success' },
      failed: { label: 'FAILED', class: 'bg-destructive/10 text-destructive border-destructive' },
      rolling_back: { label: 'ROLLING BACK', class: 'bg-warning/10 text-warning border-warning' },
      rolled_back: { label: 'ROLLED BACK', class: 'bg-warning/10 text-warning border-warning' },
    }[status];

    return (
      <Badge variant="outline" className={config.class}>
        {config.label}
      </Badge>
    );
  };

  const canClose = execution.status === 'completed' || execution.status === 'failed' || execution.status === 'rolled_back';
  const showControls = execution.status === 'running' || execution.status === 'paused';
  const showRollback = execution.canRollback && (execution.status === 'failed' || execution.status === 'paused');

  return (
    <Dialog open={open} onOpenChange={canClose ? onClose : undefined}>
      <DialogContent className="max-w-3xl max-h-[85vh] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Play className="w-5 h-5 text-primary" />
            {execution.actionTitle}
            {getStatusBadge(execution.status)}
          </DialogTitle>
          <DialogDescription>
            Step {execution.currentStep} of {execution.totalSteps} • Started at {new Date(execution.startTime).toLocaleTimeString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-mono font-semibold text-foreground">{execution.progress}%</span>
            </div>
            <Progress value={execution.progress} className="h-3" />
          </div>

          {/* Execution Steps */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {execution.steps.map((step, idx) => (
                <Card
                  key={step.id}
                  className={`p-4 border transition-all ${
                    step.status === 'running'
                      ? 'bg-primary/5 border-primary shadow-sm'
                      : step.status === 'completed'
                      ? 'bg-success/5 border-success/30'
                      : step.status === 'failed'
                      ? 'bg-destructive/5 border-destructive shadow-sm'
                      : step.status === 'rolled_back'
                      ? 'bg-warning/5 border-warning/30'
                      : 'bg-control-surface border-control-border'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">{getStatusIcon(step.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">Step {idx + 1}</span>
                          <span className="text-sm font-medium text-foreground">{step.description}</span>
                        </div>
                        {step.startTime && (
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {new Date(step.startTime).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                      {step.error && (
                        <div className="mt-2 p-2 bg-destructive/10 border border-destructive rounded">
                          <p className="text-xs text-destructive font-mono">{step.error}</p>
                        </div>
                      )}
                      {step.endTime && step.startTime && step.status === 'completed' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Completed in {Math.round((new Date(step.endTime).getTime() - new Date(step.startTime).getTime()) / 1000)}s
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {/* Status Messages */}
          {execution.status === 'failed' && (
            <Card className="p-4 bg-destructive/10 border-destructive">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-destructive mb-1">Execution Failed</p>
                  <p className="text-xs text-destructive">
                    The remediation process encountered an error. You can rollback changes or close this dialog.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {execution.status === 'completed' && (
            <Card className="p-4 bg-success/10 border-success">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-success mb-1">Execution Completed Successfully</p>
                  <p className="text-xs text-success">
                    All remediation steps have been executed successfully. The issue should now be resolved.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {execution.status === 'rolled_back' && (
            <Card className="p-4 bg-warning/10 border-warning">
              <div className="flex items-start gap-3">
                <RotateCcw className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-warning mb-1">Changes Rolled Back</p>
                  <p className="text-xs text-warning">
                    All changes have been reverted to their previous state. The system is back to its original configuration.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            {showControls && (
              <>
                {execution.status === 'running' ? (
                  <Button onClick={onPause} variant="outline" size="sm">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button onClick={onResume} variant="outline" size="sm">
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                )}
              </>
            )}
            {showRollback && (
              <Button onClick={onRollback} variant="outline" size="sm" className="border-warning text-warning hover:bg-warning/10">
                <RotateCcw className="w-4 h-4 mr-2" />
                Rollback Changes
              </Button>
            )}
            {canClose && (
              <Button onClick={onClose} variant="default" size="sm" className="ml-auto">
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
