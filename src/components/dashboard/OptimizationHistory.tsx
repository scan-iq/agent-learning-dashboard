/**
 * OptimizationHistory Component
 * Displays comprehensive optimization runs with filtering, sorting, and charts
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useOptimizationHistory,
  OptimizationQueryParams,
} from '@/hooks/useOptimizationHistory';
import { OptimizationFilters, SortField, SortOrder } from '@/types/optimization';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import {
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Clock,
  Zap,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  X,
} from 'lucide-react';

const OPTIMIZER_COLORS = {
  dspy: 'hsl(142, 76%, 36%)',
  manual: 'hsl(38, 92%, 50%)',
  auto: 'hsl(189, 94%, 43%)',
};

export function OptimizationHistory() {
  // Filter and sort state
  const [filters, setFilters] = useState<OptimizationFilters>({});
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [limit] = useState(50);

  // Build query params
  const queryParams: OptimizationQueryParams = {
    filters,
    sortField,
    sortOrder,
    limit,
  };

  // Fetch data
  const { data, isLoading, error } = useOptimizationHistory(queryParams);

  // Handle filter changes
  const updateFilter = (key: keyof OptimizationFilters, value: string | number | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  // Handle sort changes
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Render sort icon
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-40" />;
    return sortOrder === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Error state
  if (error) {
    console.error('❌ Optimization history error:', error);
    return (
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <CardTitle>Failed to Load Optimization History</CardTitle>
          </div>
          <CardDescription>
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Make sure the backend API is accessible and the endpoint is configured correctly.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const { runs, metrics, trends } = data;
  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== '');

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Optimizations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_optimizations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg Improvement: {metrics.avg_improvement.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.total_cost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Avg per run: ${(metrics.total_cost / (metrics.total_optimizations || 1)).toFixed(4)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Improvement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.best_improvement.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Peak optimization gain</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics.avg_duration_ms / 1000).toFixed(1)}s
            </div>
            <p className="text-xs text-muted-foreground">Average processing time</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="runs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="runs">Optimization Runs</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Runs Tab */}
        <TabsContent value="runs" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <CardTitle className="text-base">Filters</CardTitle>
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2">
                      Active
                    </Badge>
                  )}
                </div>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Expert Type Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Expert Type</label>
                  <Input
                    placeholder="e.g., nfl_predictor"
                    value={filters.expert_type || ''}
                    onChange={(e) => updateFilter('expert_type', e.target.value)}
                  />
                </div>

                {/* Optimizer Type Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Optimizer</label>
                  <Select
                    value={filters.optimizer_type || 'all'}
                    onValueChange={(value) =>
                      updateFilter('optimizer_type', value === 'all' ? undefined : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All optimizers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="dspy">DSPy</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Min Improvement Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Min Improvement (%)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 10"
                    value={filters.min_improvement !== undefined ? filters.min_improvement : ''}
                    onChange={(e) =>
                      updateFilter(
                        'min_improvement',
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                  />
                </div>

                {/* Date From Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date From</label>
                  <Input
                    type="date"
                    value={filters.date_from || ''}
                    onChange={(e) => updateFilter('date_from', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Optimization Runs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Runs</CardTitle>
              <CardDescription>
                Showing {runs.length} of {data.total_count} runs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('timestamp')}
                          className="h-8 p-0 hover:bg-transparent"
                        >
                          Timestamp
                          <SortIcon field="timestamp" />
                        </Button>
                      </TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Expert Role</TableHead>
                      <TableHead>Optimizer</TableHead>
                      <TableHead className="text-right">Baseline</TableHead>
                      <TableHead className="text-right">Optimized</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('improvement_pct')}
                          className="h-8 p-0 hover:bg-transparent"
                        >
                          Improvement
                          <SortIcon field="improvement_pct" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('cost_usd')}
                          className="h-8 p-0 hover:bg-transparent"
                        >
                          Cost
                          <SortIcon field="cost_usd" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('duration_ms')}
                          className="h-8 p-0 hover:bg-transparent"
                        >
                          Duration
                          <SortIcon field="duration_ms" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">Examples</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {runs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center text-muted-foreground">
                          No optimization runs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      runs.map((run) => (
                        <TableRow key={run.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-mono text-xs">
                            {format(new Date(run.timestamp), 'MMM dd, HH:mm')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{run.project}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{run.expert_role}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                run.optimizer_type === 'dspy'
                                  ? 'default'
                                  : run.optimizer_type === 'auto'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {run.optimizer_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {run.baseline_score.toFixed(3)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {run.optimized_score.toFixed(3)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <TrendingUp
                                className={`h-4 w-4 ${
                                  run.improvement_pct > 20
                                    ? 'text-green-500'
                                    : run.improvement_pct > 10
                                    ? 'text-yellow-500'
                                    : 'text-muted-foreground'
                                }`}
                              />
                              <span
                                className={`font-semibold ${
                                  run.improvement_pct > 20
                                    ? 'text-green-500'
                                    : run.improvement_pct > 10
                                    ? 'text-yellow-500'
                                    : ''
                                }`}
                              >
                                +{run.improvement_pct.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            ${run.cost_usd.toFixed(4)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {(run.duration_ms / 1000).toFixed(1)}s
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {run.examples_count}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Improvement Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Improvement Trend</CardTitle>
                <CardDescription>Optimization improvements over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      labelFormatter={(val) => format(new Date(val), 'PPpp')}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                      }}
                      formatter={(value: number) => [`${value.toFixed(2)}%`, 'Improvement']}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="improvement"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                      name="Avg Improvement"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cost Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Trend</CardTitle>
                <CardDescription>Optimization costs over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trends}>
                    <defs>
                      <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      labelFormatter={(val) => format(new Date(val), 'PPpp')}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                      }}
                      formatter={(value: number) => [`$${value.toFixed(4)}`, 'Cost']}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="cost"
                      stroke="hsl(var(--primary))"
                      fill="url(#colorCost)"
                      strokeWidth={2}
                      name="Avg Cost"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Run Count Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Activity</CardTitle>
                <CardDescription>Number of optimizations per period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      labelFormatter={(val) => format(new Date(val), 'PPpp')}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} name="Runs" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Optimizer Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Optimizer Distribution</CardTitle>
                <CardDescription>Usage by optimizer type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: 'DSPy', value: metrics.optimizer_distribution.dspy },
                      { name: 'Manual', value: metrics.optimizer_distribution.manual },
                      { name: 'Auto', value: metrics.optimizer_distribution.auto },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Optimizer Stats Cards */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">DSPy Optimizer</CardTitle>
                  <Badge style={{ backgroundColor: OPTIMIZER_COLORS.dspy }}>DSPy</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Runs:</span>
                  <span className="font-medium">{metrics.optimizer_distribution.dspy}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Percentage:</span>
                  <span className="font-medium">
                    {(
                      (metrics.optimizer_distribution.dspy / metrics.total_optimizations) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Manual Optimizer</CardTitle>
                  <Badge style={{ backgroundColor: OPTIMIZER_COLORS.manual }}>Manual</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Runs:</span>
                  <span className="font-medium">{metrics.optimizer_distribution.manual}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Percentage:</span>
                  <span className="font-medium">
                    {(
                      (metrics.optimizer_distribution.manual / metrics.total_optimizations) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Auto Optimizer</CardTitle>
                  <Badge style={{ backgroundColor: OPTIMIZER_COLORS.auto }}>Auto</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Runs:</span>
                  <span className="font-medium">{metrics.optimizer_distribution.auto}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Percentage:</span>
                  <span className="font-medium">
                    {(
                      (metrics.optimizer_distribution.auto / metrics.total_optimizations) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Optimizations */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Optimizations</CardTitle>
              <CardDescription>Highest improvement gains</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {runs
                  .slice()
                  .sort((a, b) => b.improvement_pct - a.improvement_pct)
                  .slice(0, 10)
                  .map((run) => (
                    <div
                      key={run.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{run.project}</Badge>
                        <span className="text-sm font-medium">{run.expert_role}</span>
                        <Badge
                          variant={
                            run.optimizer_type === 'dspy'
                              ? 'default'
                              : run.optimizer_type === 'auto'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {run.optimizer_type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="font-semibold text-green-500">
                            +{run.improvement_pct.toFixed(1)}%
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground font-mono">
                          ${run.cost_usd.toFixed(4)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(run.timestamp), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
