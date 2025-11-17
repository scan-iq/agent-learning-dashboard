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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Anomaly } from '@/lib/mock-data';
import { DiagnosticData } from '@/types/diagnostics';
import {
  AlertTriangle,
  FileText,
  Activity,
  Wrench,
  Play,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Cpu,
  HardDrive,
  Network,
  Database,
} from 'lucide-react';

interface AnomalyInvestigationDialogProps {
  anomaly: Anomaly | null;
  diagnosticData: DiagnosticData | null;
  open: boolean;
  onClose: () => void;
  onExecuteAction: (actionId: string) => void;
}

export function AnomalyInvestigationDialog({
  anomaly,
  diagnosticData,
  open,
  onClose,
  onExecuteAction,
}: AnomalyInvestigationDialogProps) {
  if (!anomaly || !diagnosticData) return null;

  const getSeverityColor = (severity: Anomaly['severity']) => {
    return {
      critical: 'text-destructive',
      warning: 'text-warning',
      info: 'text-primary',
    }[severity];
  };

  const getLogLevelColor = (level: string) => {
    return {
      error: 'text-destructive',
      warning: 'text-warning',
      info: 'text-primary',
      debug: 'text-muted-foreground',
    }[level] || 'text-foreground';
  };

  const getPriorityColor = (priority: string) => {
    return {
      high: 'bg-destructive/10 text-destructive border-destructive',
      medium: 'bg-warning/10 text-warning border-warning',
      low: 'bg-primary/10 text-primary border-primary',
    }[priority];
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[85vh] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <AlertTriangle className={`w-6 h-6 ${getSeverityColor(anomaly.severity)}`} />
            Anomaly Investigation: {anomaly.project}
            <Badge variant="outline" className={`${getSeverityColor(anomaly.severity)} border-current`}>
              {anomaly.severity.toUpperCase()}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {anomaly.description} • Detected at {formatTimestamp(anomaly.timestamp)}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(85vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Summary Section */}
            <Card className="p-4 bg-control-surface border-control-border">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Root Cause Analysis
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Root Cause</p>
                  <p className="text-sm text-foreground">{diagnosticData.summary.root_cause}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Impact</p>
                  <p className="text-sm text-foreground">{diagnosticData.summary.impact}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Affected Components</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {diagnosticData.summary.affected_components.map((comp, idx) => (
                      <Badge key={idx} variant="outline" className="bg-warning/10 text-warning border-warning">
                        {comp}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* System Metrics */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4 bg-control-surface border-control-border">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground">CPU Usage</p>
                </div>
                <p className="text-2xl font-mono font-bold text-foreground">
                  {diagnosticData.system_metrics.cpu_usage}%
                </p>
              </Card>
              <Card className="p-4 bg-control-surface border-control-border">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Memory</p>
                </div>
                <p className="text-2xl font-mono font-bold text-foreground">
                  {diagnosticData.system_metrics.memory_usage}%
                </p>
              </Card>
              <Card className="p-4 bg-control-surface border-control-border">
                <div className="flex items-center gap-2 mb-2">
                  <Network className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Connections</p>
                </div>
                <p className="text-2xl font-mono font-bold text-foreground">
                  {diagnosticData.system_metrics.active_connections}
                </p>
              </Card>
              <Card className="p-4 bg-control-surface border-control-border">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Queue Depth</p>
                </div>
                <p className="text-2xl font-mono font-bold text-foreground">
                  {diagnosticData.system_metrics.queue_depth}
                </p>
              </Card>
            </div>

            {/* Detailed Diagnostics Tabs */}
            <Tabs defaultValue="logs" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-control-surface border border-control-border">
                <TabsTrigger value="logs">
                  <FileText className="w-4 h-4 mr-2" />
                  Logs ({diagnosticData.logs.length})
                </TabsTrigger>
                <TabsTrigger value="traces">
                  <Activity className="w-4 h-4 mr-2" />
                  Expert Traces ({diagnosticData.expert_traces.length})
                </TabsTrigger>
                <TabsTrigger value="actions">
                  <Wrench className="w-4 h-4 mr-2" />
                  Actions ({diagnosticData.remediation_actions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="logs" className="mt-4 space-y-3">
                {diagnosticData.logs.map((log) => (
                  <Card key={log.id} className="p-4 bg-control-surface border-control-border">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`${getLogLevelColor(log.level)} border-current uppercase text-xs`}
                        >
                          {log.level}
                        </Badge>
                        <span className="text-xs font-mono text-primary">{log.source}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatTimestamp(log.timestamp)}</span>
                    </div>
                    <p className="text-sm text-foreground mb-2 font-mono">{log.message}</p>
                    {log.context && (
                      <div className="bg-background rounded p-2 mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Context:</p>
                        <pre className="text-xs text-foreground font-mono overflow-x-auto">
                          {JSON.stringify(log.context, null, 2)}
                        </pre>
                      </div>
                    )}
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="traces" className="mt-4 space-y-3">
                {diagnosticData.expert_traces.length === 0 ? (
                  <Card className="p-8 bg-control-surface border-control-border text-center">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-foreground">No expert traces available for this anomaly</p>
                    <p className="text-sm text-muted-foreground">This anomaly may be infrastructure-related</p>
                  </Card>
                ) : (
                  diagnosticData.expert_traces.map((trace) => (
                    <Card key={trace.id} className="p-4 bg-control-surface border-control-border">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-foreground">{trace.expert_name}</h4>
                            {trace.success ? (
                              <CheckCircle2 className="w-4 h-4 text-success" />
                            ) : (
                              <XCircle className="w-4 h-4 text-destructive" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{formatTimestamp(trace.timestamp)}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs font-mono text-foreground">{trace.latency}ms</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs font-mono text-foreground">
                              {(trace.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="bg-background rounded p-2">
                          <p className="text-xs text-muted-foreground mb-1">Input:</p>
                          <p className="text-xs text-foreground font-mono">{trace.input}</p>
                        </div>
                        <div className="bg-background rounded p-2">
                          <p className="text-xs text-muted-foreground mb-1">Output:</p>
                          <p className="text-xs text-foreground font-mono">{trace.output}</p>
                        </div>
                        {trace.error_message && (
                          <div className="bg-destructive/10 rounded p-2 border border-destructive">
                            <p className="text-xs text-destructive font-semibold mb-1">Error:</p>
                            <p className="text-xs text-destructive font-mono">{trace.error_message}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="actions" className="mt-4 space-y-3">
                {diagnosticData.remediation_actions.map((action) => (
                  <Card key={action.id} className="p-4 bg-control-surface border-control-border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-base font-semibold text-foreground">{action.title}</h4>
                          <Badge variant="outline" className={getPriorityColor(action.priority)}>
                            {action.priority.toUpperCase()}
                          </Badge>
                          {action.automated && (
                            <Badge variant="outline" className="bg-success/10 text-success border-success">
                              AUTO
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Est. {action.estimated_time}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-background rounded p-3 mb-3">
                      <p className="text-xs text-muted-foreground mb-2 font-semibold">Steps:</p>
                      <ol className="space-y-1 list-decimal list-inside">
                        {action.steps.map((step, idx) => (
                          <li key={idx} className="text-xs text-foreground">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    <Button
                      onClick={() => onExecuteAction(action.id)}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {action.automated ? 'Execute Automatically' : 'Start Manual Process'}
                    </Button>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
