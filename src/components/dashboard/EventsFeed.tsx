import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IrisEvent } from '@/types/iris';
import { Activity, AlertTriangle, Info, RefreshCw, Target } from 'lucide-react';

interface EventsFeedProps {
  events: IrisEvent[];
}

export function EventsFeed({ events }: EventsFeedProps) {
  const getEventIcon = (type: IrisEvent['event_type']) => {
    const icons = {
      evaluation: Activity,
      retrain: RefreshCw,
      rotation: Target,
      consensus: Target,
      reflexion: Info,
    };
    return icons[type];
  };

  const getSeverityColor = (severity: IrisEvent['severity']) => {
    return {
      info: 'text-primary',
      warning: 'text-warning',
      error: 'text-destructive',
    }[severity];
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="bg-card border-border">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Recent Events</h3>
        <p className="text-sm text-muted-foreground">Live activity across all projects</p>
      </div>
      <ScrollArea className="h-[400px]">
        <div className="p-4 space-y-4">
          {events.map((event) => {
            const Icon = getEventIcon(event.event_type);
            const severityColor = getSeverityColor(event.severity);
            
            return (
              <div
                key={event.id}
                className="flex gap-3 p-3 rounded-lg bg-control-surface border border-control-border hover:border-primary/30 transition-all animate-slide-up"
              >
                <div className={`p-2 rounded-lg ${severityColor} bg-current/10`}>
                  <Icon className={`w-4 h-4 ${severityColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-foreground">{event.message}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTime(event.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-primary font-mono">{event.project}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground capitalize">{event.event_type}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}
