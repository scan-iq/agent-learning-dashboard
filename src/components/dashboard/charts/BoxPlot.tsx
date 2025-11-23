/**
 * BoxPlot Component
 * Displays quartile distribution using recharts ComposedChart
 * Shows min, p25, median (p50), p75, max with outliers highlighted
 */

import {
  ComposedChart,
  Bar,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { calculateQuartiles } from '@/lib/stats-utils';

export interface BoxPlotData {
  name: string;
  values: number[];
  color?: string;
}

export interface BoxPlotProps {
  data: BoxPlotData[];
  orientation?: 'horizontal' | 'vertical';
  height?: number;
  showOutliers?: boolean;
  outlierColor?: string;
}

interface ProcessedBoxData {
  name: string;
  min: number;
  p25: number;
  median: number;
  p75: number;
  max: number;
  mean: number;
  outliers: Array<{ x: string; y: number }>;
  color: string;
}

const DEFAULT_COLORS = [
  'hsl(var(--primary))',
  'hsl(189, 94%, 43%)',
  'hsl(38, 92%, 50%)',
  'hsl(142, 76%, 36%)',
];

export function BoxPlot({
  data,
  orientation = 'vertical',
  height = 300,
  showOutliers = true,
  outlierColor = 'hsl(0, 84%, 60%)',
}: BoxPlotProps) {
  // Process data to calculate quartiles
  const processedData: ProcessedBoxData[] = data.map((item, index) => {
    const stats = calculateQuartiles(item.values);
    return {
      name: item.name,
      min: stats.min,
      p25: stats.p25,
      median: stats.p50,
      p75: stats.p75,
      max: stats.max,
      mean: stats.mean,
      outliers: stats.outliers.map((val) => ({ x: item.name, y: val })),
      color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    };
  });

  // Prepare data for box rendering (using stacked bars)
  const boxData = processedData.map((item) => ({
    name: item.name,
    // Bottom whisker: min to p25
    whiskerBottom: item.p25 - item.min,
    whiskerBottomStart: item.min,
    // IQR box: p25 to median
    lowerBox: item.median - item.p25,
    lowerBoxStart: item.p25,
    // IQR box: median to p75
    upperBox: item.p75 - item.median,
    upperBoxStart: item.median,
    // Top whisker: p75 to max
    whiskerTop: item.max - item.p75,
    whiskerTopStart: item.p75,
    // Reference values
    median: item.median,
    mean: item.mean,
    color: item.color,
  }));

  // Collect all outliers
  const allOutliers = processedData.flatMap((item) => item.outliers);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const item = processedData.find((d) => d.name === payload[0].payload.name);
      if (!item) return null;

      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-2">{item.name}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Max:</span>
              <span className="font-medium">{item.max.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">P95:</span>
              <span className="font-medium">{item.p75.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">P75:</span>
              <span className="font-medium">{item.p75.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Median:</span>
              <span className="font-medium">{item.median.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Mean:</span>
              <span className="font-medium">{item.mean.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">P25:</span>
              <span className="font-medium">{item.p25.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Min:</span>
              <span className="font-medium">{item.min.toFixed(2)}</span>
            </div>
            {item.outliers.length > 0 && (
              <div className="flex justify-between gap-4 pt-1 border-t border-border">
                <span className="text-muted-foreground">Outliers:</span>
                <span className="font-medium">{item.outliers.length}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (orientation === 'horizontal') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          layout="horizontal"
          data={boxData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
          <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" />
          <Tooltip content={<CustomTooltip />} />

          {/* Render box plot components */}
          {boxData.map((entry, index) => (
            <Bar
              key={`box-${index}`}
              dataKey={() => [entry.whiskerBottomStart, entry.p75]}
              fill={entry.color}
              fillOpacity={0.3}
              stackId="a"
            />
          ))}

          {showOutliers && allOutliers.length > 0 && (
            <Scatter data={allOutliers} fill={outlierColor} shape="circle" />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  // Vertical orientation (default)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={boxData}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
        <YAxis stroke="hsl(var(--muted-foreground))" />
        <Tooltip content={<CustomTooltip />} />

        {/* Bottom whisker */}
        <Bar dataKey="whiskerBottom" stackId="a" fill="transparent">
          {boxData.map((entry, index) => (
            <Cell key={`whisker-bottom-${index}`} stroke={entry.color} strokeWidth={2} />
          ))}
        </Bar>

        {/* Lower box (p25 to median) */}
        <Bar dataKey="lowerBox" stackId="a">
          {boxData.map((entry, index) => (
            <Cell key={`lower-box-${index}`} fill={entry.color} fillOpacity={0.7} />
          ))}
        </Bar>

        {/* Upper box (median to p75) */}
        <Bar dataKey="upperBox" stackId="a">
          {boxData.map((entry, index) => (
            <Cell key={`upper-box-${index}`} fill={entry.color} fillOpacity={0.5} />
          ))}
        </Bar>

        {/* Top whisker */}
        <Bar dataKey="whiskerTop" stackId="a" fill="transparent">
          {boxData.map((entry, index) => (
            <Cell key={`whisker-top-${index}`} stroke={entry.color} strokeWidth={2} />
          ))}
        </Bar>

        {/* Outliers */}
        {showOutliers && allOutliers.length > 0 && (
          <Scatter data={allOutliers} fill={outlierColor} shape="circle" />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
