/**
 * Real-Time Telemetry Component
 * Displays live metrics and activity feed using midstreamer
 */

import { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMidstreamerWithFallback } from '@/hooks/useMidstreamer';
import { useToast } from '@/hooks/use-toast';
import { IrisEvent, OverviewMetrics } from '@/types/iris';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Info,
  RefreshCw,
  Target,
  Wifi,
  WifiOff,
  TrendingUp,
  TrendingDown,
  Radio,
  Loader2,
} from 'lucide-react';

interface RealTimeTelemetryData {
  metrics: OverviewMetrics;
  recentEvents: IrisEvent[];
  timestamp: string;
}

interface RealTimeTelemetryProps {
  /** WebSocket/SSE endpoint for real-time updates */
  endpoint?: string;
  /** Fallback polling interval in ms (default: 30000) */
  fallbackInterval?: number;
  /** Enable optimistic UI updates */
  enableOptimistic?: boolean;
  /** Show connection status indicator */
  showConnectionStatus?: boolean;
}

export function RealTimeTelemetry({
  endpoint = '/api/stream/telemetry',
  fallbackInterval = 30000,
  enableOptimistic = true,
  showConnectionStatus = true,
}: RealTimeTelemetryProps) {
  const { toast } = useToast();
  const [previousMetrics, setPreviousMetrics] = useState<OverviewMetrics | null>(null);
  const [activityFeed, setActivityFeed] = useState<IrisEvent[]>([]);

  // Fallback function for polling when WebSocket/SSE fails
  const fallbackFetch = async (): Promise<RealTimeTelemetryData> => {
    const response = await fetch('/api/overview');
    if (!response.ok) throw new Error('Failed to fetch telemetry data');
    const data = await response.json();
    return {
      metrics: data.metrics,
      recentEvents: data.events || [],
      timestamp: new Date().toISOString(),
    };
  };

  // Use midstreamer with automatic fallback to polling
  const {
    data,
    isConnected,
    isConnecting,
    error,
    reconnectAttempt,
    usingFallback,
    reset,
  } = useMidstreamerWithFallback<RealTimeTelemetryData>(
    endpoint,
    fallbackFetch,
    fallbackInterval,
    {
      reconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
    }
  );

  // Show toast notifications for connection events
  useEffect(() => {
    if (isConnected && reconnectAttempt === 0) {
      toast({
        title: 'Real-time updates active',
        description: 'Connected to live telemetry stream',
        variant: 'default',
      });
    }
  }, [isConnected, reconnectAttempt, toast]);

  useEffect(() => {
    if (usingFallback) {
      toast({
        title: 'Offline mode',
        description: 'Using polling fallback for updates',
        variant: 'default',
      });
    }
  }, [usingFallback, toast]);

  useEffect(() => {
    if (error && !isConnecting) {
      toast({
        title: 'Connection error',
        description: error.message || 'Failed to connect to real-time stream',
        variant: 'destructive',
      });
    }
  }, [error, isConnecting, toast]);

  // Update activity feed when new events arrive
  useEffect(() => {
    if (data?.recentEvents) {
      setActivityFeed((prev) => {
        const newEvents = data.recentEvents.filter(
          (event) => !prev.some((e) => e.id === event.id)
        );
        return [...newEvents, ...prev].slice(0, 50); // Keep last 50 events
      });
    }
  }, [data?.recentEvents]);

  // Track previous metrics for trend calculation
  useEffect(() => {
    if (data?.metrics && enableOptimistic) {
      setPreviousMetrics(data.metrics);
    }
  }, [data?.metrics, enableOptimistic]);

  // Calculate metric trends
  const metricTrends = useMemo(() => {
    if (!data?.metrics || !previousMetrics) return null;

    return {
      totalRuns: data.metrics.total_runs_today - previousMetrics.total_runs_today,
      successRate: data.metrics.avg_success_rate - previousMetrics.avg_success_rate,
      activeExperts: data.metrics.active_experts - previousMetrics.active_experts,
    };
  }, [data?.metrics, previousMetrics]);

  // Connection status component
  const ConnectionStatus = () => {
    if (!showConnectionStatus) return null;

    const statusConfig = {
      connected: {
        icon: Wifi,
        label: 'Live',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
      },
      connecting: {
        icon: Loader2,
        label: `Connecting${reconnectAttempt > 0 ? ` (${reconnectAttempt})` : ''}`,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
      },
      offline: {
        icon: WifiOff,
        label: usingFallback ? 'Polling' : 'Offline',
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
      },
      error: {
        icon: AlertTriangle,
        label: 'Error',
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
      },
    };

    const status = isConnected
      ? 'connected'
      : isConnecting
      ? 'connecting'
      : error
      ? 'error'
      : 'offline';

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor}`}>
          <Icon
            className={`w-4 h-4 ${config.color} ${isConnecting ? 'animate-spin' : ''}`}
          />
          <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
        </div>
        {!isConnected && !isConnecting && (
          <Button
            size="sm"
            variant="outline"
            onClick={reset}
            className="h-7 text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    );
  };

  // Metric card component
  const MetricDisplay = ({
    label,
    value,
    trend,
    icon: Icon,
  }: {
    label: string;
    value: number;
    trend?: number;
    icon: any;
  }) => {
    const hasTrend = trend !== undefined && trend !== 0;
    const isPositive = trend && trend > 0;

    return (
      <div className="flex items-start justify-between p-4 rounded-lg bg-control-surface border border-control-border">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {hasTrend && (
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
              <span className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '+' : ''}
                {trend}
              </span>
            </div>
          )}
        </div>
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    );
  };

  // Event icon helper
  const getEventIcon = (type: IrisEvent['event_type']) => {
    const icons = {
      evaluation: Activity,
      retrain: RefreshCw,
      rotation: Target,
      consensus: Target,
      reflexion: Info,
    };
    return icons[type] || Activity;
  };

  // Event severity color helper
  const getSeverityColor = (severity: IrisEvent['severity']) => {
    return {
      info: 'text-blue-500',
      warning: 'text-yellow-500',
      error: 'text-red-500',
    }[severity];
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 10) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header with connection status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Radio className="w-6 h-6 text-primary" />
            Real-Time Telemetry
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Live metrics and activity across all projects
          </p>
        </div>
        <ConnectionStatus />
      </div>

      {/* Real-time metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricDisplay
          label="Active Runs"
          value={data?.metrics.total_runs_today || 0}
          trend={metricTrends?.totalRuns}
          icon={Activity}
        />
        <MetricDisplay
          label="Success Rate"
          value={Math.round((data?.metrics.avg_success_rate || 0) * 100)}
          trend={metricTrends?.successRate ? Math.round(metricTrends.successRate * 100) : undefined}
          icon={CheckCircle2}
        />
        <MetricDisplay
          label="Active Experts"
          value={data?.metrics.active_experts || 0}
          trend={metricTrends?.activeExperts}
          icon={Target}
        />
        <MetricDisplay
          label="Total Projects"
          value={data?.metrics.total_projects || 0}
          icon={Activity}
        />
      </div>

      {/* Live activity feed */}
      <Card className="bg-card border-border">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Live Activity Feed
          </h3>
          <p className="text-sm text-muted-foreground">
            Real-time events as they happen
            {data?.timestamp && (
              <span className="ml-2 text-xs">
                • Last update: {formatTime(data.timestamp)}
              </span>
            )}
          </p>
        </div>
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-3">
            {activityFeed.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {isConnecting ? 'Connecting to live feed...' : 'No recent activity'}
                </p>
              </div>
            ) : (
              activityFeed.map((event, index) => {
                const Icon = getEventIcon(event.event_type);
                const severityColor = getSeverityColor(event.severity);

                return (
                  <div
                    key={event.id}
                    className={`flex gap-3 p-3 rounded-lg bg-control-surface border border-control-border hover:border-primary/30 transition-all ${
                      index === 0 ? 'animate-slide-up ring-2 ring-primary/20' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${severityColor} bg-current/10 h-fit`}>
                      <Icon className={`w-4 h-4 ${severityColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground">
                          {event.message}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTime(event.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-mono">
                          {event.project}
                        </Badge>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {event.event_type}
                        </span>
                        {index === 0 && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <Badge variant="default" className="text-xs">
                              New
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Debug info (only in development) */}
      {import.meta.env.DEV && (
        <Card className="p-4 bg-muted/30 border-muted">
          <p className="text-xs font-mono text-muted-foreground">
            Mode: {usingFallback ? 'Polling Fallback' : isConnected ? 'WebSocket/SSE' : 'Disconnected'} |
            Reconnect attempts: {reconnectAttempt} |
            Events: {activityFeed.length}
          </p>
        </Card>
      )}
    </div>
  );
}
