/**
 * ScoreHistogram Component
 * Displays frequency distribution of confidence scores with optional normal curve overlay
 * Color-codes bins by performance level
 */

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from 'recharts';
import { binData, calculateQuartiles, generateNormalCurve } from '@/lib/stats-utils';

export interface ScoreHistogramProps {
  data: number[];
  binSize?: number;
  height?: number;
  showNormalCurve?: boolean;
  colorScheme?: 'performance' | 'uniform';
  title?: string;
}

interface HistogramBin {
  range: string;
  count: number;
  percentage: number;
  color: string;
  min: number;
  max: number;
}

// Performance-based color mapping (for confidence scores 0-100)
const getPerformanceColor = (value: number): string => {
  if (value >= 80) return 'hsl(142, 76%, 36%)'; // Green - Good
  if (value >= 60) return 'hsl(189, 94%, 43%)'; // Cyan - OK
  if (value >= 40) return 'hsl(38, 92%, 50%)'; // Orange - Warning
  return 'hsl(0, 84%, 60%)'; // Red - Poor
};

export function ScoreHistogram({
  data,
  binSize = 10,
  height = 300,
  showNormalCurve = true,
  colorScheme = 'performance',
  title,
}: ScoreHistogramProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No data available
      </div>
    );
  }

  // Bin the data
  const bins = binData(data, binSize);

  // Add colors based on scheme
  const histogramData: HistogramBin[] = bins.map((bin) => ({
    ...bin,
    color:
      colorScheme === 'performance'
        ? getPerformanceColor((bin.min + bin.max) / 2)
        : 'hsl(var(--primary))',
  }));

  // Calculate statistics for normal curve
  const stats = calculateQuartiles(data);
  const normalCurve = showNormalCurve
    ? generateNormalCurve(stats.mean, stats.stdDev, stats.min, stats.max, 50)
    : [];

  // Scale normal curve to match histogram
  const maxCount = Math.max(...histogramData.map((d) => d.count));
  const maxNormalY = Math.max(...normalCurve.map((d) => d.y));
  const scaledNormalCurve = normalCurve.map((point) => ({
    x: point.x,
    y: (point.y / maxNormalY) * maxCount,
    range: point.x.toFixed(0),
  }));

  // Merge histogram and normal curve data for ComposedChart
  const mergedData = histogramData.map((bin, index) => {
    const normalPoint = scaledNormalCurve.find(
      (p) => p.x >= bin.min && p.x < bin.max
    );
    return {
      ...bin,
      normalValue: normalPoint ? normalPoint.y : 0,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-2">{data.range}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Count:</span>
              <span className="font-medium">{data.count}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Percentage:</span>
              <span className="font-medium">{data.percentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-2">
      {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={mergedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="range"
            stroke="hsl(var(--muted-foreground))"
            label={{
              value: 'Confidence Score',
              position: 'insideBottom',
              offset: -10,
              style: { fill: 'hsl(var(--muted-foreground))' },
            }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            label={{
              value: 'Frequency',
              angle: -90,
              position: 'insideLeft',
              style: { fill: 'hsl(var(--muted-foreground))' },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* Histogram bars */}
          <Bar
            dataKey="count"
            name="Frequency"
            radius={[4, 4, 0, 0]}
          >
            {mergedData.map((entry, index) => (
              <rect
                key={`bar-${index}`}
                fill={entry.color}
                opacity={0.8}
              />
            ))}
          </Bar>

          {/* Normal distribution curve */}
          {showNormalCurve && (
            <Line
              type="monotone"
              dataKey="normalValue"
              name="Normal Distribution"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Statistics summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Mean</p>
          <p className="text-sm font-semibold">{stats.mean.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Median</p>
          <p className="text-sm font-semibold">{stats.p50.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Std Dev</p>
          <p className="text-sm font-semibold">{stats.stdDev.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Outliers</p>
          <p className="text-sm font-semibold">{stats.outliers.length}</p>
        </div>
      </div>
    </div>
  );
}
