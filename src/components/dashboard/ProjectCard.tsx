import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Project } from '@/types/iris';
import { Activity, TrendingUp, Clock, Users } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onViewDetails: (projectId: string) => void;
}

export function ProjectCard({ project, onViewDetails }: ProjectCardProps) {
  const statusColor = {
    healthy: 'status-healthy',
    warning: 'status-warning',
    critical: 'status-critical',
  }[project.status];

  return (
    <Card className="p-6 bg-card border-border hover:border-primary/30 transition-all group animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`status-indicator ${statusColor}`} />
            <h3 className="text-lg font-semibold text-foreground">{project.name}</h3>
          </div>
          <p className="text-xs text-muted-foreground font-mono">{project.id}</p>
        </div>
        <div className="text-right">
          <div className="metric-value text-xl">{project.health_score}</div>
          <p className="text-xs text-muted-foreground">Health Score</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-mono text-foreground">{project.success_rate}%</p>
            <p className="text-xs text-muted-foreground">Success Rate</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-mono text-foreground">{project.total_runs}</p>
            <p className="text-xs text-muted-foreground">Total Runs</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-mono text-foreground">{project.active_experts}</p>
            <p className="text-xs text-muted-foreground">Active Experts</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-mono text-foreground">{project.avg_latency}ms</p>
            <p className="text-xs text-muted-foreground">Avg Latency</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">Last run: {project.last_run}</p>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onViewDetails(project.id)}
          className="text-primary hover:text-primary hover:bg-primary/10"
        >
          View Details
        </Button>
      </div>
    </Card>
  );
}
