/**
 * ConfidenceTrend Component
 * Line chart showing confidence trends over time with quartile bands
 * Displays p25, p50, p75, p95 with zoom and pan controls
 */

import { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from 'recharts';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export interface ConfidenceTrendDataPoint {
  timestamp: string | Date;
  p25?: number;
  p50?: number;
  p75?: number;
  p95?: number;
  mean?: number;
  values?: number[];
}

export interface ConfidenceTrendProps {
  data: ConfidenceTrendDataPoint[];
  height?: number;
  showBands?: boolean;
  showLines?: boolean;
  enableZoom?: boolean;
  dateFormat?: string;
}

export function ConfidenceTrend({
  data,
  height = 400,
  showBands = true,
  showLines = true,
  enableZoom = true,
  dateFormat = 'MMM dd',
}: ConfidenceTrendProps) {
  const [zoomDomain, setZoomDomain] = useState<[number, number] | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No trend data available
      </div>
    );
  }

  // Process data to ensure timestamps are Date objects
  const processedData = data.map((point) => ({
    ...point,
    timestamp: typeof point.timestamp === 'string' ? new Date(point.timestamp) : point.timestamp,
    timestampValue: new Date(point.timestamp).getTime(),
  }));

  const handleZoomIn = () => {
    const dataLength = processedData.length;
    const currentStart = zoomDomain ? zoomDomain[0] : 0;
    const currentEnd = zoomDomain ? zoomDomain[1] : dataLength - 1;
    const range = currentEnd - currentStart;
    const newRange = Math.max(10, Math.floor(range * 0.7));
    const center = Math.floor((currentStart + currentEnd) / 2);

    setZoomDomain([
      Math.max(0, center - Math.floor(newRange / 2)),
      Math.min(dataLength - 1, center + Math.floor(newRange / 2)),
    ]);
  };

  const handleZoomOut = () => {
    if (!zoomDomain) {
      return;
    }

    const dataLength = processedData.length;
    const currentStart = zoomDomain[0];
    const currentEnd = zoomDomain[1];
    const range = currentEnd - currentStart;
    const newRange = Math.min(dataLength, Math.floor(range * 1.5));
    const center = Math.floor((currentStart + currentEnd) / 2);

    const newStart = Math.max(0, center - Math.floor(newRange / 2));
    const newEnd = Math.min(dataLength - 1, center + Math.floor(newRange / 2));

    if (newStart === 0 && newEnd === dataLength - 1) {
      setZoomDomain(null);
    } else {
      setZoomDomain([newStart, newEnd]);
    }
  };

  const handleResetZoom = () => {
    setZoomDomain(null);
  };

  // Filter data based on zoom domain
  const displayData = zoomDomain
    ? processedData.slice(zoomDomain[0], zoomDomain[1] + 1)
    : processedData;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-2">
            {format(new Date(label), 'PPpp')}
          </p>
          <div className="space-y-1 text-xs">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex justify-between gap-4">
                <span style={{ color: entry.color }}>{entry.name}:</span>
                <span className="font-medium">{entry.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Zoom controls */}
      {enableZoom && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoomDomain !== null && zoomDomain[1] - zoomDomain[0] <= 10}
          >
            <ZoomIn className="w-4 h-4 mr-1" />
            Zoom In
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoomDomain === null}
          >
            <ZoomOut className="w-4 h-4 mr-1" />
            Zoom Out
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetZoom}
            disabled={zoomDomain === null}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        {showBands ? (
          <AreaChart
            data={displayData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <defs>
              {/* Gradient for confidence bands */}
              <linearGradient id="colorP95" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorP75" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorP25" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(val) => format(new Date(val), dateFormat)}
              stroke="hsl(var(--muted-foreground))"
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              domain={[0, 100]}
              label={{
                value: 'Confidence Score',
                angle: -90,
                position: 'insideLeft',
                style: { fill: 'hsl(var(--muted-foreground))' },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {/* P95 band */}
            <Area
              type="monotone"
              dataKey="p95"
              name="P95"
              stroke="hsl(142, 76%, 36%)"
              fill="url(#colorP95)"
              strokeWidth={1}
              dot={false}
            />

            {/* P75 band */}
            <Area
              type="monotone"
              dataKey="p75"
              name="P75"
              stroke="hsl(189, 94%, 43%)"
              fill="url(#colorP75)"
              strokeWidth={1.5}
              dot={false}
            />

            {/* Median (P50) */}
            <Area
              type="monotone"
              dataKey="p50"
              name="Median (P50)"
              stroke="hsl(var(--primary))"
              fill="url(#colorP25)"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', r: 3 }}
            />

            {/* P25 line */}
            <Area
              type="monotone"
              dataKey="p25"
              name="P25"
              stroke="hsl(38, 92%, 50%)"
              fill="transparent"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
            />

            {/* Brush for panning */}
            {enableZoom && data.length > 20 && (
              <Brush
                dataKey="timestamp"
                height={30}
                stroke="hsl(var(--primary))"
                tickFormatter={(val) => format(new Date(val), 'MMM dd')}
              />
            )}
          </AreaChart>
        ) : (
          <LineChart
            data={displayData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(val) => format(new Date(val), dateFormat)}
              stroke="hsl(var(--muted-foreground))"
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              domain={[0, 100]}
              label={{
                value: 'Confidence Score',
                angle: -90,
                position: 'insideLeft',
                style: { fill: 'hsl(var(--muted-foreground))' },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {/* Individual lines for each quartile */}
            <Line
              type="monotone"
              dataKey="p95"
              name="P95"
              stroke="hsl(142, 76%, 36%)"
              strokeWidth={2}
              dot={{ fill: 'hsl(142, 76%, 36%)', r: 2 }}
            />
            <Line
              type="monotone"
              dataKey="p75"
              name="P75"
              stroke="hsl(189, 94%, 43%)"
              strokeWidth={2}
              dot={{ fill: 'hsl(189, 94%, 43%)', r: 2 }}
            />
            <Line
              type="monotone"
              dataKey="p50"
              name="Median (P50)"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="p25"
              name="P25"
              stroke="hsl(38, 92%, 50%)"
              strokeWidth={2}
              dot={{ fill: 'hsl(38, 92%, 50%)', r: 2 }}
            />
            {displayData[0]?.mean !== undefined && (
              <Line
                type="monotone"
                dataKey="mean"
                name="Mean"
                stroke="hsl(0, 84%, 60%)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            )}

            {/* Brush for panning */}
            {enableZoom && data.length > 20 && (
              <Brush
                dataKey="timestamp"
                height={30}
                stroke="hsl(var(--primary))"
                tickFormatter={(val) => format(new Date(val), 'MMM dd')}
              />
            )}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
