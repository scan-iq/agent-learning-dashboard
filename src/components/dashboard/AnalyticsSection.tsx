import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  mockHealthTrends,
  mockSuccessRates,
  mockExpertPerformance,
  mockLatencyTrends,
  mockReflexionImpact,
} from '@/lib/mock-data';

export function AnalyticsSection() {
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
            <h3 className="text-base font-semibold text-foreground mb-4">Project Health Score Over Time</h3>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={mockHealthTrends}>
                <defs>
                  <linearGradient id="colorNFL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={projectColors['nfl-predictor']} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={projectColors['nfl-predictor']} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMicro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={projectColors['microbiome']} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={projectColors['microbiome']} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBeclever" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={projectColors['beclever']} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={projectColors['beclever']} stopOpacity={0} />
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
                  dataKey="nfl-predictor"
                  stroke={projectColors['nfl-predictor']}
                  fill="url(#colorNFL)"
                  strokeWidth={2}
                  name="NFL Predictor"
                />
                <Area
                  type="monotone"
                  dataKey="microbiome"
                  stroke={projectColors['microbiome']}
                  fill="url(#colorMicro)"
                  strokeWidth={2}
                  name="Microbiome"
                />
                <Area
                  type="monotone"
                  dataKey="beclever"
                  stroke={projectColors['beclever']}
                  fill="url(#colorBeclever)"
                  strokeWidth={2}
                  name="BeClever"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="success" className="mt-4">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-base font-semibold text-foreground mb-4">Success Rate Trends (%)</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={mockSuccessRates}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={[80, 100]} />
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
                  dataKey="nfl-predictor"
                  stroke={projectColors['nfl-predictor']}
                  strokeWidth={2}
                  dot={{ fill: projectColors['nfl-predictor'] }}
                  name="NFL Predictor"
                />
                <Line
                  type="monotone"
                  dataKey="microbiome"
                  stroke={projectColors['microbiome']}
                  strokeWidth={2}
                  dot={{ fill: projectColors['microbiome'] }}
                  name="Microbiome"
                />
                <Line
                  type="monotone"
                  dataKey="beclever"
                  stroke={projectColors['beclever']}
                  strokeWidth={2}
                  dot={{ fill: projectColors['beclever'] }}
                  name="BeClever"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="experts" className="mt-4">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-base font-semibold text-foreground mb-4">Expert Accuracy Comparison</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={mockExpertPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="accuracy" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]}>
                  {mockExpertPerformance.map((entry, index) => (
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
          </Card>
        </TabsContent>

        <TabsContent value="latency" className="mt-4">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-base font-semibold text-foreground mb-4">Average Latency Trends (ms)</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={mockLatencyTrends}>
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
                  dataKey="nfl-predictor"
                  stroke={projectColors['nfl-predictor']}
                  strokeWidth={2}
                  name="NFL Predictor"
                />
                <Line
                  type="monotone"
                  dataKey="microbiome"
                  stroke={projectColors['microbiome']}
                  strokeWidth={2}
                  name="Microbiome"
                />
                <Line
                  type="monotone"
                  dataKey="beclever"
                  stroke={projectColors['beclever']}
                  strokeWidth={2}
                  name="BeClever"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="reflexions" className="mt-4">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-base font-semibold text-foreground mb-4">Reflexion Impact by Category</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={mockReflexionImpact} layout="vertical">
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
                  {mockReflexionImpact.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={reflexionColors[index % reflexionColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-4 gap-4">
              {mockReflexionImpact.map((item, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                  <p className="text-lg font-mono text-foreground">{item.count}</p>
                  <p className="text-xs text-muted-foreground">patterns</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
