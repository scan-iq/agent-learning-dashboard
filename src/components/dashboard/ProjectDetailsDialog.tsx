import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProjectDetails } from '@/types/iris';
import { TrendingUp, AlertCircle, Brain, Activity } from 'lucide-react';

interface ProjectDetailsDialogProps {
  project: ProjectDetails | null;
  open: boolean;
  onClose: () => void;
}

export function ProjectDetailsDialog({ project, open, onClose }: ProjectDetailsDialogProps) {
  if (!project) return null;

  const statusColor = {
    healthy: 'text-success',
    warning: 'text-warning',
    critical: 'text-destructive',
  }[project.status];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className={statusColor}>●</span>
            {project.name}
            <span className="text-sm font-mono text-muted-foreground">({project.id})</span>
          </DialogTitle>
          <DialogDescription>
            Detailed performance metrics and expert analysis
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Health Overview */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4 bg-control-surface border-control-border">
                <p className="text-xs text-muted-foreground mb-1">Health Score</p>
                <p className="metric-value text-xl">{project.health_score}</p>
              </Card>
              <Card className="p-4 bg-control-surface border-control-border">
                <p className="text-xs text-muted-foreground mb-1">Success Rate</p>
                <p className="metric-value text-xl">{project.success_rate}%</p>
              </Card>
              <Card className="p-4 bg-control-surface border-control-border">
                <p className="text-xs text-muted-foreground mb-1">Active Experts</p>
                <p className="metric-value text-xl">{project.active_experts}</p>
              </Card>
              <Card className="p-4 bg-control-surface border-control-border">
                <p className="text-xs text-muted-foreground mb-1">Avg Latency</p>
                <p className="metric-value text-xl">{project.avg_latency}ms</p>
              </Card>
            </div>

            {/* Recent Errors */}
            {project.recent_errors.length > 0 && (
              <Card className="p-4 bg-control-surface border-control-border">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-warning" />
                  <h4 className="font-semibold text-foreground">Recent Issues</h4>
                </div>
                <div className="space-y-2">
                  {project.recent_errors.map((error, idx) => (
                    <div key={idx} className="text-sm text-muted-foreground p-2 bg-warning/10 rounded border-l-2 border-warning">
                      {error}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Expert Performance */}
            <Card className="p-4 bg-control-surface border-control-border">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-foreground">Expert Performance</h4>
              </div>
              <div className="space-y-3">
                {project.expert_performance.map((expert) => (
                  <div key={expert.expert_id} className="flex items-center justify-between p-3 bg-background rounded border border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">{expert.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{expert.expert_id}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-mono text-foreground">{expert.accuracy}%</p>
                        <p className="text-xs text-muted-foreground">Accuracy</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono text-foreground">{expert.calls}</p>
                        <p className="text-xs text-muted-foreground">Calls</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Reflexions */}
            <Card className="p-4 bg-control-surface border-control-border">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-foreground">Recent Reflexions</h4>
              </div>
              <div className="space-y-2">
                {project.recent_reflexions.map((reflexion) => (
                  <div key={reflexion.id} className="p-3 bg-background rounded border border-border">
                    <p className="text-sm font-medium text-foreground mb-1">{reflexion.pattern}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(reflexion.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-xs font-mono text-primary">
                        Impact: {(reflexion.impact * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                Evaluate Project
              </Button>
              <Button variant="outline" className="flex-1">
                Retrain Experts
              </Button>
              <Button variant="outline" className="flex-1">
                Generate Report
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
