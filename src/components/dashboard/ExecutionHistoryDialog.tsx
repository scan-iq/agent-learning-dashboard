import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExecutionHistoryRecord, HistoryFilters } from '@/types/history';
import {
  History,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Download,
  Search,
  Filter,
  Clock,
  TrendingUp,
  Activity,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

interface ExecutionHistoryDialogProps {
  history: ExecutionHistoryRecord[];
  open: boolean;
  onClose: () => void;
}

export function ExecutionHistoryDialog({
  history,
  open,
  onClose,
}: ExecutionHistoryDialogProps) {
  const [filters, setFilters] = useState<HistoryFilters>({});
  const [selectedRecord, setSelectedRecord] = useState<ExecutionHistoryRecord | null>(null);

  const filteredHistory = useMemo(() => {
    let filtered = [...history];

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(record => filters.status?.includes(record.status));
    }

    if (filters.projectId) {
      filtered = filtered.filter(record => record.projectId === filters.projectId);
    }

    if (filters.executedBy && filters.executedBy.length > 0) {
      filtered = filtered.filter(record => filters.executedBy?.includes(record.executedBy));
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(record =>
        record.actionTitle.toLowerCase().includes(query) ||
        record.projectName.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [history, filters]);

  const stats = useMemo(() => {
    const total = filteredHistory.length;
    const completed = filteredHistory.filter(r => r.status === 'completed').length;
    const failed = filteredHistory.filter(r => r.status === 'failed').length;
    const rolledBack = filteredHistory.filter(r => r.status === 'rolled_back').length;
    const avgDuration = filteredHistory.reduce((acc, r) => acc + r.duration, 0) / total || 0;
    const successRate = total > 0 ? (completed / total) * 100 : 0;

    return { total, completed, failed, rolledBack, avgDuration, successRate };
  }, [filteredHistory]);

  const timelineData = useMemo(() => {
    const grouped = filteredHistory.reduce((acc, record) => {
      const date = format(new Date(record.startTime), 'MMM dd');
      if (!acc[date]) {
        acc[date] = { date, completed: 0, failed: 0, rolled_back: 0 };
      }
      acc[date][record.status]++;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  }, [filteredHistory]);

  const performanceData = useMemo(() => {
    return filteredHistory.slice(0, 10).reverse().map(record => ({
      name: format(new Date(record.startTime), 'HH:mm'),
      duration: record.duration,
      cpu: record.metrics.avgCpuUsage,
      memory: record.metrics.avgMemoryUsage,
    }));
  }, [filteredHistory]);

  const exportToCSV = () => {
    const headers = [
      'ID',
      'Action',
      'Project',
      'Status',
      'Start Time',
      'End Time',
      'Duration (s)',
      'Steps Completed',
      'Total Steps',
      'Executed By',
      'Avg CPU',
      'Avg Memory',
      'Error Count',
    ];

    const rows = filteredHistory.map(record => [
      record.id,
      record.actionTitle,
      record.projectName,
      record.status,
      record.startTime,
      record.endTime,
      record.duration,
      record.completedSteps,
      record.totalSteps,
      record.executedBy,
      record.metrics.avgCpuUsage.toFixed(1),
      record.metrics.avgMemoryUsage.toFixed(1),
      record.metrics.errorCount,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `remediation-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: ExecutionHistoryRecord['status']) => {
    const config = {
      completed: { label: 'COMPLETED', class: 'bg-success/10 text-success border-success', icon: CheckCircle2 },
      failed: { label: 'FAILED', class: 'bg-destructive/10 text-destructive border-destructive', icon: XCircle },
      rolled_back: { label: 'ROLLED BACK', class: 'bg-warning/10 text-warning border-warning', icon: RotateCcw },
    }[status];

    const Icon = config.icon;

    return (
      <Badge variant="outline" className={config.class}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(0)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs.toFixed(0)}s`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <History className="w-5 h-5 text-primary" />
            Remediation Execution History
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
              {stats.total} Records
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Complete history of all remediation executions with metrics and analytics
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="list" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-control-surface">
              <TabsTrigger value="list">
                <History className="w-4 h-4 mr-2" />
                Execution Log
              </TabsTrigger>
              <TabsTrigger value="timeline">
                <Calendar className="w-4 h-4 mr-2" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="performance">
                <BarChart3 className="w-4 h-4 mr-2" />
                Performance
              </TabsTrigger>
            </TabsList>

            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-6 gap-3 mb-4">
            <Card className="p-3 bg-control-surface border-control-border">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
            </Card>
            <Card className="p-3 bg-success/5 border-success/30">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-xs text-muted-foreground">Completed</span>
              </div>
              <p className="text-xl font-bold text-success">{stats.completed}</p>
            </Card>
            <Card className="p-3 bg-destructive/5 border-destructive/30">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="w-4 h-4 text-destructive" />
                <span className="text-xs text-muted-foreground">Failed</span>
              </div>
              <p className="text-xl font-bold text-destructive">{stats.failed}</p>
            </Card>
            <Card className="p-3 bg-warning/5 border-warning/30">
              <div className="flex items-center gap-2 mb-1">
                <RotateCcw className="w-4 h-4 text-warning" />
                <span className="text-xs text-muted-foreground">Rolled Back</span>
              </div>
              <p className="text-xl font-bold text-warning">{stats.rolledBack}</p>
            </Card>
            <Card className="p-3 bg-control-surface border-control-border">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Avg Duration</span>
              </div>
              <p className="text-xl font-bold text-foreground">{formatDuration(stats.avgDuration)}</p>
            </Card>
            <Card className="p-3 bg-control-surface border-control-border">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Success Rate</span>
              </div>
              <p className="text-xl font-bold text-foreground">{stats.successRate.toFixed(1)}%</p>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search actions or projects..."
                value={filters.searchQuery || ''}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="pl-10 bg-control-surface"
              />
            </div>
            <Select
              value={filters.status?.[0] || 'all'}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value === 'all' ? undefined : [value as any] })
              }
            >
              <SelectTrigger className="w-[180px] bg-control-surface">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="rolled_back">Rolled Back</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="list" className="mt-0">
            <ScrollArea className="h-[calc(90vh-400px)]">
              <div className="space-y-3 pr-4">
                {filteredHistory.length === 0 ? (
                  <Card className="p-8 bg-control-surface border-control-border text-center">
                    <History className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-foreground font-medium mb-1">No Execution History</p>
                    <p className="text-sm text-muted-foreground">
                      {filters.searchQuery || filters.status
                        ? 'No records match your filters'
                        : 'Execute remediation actions to see history'}
                    </p>
                  </Card>
                ) : (
                  filteredHistory.map((record) => (
                    <Card
                      key={record.id}
                      className="p-4 bg-control-surface border-control-border hover:border-primary/50 transition-all cursor-pointer"
                      onClick={() => setSelectedRecord(record)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-foreground truncate">
                              {record.actionTitle}
                            </h4>
                            {getStatusBadge(record.status)}
                          </div>
                          <p className="text-xs text-muted-foreground">{record.projectName}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(record.startTime), 'MMM dd, HH:mm')}
                        </span>
                      </div>

                      <div className="grid grid-cols-5 gap-4 text-xs">
                        <div>
                          <p className="text-muted-foreground mb-1">Duration</p>
                          <p className="font-mono font-semibold text-foreground">
                            {formatDuration(record.duration)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Steps</p>
                          <p className="font-mono font-semibold text-foreground">
                            {record.completedSteps}/{record.totalSteps}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Avg CPU</p>
                          <p className="font-mono font-semibold text-foreground">
                            {record.metrics.avgCpuUsage.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Avg Memory</p>
                          <p className="font-mono font-semibold text-foreground">
                            {record.metrics.avgMemoryUsage.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Executed By</p>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary text-xs">
                            {record.executedBy.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      {record.errorMessage && (
                        <div className="mt-3 p-2 bg-destructive/10 border border-destructive rounded">
                          <p className="text-xs text-destructive font-mono">{record.errorMessage}</p>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="timeline" className="mt-0">
            <Card className="p-6 bg-control-surface border-control-border">
              <h3 className="text-sm font-semibold text-foreground mb-4">Execution Timeline</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="completed" fill="hsl(var(--chart-1))" name="Completed" />
                  <Bar dataKey="failed" fill="hsl(var(--destructive))" name="Failed" />
                  <Bar dataKey="rolled_back" fill="hsl(var(--chart-3))" name="Rolled Back" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="mt-0">
            <div className="space-y-4">
              <Card className="p-6 bg-control-surface border-control-border">
                <h3 className="text-sm font-semibold text-foreground mb-4">Execution Duration Trends</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="duration"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Duration (s)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6 bg-control-surface border-control-border">
                <h3 className="text-sm font-semibold text-foreground mb-4">Resource Usage During Execution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
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
                      dataKey="cpu"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      name="Avg CPU %"
                    />
                    <Line
                      type="monotone"
                      dataKey="memory"
                      stroke="hsl(var(--chart-4))"
                      strokeWidth={2}
                      name="Avg Memory %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Detail Modal */}
        {selectedRecord && (
          <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
            <DialogContent className="max-w-2xl bg-card border-border">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Execution Details
                  {getStatusBadge(selectedRecord.status)}
                </DialogTitle>
                <DialogDescription>{selectedRecord.actionTitle}</DialogDescription>
              </DialogHeader>

              <ScrollArea className="max-h-[60vh] pr-4">
                <div className="space-y-4">
                  <Card className="p-4 bg-control-surface border-control-border">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Execution Info</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Project</p>
                        <p className="font-medium text-foreground">{selectedRecord.projectName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Executed By</p>
                        <p className="font-medium text-foreground">{selectedRecord.executedBy}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Start Time</p>
                        <p className="font-mono text-foreground">
                          {format(new Date(selectedRecord.startTime), 'PPpp')}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">End Time</p>
                        <p className="font-mono text-foreground">
                          {format(new Date(selectedRecord.endTime), 'PPpp')}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-mono text-foreground">{formatDuration(selectedRecord.duration)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Steps</p>
                        <p className="font-mono text-foreground">
                          {selectedRecord.completedSteps} / {selectedRecord.totalSteps}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-control-surface border-control-border">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Performance Metrics</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Avg CPU Usage</p>
                        <p className="font-mono text-foreground">{selectedRecord.metrics.avgCpuUsage.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Peak CPU Usage</p>
                        <p className="font-mono text-foreground">{selectedRecord.metrics.peakCpuUsage.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Memory Usage</p>
                        <p className="font-mono text-foreground">
                          {selectedRecord.metrics.avgMemoryUsage.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Peak Memory Usage</p>
                        <p className="font-mono text-foreground">
                          {selectedRecord.metrics.peakMemoryUsage.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Response Time</p>
                        <p className="font-mono text-foreground">{selectedRecord.metrics.avgResponseTime.toFixed(0)}ms</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Error Count</p>
                        <p className="font-mono text-foreground">{selectedRecord.metrics.errorCount}</p>
                      </div>
                    </div>
                  </Card>

                  {selectedRecord.errorMessage && (
                    <Card className="p-4 bg-destructive/5 border-destructive">
                      <h4 className="text-sm font-semibold text-destructive mb-2">Error Details</h4>
                      <p className="text-sm font-mono text-destructive">{selectedRecord.errorMessage}</p>
                    </Card>
                  )}

                  {selectedRecord.rollbackReason && (
                    <Card className="p-4 bg-warning/5 border-warning">
                      <h4 className="text-sm font-semibold text-warning mb-2">Rollback Reason</h4>
                      <p className="text-sm text-warning">{selectedRecord.rollbackReason}</p>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
