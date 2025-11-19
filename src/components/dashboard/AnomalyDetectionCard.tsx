import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Anomaly } from '@/types/anomaly';
import { AlertTriangle, TrendingDown, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

interface AnomalyDetectionCardProps {
  anomalies: Anomaly[];
  onInvestigate: (anomaly: Anomaly) => void;
}

export function AnomalyDetectionCard({ anomalies, onInvestigate }: AnomalyDetectionCardProps) {
  const getAnomalyIcon = (type: Anomaly['type']) => {
    const icons = {
      health_drop: TrendingDown,
      latency_spike: Clock,
      success_drop: TrendingDown,
      expert_failure: AlertTriangle,
    };
    return icons[type];
  };

  const getSeverityColor = (severity: Anomaly['severity']) => {
    return {
      critical: 'bg-destructive/10 text-destructive border-destructive',
      warning: 'bg-warning/10 text-warning border-warning',
      info: 'bg-primary/10 text-primary border-primary',
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

  const activeAnomalies = anomalies.filter(a => !a.resolved);
  const resolvedAnomalies = anomalies.filter(a => a.resolved);

  return (
    <Card className="bg-card border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Anomaly Detection
            </h3>
            <p className="text-sm text-muted-foreground">AI-powered pattern detection and alerts</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">
              {activeAnomalies.filter(a => a.severity === 'critical').length} Critical
            </Badge>
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
              {activeAnomalies.filter(a => a.severity === 'warning').length} Warning
            </Badge>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="p-4 space-y-4">
          {activeAnomalies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-success mb-3" />
              <p className="text-foreground font-medium">All systems nominal</p>
              <p className="text-sm text-muted-foreground">No active anomalies detected</p>
            </div>
          ) : (
            <>
              {activeAnomalies.map((anomaly) => {
                const Icon = getAnomalyIcon(anomaly.type);
                const severityColor = getSeverityColor(anomaly.severity);
                
                return (
                  <div
                    key={anomaly.id}
                    className={`p-4 rounded-lg border animate-slide-up ${severityColor}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${severityColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground mb-1">
                            {anomaly.description}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono text-primary">{anomaly.project}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{formatTime(anomaly.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={severityColor}>
                        {anomaly.severity.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3 pl-11">
                      <div className="bg-background/50 rounded p-2">
                        <p className="text-xs text-muted-foreground">Metric</p>
                        <p className="text-sm font-medium text-foreground">{anomaly.metric}</p>
                      </div>
                      <div className="bg-background/50 rounded p-2">
                        <p className="text-xs text-muted-foreground">Current</p>
                        <p className="text-sm font-mono font-medium text-foreground">{anomaly.value}</p>
                      </div>
                      <div className="bg-background/50 rounded p-2">
                        <p className="text-xs text-muted-foreground">Expected</p>
                        <p className="text-sm font-mono font-medium text-foreground">{anomaly.expected}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-11">
                      <div className="flex-1 flex items-center gap-2">
                        {anomaly.deviation > 0 ? (
                          <TrendingUp className="w-3 h-3 text-destructive" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-destructive" />
                        )}
                        <span className="text-xs font-mono text-destructive font-semibold">
                          {Math.abs(anomaly.deviation).toFixed(1)}% deviation
                        </span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={() => onInvestigate(anomaly)}
                      >
                        Investigate
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        Dismiss
                      </Button>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {resolvedAnomalies.length > 0 && (
            <>
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground mb-3">Recently Resolved</p>
              </div>
              {resolvedAnomalies.map((anomaly) => {
                const Icon = getAnomalyIcon(anomaly.type);
                
                return (
                  <div
                    key={anomaly.id}
                    className="p-3 rounded-lg bg-control-surface border border-control-border opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{anomaly.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-mono text-primary">{anomaly.project}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{formatTime(anomaly.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
