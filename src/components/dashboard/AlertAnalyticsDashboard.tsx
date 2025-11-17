import { useMemo } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertAnalytics } from '@/types/alert-analytics';
import { AlertNotification } from '@/types/alerts';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Bell,
  Mail,
  MessageSquare,
  Webhook,
  Activity,
} from 'lucide-react';
import { format } from 'date-fns';

interface AlertAnalyticsDashboardProps {
  analytics: AlertAnalytics;
  notifications: AlertNotification[];
  open: boolean;
  onClose: () => void;
}

export function AlertAnalyticsDashboard({
  analytics,
  notifications,
  open,
  onClose,
}: AlertAnalyticsDashboardProps) {
  const severityColors = {
    info: 'hsl(var(--primary))',
    warning: 'hsl(var(--chart-3))',
    critical: 'hsl(var(--destructive))',
  };

  const channelIcons = {
    in_app: Bell,
    email: Mail,
    slack: MessageSquare,
    webhook: Webhook,
  };

  const timeSeriesData = useMemo(() => {
    const grouped = analytics.alertsOverTime.reduce((acc, alert) => {
      const date = format(new Date(alert.timestamp), 'MMM dd HH:mm');
      if (!acc[date]) {
        acc[date] = { date, info: 0, warning: 0, critical: 0 };
      }
      acc[date][alert.severity]++;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  }, [analytics.alertsOverTime]);

  const severityDistribution = useMemo(() => {
    return analytics.alertsBySeverity.map(item => ({
      name: item.severity.toUpperCase(),
      value: item.count,
      color: severityColors[item.severity],
    }));
  }, [analytics.alertsBySeverity]);

  const channelPerformanceData = useMemo(() => {
    return analytics.channelPerformance.map(channel => ({
      name: channel.channel.replace('_', ' ').toUpperCase(),
      success: ((channel.successful / channel.totalSent) * 100).toFixed(1),
      avgDelivery: channel.avgDeliveryTime,
    }));
  }, [analytics.channelPerformance]);

  const topRulesByAlert = useMemo(() => {
    return analytics.alertsByRule
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [analytics.alertsByRule]);

  const resolutionTimeData = useMemo(() => {
    return analytics.resolutionTimes
      .slice(0, 8)
      .map(item => ({
        rule: item.ruleName.length > 20 ? item.ruleName.substring(0, 20) + '...' : item.ruleName,
        avg: item.avgResolutionTime,
        min: item.minTime,
        max: item.maxTime,
      }));
  }, [analytics.resolutionTimes]);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes.toFixed(0)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins.toFixed(0)}m`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-primary" />
            Alert Analytics Dashboard
          </DialogTitle>
          <DialogDescription>
            Comprehensive insights into alert performance, resolution times, and channel effectiveness
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-control-surface">
            <TabsTrigger value="overview">
              <Activity className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="performance">
              <TrendingUp className="w-4 h-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="channels">
              <Bell className="w-4 h-4 mr-2" />
              Channels
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(90vh-200px)] pr-4 mt-4">
            <TabsContent value="overview" className="mt-0 space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-5 gap-4">
                <Card className="p-4 bg-control-surface border-control-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Total Alerts</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{analytics.totalAlerts}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.activeAlerts} active
                  </p>
                </Card>

                <Card className="p-4 bg-control-surface border-control-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">MTTR</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{formatTime(analytics.mttr)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mean time to resolve
                  </p>
                </Card>

                <Card className="p-4 bg-control-surface border-control-border">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-xs text-muted-foreground">Acknowledged</span>
                  </div>
                  <p className="text-2xl font-bold text-success">{analytics.acknowledgedAlerts}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((analytics.acknowledgedAlerts / analytics.totalAlerts) * 100).toFixed(1)}% rate
                  </p>
                </Card>

                <Card className="p-4 bg-destructive/5 border-destructive/30">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-destructive" />
                    <span className="text-xs text-muted-foreground">False Positives</span>
                  </div>
                  <p className="text-2xl font-bold text-destructive">
                    {analytics.falsePositiveRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((analytics.falsePositiveRate / 100) * analytics.totalAlerts)} alerts
                  </p>
                </Card>

                <Card className="p-4 bg-control-surface border-control-border">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    <span className="text-xs text-muted-foreground">Dismissed</span>
                  </div>
                  <p className="text-2xl font-bold text-warning">{analytics.dismissedAlerts}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((analytics.dismissedAlerts / analytics.totalAlerts) * 100).toFixed(1)}% rate
                  </p>
                </Card>
              </div>

              {/* Alerts Over Time */}
              <Card className="p-6 bg-control-surface border-control-border">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Alerts Over Time
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="critical"
                      stroke={severityColors.critical}
                      strokeWidth={2}
                      name="Critical"
                    />
                    <Line
                      type="monotone"
                      dataKey="warning"
                      stroke={severityColors.warning}
                      strokeWidth={2}
                      name="Warning"
                    />
                    <Line
                      type="monotone"
                      dataKey="info"
                      stroke={severityColors.info}
                      strokeWidth={2}
                      name="Info"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                {/* Severity Distribution */}
                <Card className="p-6 bg-control-surface border-control-border">
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Alert Distribution by Severity
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={severityDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {severityDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                {/* Top Rules */}
                <Card className="p-6 bg-control-surface border-control-border">
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Top Alert Rules
                  </h3>
                  <ScrollArea className="h-[250px]">
                    <div className="space-y-2 pr-2">
                      {topRulesByAlert.map((rule, index) => (
                        <div
                          key={rule.ruleId}
                          className="flex items-center justify-between p-2 bg-background rounded"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-xs font-mono text-muted-foreground w-6">
                              #{index + 1}
                            </span>
                            <span className="text-sm text-foreground truncate">
                              {rule.ruleName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                rule.severity === 'critical'
                                  ? 'bg-destructive/10 text-destructive border-destructive'
                                  : rule.severity === 'warning'
                                  ? 'bg-warning/10 text-warning border-warning'
                                  : 'bg-primary/10 text-primary border-primary'
                              }
                            >
                              {rule.count}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="mt-0 space-y-4">
              {/* Resolution Times */}
              <Card className="p-6 bg-control-surface border-control-border">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Mean Time to Resolution by Rule
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={resolutionTimeData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      type="number"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      label={{ value: 'Minutes', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="rule"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      width={150}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                      formatter={(value: number) => formatTime(value)}
                    />
                    <Legend />
                    <Bar dataKey="avg" fill="hsl(var(--primary))" name="Average" />
                    <Bar dataKey="min" fill="hsl(var(--chart-1))" name="Minimum" />
                    <Bar dataKey="max" fill="hsl(var(--chart-2))" name="Maximum" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Performance Metrics Grid */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 bg-control-surface border-control-border">
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    Fastest Resolution
                  </h4>
                  {analytics.resolutionTimes.length > 0 && (
                    <>
                      <p className="text-2xl font-bold text-success mb-1">
                        {formatTime(
                          Math.min(...analytics.resolutionTimes.map(r => r.minTime))
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {analytics.resolutionTimes.find(
                          r => r.minTime === Math.min(...analytics.resolutionTimes.map(rt => rt.minTime))
                        )?.ruleName}
                      </p>
                    </>
                  )}
                </Card>

                <Card className="p-4 bg-control-surface border-control-border">
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    Slowest Resolution
                  </h4>
                  {analytics.resolutionTimes.length > 0 && (
                    <>
                      <p className="text-2xl font-bold text-destructive mb-1">
                        {formatTime(
                          Math.max(...analytics.resolutionTimes.map(r => r.maxTime))
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {analytics.resolutionTimes.find(
                          r => r.maxTime === Math.max(...analytics.resolutionTimes.map(rt => rt.maxTime))
                        )?.ruleName}
                      </p>
                    </>
                  )}
                </Card>

                <Card className="p-4 bg-control-surface border-control-border">
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    Overall Average
                  </h4>
                  <p className="text-2xl font-bold text-primary mb-1">
                    {formatTime(analytics.mttr)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Across all {analytics.acknowledgedAlerts} resolved alerts
                  </p>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="channels" className="mt-0 space-y-4">
              {/* Channel Performance */}
              <Card className="p-6 bg-control-surface border-control-border">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Notification Channel Performance
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={channelPerformanceData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="name"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    />
                    <Radar
                      name="Success Rate %"
                      dataKey="success"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.6}
                    />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>

              {/* Channel Details */}
              <div className="grid grid-cols-2 gap-4">
                {analytics.channelPerformance.map((channel) => {
                  const Icon = channelIcons[channel.channel];
                  const successRate = (channel.successful / channel.totalSent) * 100;

                  return (
                    <Card key={channel.channel} className="p-4 bg-control-surface border-control-border">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-foreground capitalize">
                            {channel.channel.replace('_', ' ')}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {channel.totalSent} notifications sent
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Success Rate</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-background rounded-full overflow-hidden">
                              <div
                                className="h-full bg-success"
                                style={{ width: `${successRate}%` }}
                              />
                            </div>
                            <span className="text-sm font-mono font-semibold text-foreground">
                              {successRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground mb-1">Successful</p>
                            <p className="font-mono font-semibold text-success">
                              {channel.successful}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Failed</p>
                            <p className="font-mono font-semibold text-destructive">
                              {channel.failed}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Avg Delivery Time</p>
                          <p className="font-mono font-semibold text-foreground">
                            {channel.avgDeliveryTime.toFixed(0)}ms
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
