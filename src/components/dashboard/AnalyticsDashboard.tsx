/**
 * Analytics Dashboard Component
 * Displays comprehensive analytics from backend IRIS Prime API
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useIrisAnalytics } from '@/hooks/useIrisAnalytics';
import { AlertTriangle, TrendingUp, DollarSign, Zap, Brain, Users, Activity } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(189, 94%, 43%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

export function AnalyticsDashboard() {
  const { data: analytics, isLoading, error } = useIrisAnalytics();

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

  if (error) {
    console.error('❌ Analytics error:', error);
    return (
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <CardTitle>Failed to Load Analytics</CardTitle>
          </div>
          <CardDescription>
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Make sure you have configured your API key and the backend is accessible.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    console.warn('⚠️ Analytics data is null/undefined');
    return null;
  }

  // Detailed logging to debug what we received
  console.log('📊 Analytics data structure:', {
    hasOverview: !!analytics.overview,
    hasTokenUsage: !!analytics.tokenUsage,
    hasCosts: !!analytics.costs,
    hasPerformance: !!analytics.performance,
    hasModelRuns: !!analytics.modelRuns,
    hasReflexions: !!analytics.reflexions,
    hasConsensus: !!analytics.consensus,
    hasProjects: !!analytics.projects,
    keys: Object.keys(analytics),
  });

  // Safely destructure with fallbacks
  const {
    overview = {},
    tokenUsage = {},
    costs = {},
    performance = {},
    modelRuns = [],
    reflexions = [],
    consensus = [],
    projects = [],
  } = analytics || {};

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalRuns?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              Success Rate: {((overview?.successRate || 0) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(overview?.totalCost || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Avg per run: ${(performance?.avgCostPerRun || 0).toFixed(4)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((overview?.avgConfidence || 0) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Reflexions: {overview?.totalReflexions || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Token Usage</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((tokenUsage?.totalTokens || 0) / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {(performance?.avgTokensPerRun || 0).toLocaleString()} per run
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="tokens" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tokens">Token Usage</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="runs">Recent Runs</TabsTrigger>
          <TabsTrigger value="reflexions">Reflexions</TabsTrigger>
          <TabsTrigger value="consensus">Consensus</TabsTrigger>
        </TabsList>

        {/* Token Usage Tab */}
        <TabsContent value="tokens" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Token Usage Over Time</CardTitle>
                <CardDescription>Daily token consumption trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={tokenUsage?.overTime || []}>
                    <defs>
                      <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
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
                    />
                    <Area
                      type="monotone"
                      dataKey="tokens"
                      stroke="hsl(var(--primary))"
                      fill="url(#colorTokens)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Token Usage by Model</CardTitle>
                <CardDescription>Distribution across different models</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={tokenUsage?.byModel || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="model" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                      }}
                    />
                    <Bar dataKey="tokens" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="costs" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cost Trends</CardTitle>
                <CardDescription>Daily spending over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={costs?.overTime || []}>
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
                    <Line
                      type="monotone"
                      dataKey="cost"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost by Project</CardTitle>
                <CardDescription>Spending distribution per project</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={costs?.byProject || []}
                      dataKey="cost"
                      nameKey="project"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {(costs?.byProject || []).map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recent Runs Tab */}
        <TabsContent value="runs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Model Runs</CardTitle>
              <CardDescription>Latest executions across all projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(modelRuns || []).slice(0, 20).map((run: any) => (
                  <div
                    key={run.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant={run.success ? 'outline' : 'destructive'}>
                        {run.project}
                      </Badge>
                      <span className="text-sm font-mono text-muted-foreground">{run.model}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Confidence: {(run.confidence * 100).toFixed(1)}%
                      </span>
                      <span className="text-muted-foreground">
                        {run.tokens.toLocaleString()} tokens
                      </span>
                      <span className="text-muted-foreground">${run.cost.toFixed(4)}</span>
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

        {/* Reflexions Tab */}
        <TabsContent value="reflexions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reflexion Insights</CardTitle>
              <CardDescription>Self-improvement patterns and impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(reflexions || []).map((ref: any) => (
                  <div
                    key={ref.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Brain className="w-4 h-4 text-primary" />
                      <Badge>{ref.project}</Badge>
                      <span className="text-sm">{ref.category}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Impact: {(ref.impact * 100).toFixed(1)}%
                      </span>
                      <span className="text-muted-foreground">
                        Reused: {ref.reusedCount}x
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(ref.timestamp), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consensus Tab */}
        <TabsContent value="consensus" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consensus Decisions</CardTitle>
              <CardDescription>Multi-model agreement patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(consensus || []).map((cons: any) => (
                  <div
                    key={cons.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-primary" />
                      <Badge>{cons.project}</Badge>
                      <span className="text-sm">{cons.participants} models</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Confidence: {(cons.confidence * 100).toFixed(1)}%
                      </span>
                      <span className="text-muted-foreground">
                        Agreement: {(cons.agreement * 100).toFixed(1)}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(cons.timestamp), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Projects Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Projects Overview</CardTitle>
          <CardDescription>Performance summary across all projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(projects || []).map((project: any) => (
              <Card key={project.id} className="border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{project.name}</CardTitle>
                    <Badge
                      variant={
                        project.health === 'healthy'
                          ? 'outline'
                          : project.health === 'warning'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {project.health}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Runs:</span>
                    <span className="font-medium">{project.totalRuns}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Success Rate:</span>
                    <span className="font-medium">{(project.successRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Confidence:</span>
                    <span className="font-medium">{(project.avgConfidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Cost:</span>
                    <span className="font-medium">${project.totalCost.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
