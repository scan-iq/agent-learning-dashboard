import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SystemMetricSnapshot, DetectedAnomaly, HealthStatus } from '@/types/monitoring';
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Cpu,
  HardDrive,
  Network,
  Database,
  Clock,
  Zap,
  AlertCircle,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface LiveMonitoringDialogProps {
  open: boolean;
  onClose: () => void;
  actionTitle: string;
  isExecuting: boolean;
}

export function LiveMonitoringDialog({
  open,
  onClose,
  actionTitle,
  isExecuting,
}: LiveMonitoringDialogProps) {
  const [metrics, setMetrics] = useState<SystemMetricSnapshot[]>([]);
  const [detectedAnomalies, setDetectedAnomalies] = useState<DetectedAnomaly[]>([]);
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    overall: 'healthy',
    metrics: {},
  });

  // Metric thresholds for anomaly detection
  const thresholds = {
    cpu_usage: { warning: 70, critical: 85 },
    memory_usage: { warning: 75, critical: 90 },
    active_connections: { warning: 80, critical: 95 },
    queue_depth: { warning: 50, critical: 75 },
    response_time: { warning: 200, critical: 500 },
    error_rate: { warning: 2, critical: 5 },
  };

  // Simulate real-time metrics
  useEffect(() => {
    if (!isExecuting) return;

    const interval = setInterval(() => {
      const timestamp = new Date().toISOString();
      const newMetric: SystemMetricSnapshot = {
        timestamp,
        cpu_usage: Math.random() * 100,
        memory_usage: Math.random() * 100,
        active_connections: Math.floor(Math.random() * 100),
        queue_depth: Math.floor(Math.random() * 100),
        response_time: Math.random() * 600,
        error_rate: Math.random() * 8,
      };

      setMetrics((prev) => {
        const updated = [...prev, newMetric];
        // Keep only last 30 data points
        return updated.slice(-30);
      });

      // Detect anomalies
      detectAnomalies(newMetric);
      updateHealthStatus(newMetric);
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [isExecuting]);

  const detectAnomalies = (metric: SystemMetricSnapshot) => {
    const newAnomalies: DetectedAnomaly[] = [];

    Object.entries(thresholds).forEach(([key, threshold]) => {
      const value = metric[key as keyof Omit<SystemMetricSnapshot, 'timestamp'>];
      
      if (value >= threshold.critical) {
        newAnomalies.push({
          id: `${key}-${Date.now()}`,
          timestamp: metric.timestamp,
          metric: key,
          value,
          threshold: threshold.critical,
          severity: 'critical',
          message: `${formatMetricName(key)} reached critical level: ${formatMetricValue(key, value)}`,
        });
      } else if (value >= threshold.warning) {
        newAnomalies.push({
          id: `${key}-${Date.now()}`,
          timestamp: metric.timestamp,
          metric: key,
          value,
          threshold: threshold.warning,
          severity: 'warning',
          message: `${formatMetricName(key)} exceeds warning threshold: ${formatMetricValue(key, value)}`,
        });
      }
    });

    if (newAnomalies.length > 0) {
      setDetectedAnomalies((prev) => [...newAnomalies, ...prev].slice(0, 10));
    }
  };

  const updateHealthStatus = (metric: SystemMetricSnapshot) => {
    const metricStatuses: { [key: string]: 'healthy' | 'warning' | 'critical' } = {};
    
    Object.entries(thresholds).forEach(([key, threshold]) => {
      const value = metric[key as keyof Omit<SystemMetricSnapshot, 'timestamp'>];
      
      if (value >= threshold.critical) {
        metricStatuses[key] = 'critical';
      } else if (value >= threshold.warning) {
        metricStatuses[key] = 'warning';
      } else {
        metricStatuses[key] = 'healthy';
      }
    });

    const criticalCount = Object.values(metricStatuses).filter(s => s === 'critical').length;
    const warningCount = Object.values(metricStatuses).filter(s => s === 'warning').length;

    setHealthStatus({
      overall: criticalCount > 0 ? 'critical' : warningCount > 0 ? 'degraded' : 'healthy',
      metrics: metricStatuses,
    });
  };

  const formatMetricName = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatMetricValue = (key: string, value: number) => {
    if (key.includes('usage') || key === 'error_rate') {
      return `${value.toFixed(1)}%`;
    }
    if (key === 'response_time') {
      return `${value.toFixed(0)}ms`;
    }
    return value.toFixed(0);
  };

  const getMetricIcon = (key: string) => {
    const icons: { [key: string]: any } = {
      cpu_usage: Cpu,
      memory_usage: HardDrive,
      active_connections: Network,
      queue_depth: Database,
      response_time: Clock,
      error_rate: AlertTriangle,
    };
    return icons[key] || Activity;
  };

  const getHealthBadge = (status: 'healthy' | 'degraded' | 'critical') => {
    const config = {
      healthy: { label: 'HEALTHY', class: 'bg-success/10 text-success border-success' },
      degraded: { label: 'DEGRADED', class: 'bg-warning/10 text-warning border-warning' },
      critical: { label: 'CRITICAL', class: 'bg-destructive/10 text-destructive border-destructive' },
    }[status];

    return (
      <Badge variant="outline" className={config.class}>
        {config.label}
      </Badge>
    );
  };

  const getMetricStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
    return {
      healthy: 'text-success',
      warning: 'text-warning',
      critical: 'text-destructive',
    }[status];
  };

  const latestMetric = metrics[metrics.length - 1];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-primary animate-pulse" />
            Live System Monitoring
            {getHealthBadge(healthStatus.overall)}
          </DialogTitle>
          <DialogDescription>
            Real-time metrics during execution: {actionTitle}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
          <div className="space-y-4">
            {/* Current Metrics Grid */}
            {latestMetric && (
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(thresholds).map(([key, threshold]) => {
                  const MetricIcon = getMetricIcon(key);
                  const value = latestMetric[key as keyof Omit<SystemMetricSnapshot, 'timestamp'>];
                  const status = healthStatus.metrics[key];
                  const statusColor = getMetricStatusColor(status);

                  return (
                    <Card key={key} className={`p-4 border transition-all ${
                      status === 'critical' ? 'bg-destructive/5 border-destructive shadow-sm' :
                      status === 'warning' ? 'bg-warning/5 border-warning/30' :
                      'bg-control-surface border-control-border'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MetricIcon className={`w-4 h-4 ${statusColor}`} />
                          <span className="text-xs text-muted-foreground">
                            {formatMetricName(key)}
                          </span>
                        </div>
                        {status === 'critical' && <AlertCircle className="w-4 h-4 text-destructive" />}
                        {status === 'warning' && <AlertTriangle className="w-4 h-4 text-warning" />}
                      </div>
                      <div className="flex items-end justify-between">
                        <span className={`text-2xl font-mono font-bold ${statusColor}`}>
                          {formatMetricValue(key, value)}
                        </span>
                        <div className="text-xs text-muted-foreground">
                          <div>Warn: {formatMetricValue(key, threshold.warning)}</div>
                          <div>Crit: {formatMetricValue(key, threshold.critical)}</div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Anomaly Alerts */}
            {detectedAnomalies.length > 0 && (
              <Card className="p-4 bg-card border-border">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  Detected Anomalies
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
                    {detectedAnomalies.length}
                  </Badge>
                </h3>
                <div className="space-y-2">
                  {detectedAnomalies.slice(0, 5).map((anomaly) => (
                    <div
                      key={anomaly.id}
                      className={`p-3 rounded border ${
                        anomaly.severity === 'critical'
                          ? 'bg-destructive/5 border-destructive'
                          : 'bg-warning/5 border-warning'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            anomaly.severity === 'critical' ? 'text-destructive' : 'text-warning'
                          }`}>
                            {anomaly.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(anomaly.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            anomaly.severity === 'critical'
                              ? 'bg-destructive/10 text-destructive border-destructive'
                              : 'bg-warning/10 text-warning border-warning'
                          }
                        >
                          {anomaly.severity.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Real-time Charts */}
            <div className="grid grid-cols-2 gap-4">
              {/* CPU & Memory Chart */}
              <Card className="p-4 bg-control-surface border-control-border">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-primary" />
                  CPU & Memory Usage
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(value) => new Date(value).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      fontSize={10}
                    />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="cpu_usage"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary) / 0.2)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="memory_usage"
                      stroke="hsl(var(--chart-2))"
                      fill="hsl(var(--chart-2) / 0.2)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Response Time Chart */}
              <Card className="p-4 bg-control-surface border-control-border">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Response Time
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(value) => new Date(value).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      fontSize={10}
                    />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="response_time"
                      stroke="hsl(var(--chart-3))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Connections & Queue Chart */}
              <Card className="p-4 bg-control-surface border-control-border">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Network className="w-4 h-4 text-primary" />
                  Connections & Queue
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(value) => new Date(value).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      fontSize={10}
                    />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="active_connections"
                      stroke="hsl(var(--chart-4))"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="queue_depth"
                      stroke="hsl(var(--chart-5))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Error Rate Chart */}
              <Card className="p-4 bg-control-surface border-control-border">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-primary" />
                  Error Rate
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(value) => new Date(value).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      fontSize={10}
                    />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="error_rate"
                      stroke="hsl(var(--destructive))"
                      fill="hsl(var(--destructive) / 0.2)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
