import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
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
  Cell,
} from 'recharts';
import { useIrisOverview } from '@/hooks/useIrisData';
import {
  useHealthTrends,
  useSuccessRateTrends,
  useLatencyTrends,
  useReflexionImpact,
  useExpertPerformance,
} from '@/hooks/useAnalytics';

export function AnalyticsSection() {
  // Get available projects
  const { data: overviewData } = useIrisOverview();
  const projects = overviewData?.projects || [];

  // Track selected project for analytics
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    projects.length > 0 ? projects[0].id : null
  );

  // Fetch analytics data for selected project
  const { data: healthTrends, isLoading: healthLoading } = useHealthTrends(selectedProjectId, 24);
  const { data: successRates, isLoading: successLoading } = useSuccessRateTrends(selectedProjectId, 24);
  const { data: latencyTrends, isLoading: latencyLoading } = useLatencyTrends(selectedProjectId, 24);
  const { data: reflexionImpact, isLoading: reflexionLoading } = useReflexionImpact(selectedProjectId);
  const { data: expertPerformance, isLoading: expertLoading } = useExpertPerformance(selectedProjectId);

  // Update selected project when projects load
  if (projects.length > 0 && !selectedProjectId) {
    setSelectedProjectId(projects[0].id);
  }
  const projectColors = {
    'nfl-predictor': 'hsl(142, 76%, 36%)',
    'microbiome': 'hsl(38, 92%, 50%)',
    'beclever': 'hsl(189, 94%, 43%)',
  };

  const reflexionColors = ['hsl(189, 94%, 43%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Historical Analytics</h2>
          <p className="text-sm text-muted-foreground">Performance trends and insights over the last 24 hours</p>
        </div>
        <Select value={selectedProjectId || ''} onValueChange={setSelectedProjectId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="health" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-card border border-border">
          <TabsTrigger value="health">Health Trends</TabsTrigger>
          <TabsTrigger value="success">Success Rates</TabsTrigger>
          <TabsTrigger value="experts">Expert Performance</TabsTrigger>
          <TabsTrigger value="latency">Latency</TabsTrigger>
          <TabsTrigger value="reflexions">Reflexions</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="mt-4">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground">Project Health Score Over Time</h3>
            </div>
            {healthLoading ? (
              <Skeleton className="w-full h-[350px]" />
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={healthTrends || []}>
                  <defs>
                    <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="healthScore"
                    stroke="hsl(var(--primary))"
                    fill="url(#colorHealth)"
                    strokeWidth={2}
                    name="Health Score"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="success" className="mt-4">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-base font-semibold text-foreground mb-4">Success Rate Trends (%)</h3>
            {successLoading ? (
              <Skeleton className="w-full h-[350px]" />
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={successRates || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="successRate"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                    name="Success Rate"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="experts" className="mt-4">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-base font-semibold text-foreground mb-4">Expert Accuracy Comparison</h3>
            {expertLoading ? (
              <Skeleton className="w-full h-[350px]" />
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={expertPerformance || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="expertName" stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="accuracy" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]}>
                    {(expertPerformance || []).map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.accuracy >= 95
                            ? 'hsl(142, 76%, 36%)'
                            : entry.accuracy >= 90
                            ? 'hsl(189, 94%, 43%)'
                            : 'hsl(38, 92%, 50%)'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="latency" className="mt-4">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground">Average Latency Trends (ms)</h3>
            </div>
            {latencyLoading ? (
              <Skeleton className="w-full h-[350px]" />
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={latencyTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avgLatency"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Avg Latency"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="reflexions" className="mt-4">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-base font-semibold text-foreground mb-4">Reflexion Impact by Category</h3>
            {reflexionLoading ? (
              <Skeleton className="w-full h-[350px]" />
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={reflexionImpact || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" domain={[0, 1]} />
                  <YAxis type="category" dataKey="category" stroke="hsl(var(--muted-foreground))" width={150} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="avg_impact" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]}>
                    {(reflexionImpact || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={reflexionColors[index % reflexionColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            {reflexionImpact && reflexionImpact.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-4">
                {reflexionImpact.map((item: any, idx: number) => (
                  <div key={idx} className="text-center">
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                    <p className="text-lg font-mono text-foreground">{item.count}</p>
                    <p className="text-xs text-muted-foreground">patterns</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
