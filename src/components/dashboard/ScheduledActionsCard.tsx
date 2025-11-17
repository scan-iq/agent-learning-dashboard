import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { ScheduledAction } from '@/types/scheduling';
import {
  Clock,
  Repeat,
  Play,
  Pause,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';

interface ScheduledActionsCardProps {
  scheduledActions: ScheduledAction[];
  onToggle: (id: string, enabled: boolean) => void;
  onExecuteNow: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ScheduledActionsCard({
  scheduledActions,
  onToggle,
  onExecuteNow,
  onDelete,
}: ScheduledActionsCardProps) {
  const getStatusBadge = (status: ScheduledAction['status']) => {
    const config = {
      pending: { label: 'PENDING', class: 'bg-muted text-muted-foreground border-muted-foreground' },
      active: { label: 'ACTIVE', class: 'bg-success/10 text-success border-success' },
      paused: { label: 'PAUSED', class: 'bg-warning/10 text-warning border-warning' },
      completed: { label: 'COMPLETED', class: 'bg-primary/10 text-primary border-primary' },
      failed: { label: 'FAILED', class: 'bg-destructive/10 text-destructive border-destructive' },
    }[status];

    return (
      <Badge variant="outline" className={config.class}>
        {config.label}
      </Badge>
    );
  };

  const formatNextExecution = (nextExecution?: string) => {
    if (!nextExecution) return 'Not scheduled';
    const date = new Date(nextExecution);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`;
    return 'soon';
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Scheduled Actions</h3>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
            {scheduledActions.length}
          </Badge>
        </div>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        {scheduledActions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Clock className="w-12 h-12 text-muted-foreground mb-3 opacity-50" />
            <p className="text-foreground font-medium mb-1">No Scheduled Actions</p>
            <p className="text-sm text-muted-foreground">
              Schedule remediation actions to run automatically
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {scheduledActions.map((scheduledAction) => (
              <Card key={scheduledAction.id} className="p-4 bg-control-surface border-control-border">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-foreground truncate">
                          {scheduledAction.actionTitle}
                        </h4>
                        {getStatusBadge(scheduledAction.status)}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {scheduledAction.projectName}
                      </p>
                    </div>
                    <Switch
                      checked={scheduledAction.enabled}
                      onCheckedChange={(checked) => onToggle(scheduledAction.id, checked)}
                      disabled={scheduledAction.status === 'completed'}
                    />
                  </div>

                  {/* Schedule Info */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      {scheduledAction.schedule.type === 'recurring' ? (
                        <Repeat className="w-3 h-3" />
                      ) : (
                        <Calendar className="w-3 h-3" />
                      )}
                      <span>
                        {scheduledAction.schedule.type === 'recurring'
                          ? `Every ${scheduledAction.schedule.recurrence?.interval} ${scheduledAction.schedule.recurrence?.pattern}`
                          : 'One-time'}
                      </span>
                    </div>
                    {scheduledAction.nextExecution && scheduledAction.enabled && (
                      <div className="flex items-center gap-1 text-primary font-medium">
                        <Clock className="w-3 h-3" />
                        <span>Next: {formatNextExecution(scheduledAction.nextExecution)}</span>
                      </div>
                    )}
                  </div>

                  {/* Conditions */}
                  {scheduledAction.schedule.conditions && scheduledAction.schedule.conditions.length > 0 && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3 h-3 text-warning" />
                      <span className="text-xs text-warning">
                        {scheduledAction.schedule.conditions.length} condition
                        {scheduledAction.schedule.conditions.length > 1 ? 's' : ''} configured
                      </span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Executed {scheduledAction.executionCount}x</span>
                    </div>
                    {scheduledAction.lastExecuted && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Last: {format(new Date(scheduledAction.lastExecuted), 'MMM d, HH:mm')}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-control-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onExecuteNow(scheduledAction.id)}
                      disabled={!scheduledAction.enabled || scheduledAction.status === 'completed'}
                      className="flex-1"
                    >
                      <Play className="w-3 h-3 mr-2" />
                      Execute Now
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(scheduledAction.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
