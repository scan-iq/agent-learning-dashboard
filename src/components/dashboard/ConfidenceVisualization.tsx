/**
 * ConfidenceVisualization Component
 * Comprehensive visualization panel combining all confidence charts
 * Features: tab interface, responsive layout, export capabilities, dark mode
 */

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BoxPlot, BoxPlotData } from './charts/BoxPlot';
import { ScoreHistogram } from './charts/ScoreHistogram';
import { ConfidenceTrend, ConfidenceTrendDataPoint } from './charts/ConfidenceTrend';
import { calculateQuartiles } from '@/lib/stats-utils';
import {
  Download,
  TrendingUp,
  BarChart3,
  Activity,
  Settings,
  FileImage,
  FileType,
} from 'lucide-react';

export interface ConfidenceDataset {
  name: string;
  values: number[];
  color?: string;
  timestamp?: string | Date;
}

export interface ConfidenceVisualizationProps {
  datasets: ConfidenceDataset[];
  trendData?: ConfidenceTrendDataPoint[];
  title?: string;
  description?: string;
  enableExport?: boolean;
}

const DEFAULT_COLORS = [
  'hsl(var(--primary))',
  'hsl(189, 94%, 43%)',
  'hsl(38, 92%, 50%)',
  'hsl(142, 76%, 36%)',
];

export function ConfidenceVisualization({
  datasets,
  trendData = [],
  title = 'Confidence Analysis Dashboard',
  description = 'Comprehensive statistical analysis of confidence scores',
  enableExport = true,
}: ConfidenceVisualizationProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const chartRef = useRef<HTMLDivElement>(null);

  if (!datasets || datasets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No confidence data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Add colors to datasets if not provided
  const coloredDatasets = datasets.map((dataset, index) => ({
    ...dataset,
    color: dataset.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));

  // Calculate statistics for overview
  const datasetStats = coloredDatasets.map((dataset) => ({
    name: dataset.name,
    stats: calculateQuartiles(dataset.values),
    color: dataset.color,
  }));

  // Prepare data for box plot
  const boxPlotData: BoxPlotData[] = coloredDatasets.map((dataset) => ({
    name: dataset.name,
    values: dataset.values,
    color: dataset.color,
  }));

  // Calculate comparison if multiple datasets
  const showComparison = coloredDatasets.length > 1;
  let comparisonData: {
    baseline: string;
    optimized: string;
    medianChange: number;
    meanChange: number;
    stdDevChange: number;
  } | null = null;

  if (showComparison) {
    const baseline = datasetStats[0];
    const optimized = datasetStats[1];
    comparisonData = {
      baseline: baseline.name,
      optimized: optimized.name,
      medianChange: ((optimized.stats.p50 - baseline.stats.p50) / baseline.stats.p50) * 100,
      meanChange: ((optimized.stats.mean - baseline.stats.mean) / baseline.stats.mean) * 100,
      stdDevChange:
        ((optimized.stats.stdDev - baseline.stats.stdDev) / baseline.stats.stdDev) * 100,
    };
  }

  // Export chart as PNG
  const handleExportPNG = async () => {
    if (!chartRef.current) return;

    try {
      // This is a simplified version - in production, you'd use html2canvas or similar
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // For now, just alert - full implementation would require html2canvas
      alert('Export feature requires html2canvas library. Implementation placeholder.');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Export chart as SVG
  const handleExportSVG = () => {
    alert('SVG export feature - implementation placeholder.');
  };

  // Export data as CSV
  const handleExportCSV = () => {
    const csvData: string[] = [];

    // Header
    csvData.push('Dataset,Value,Quartile');

    // Data rows
    coloredDatasets.forEach((dataset) => {
      const stats = datasetStats.find((s) => s.name === dataset.name);
      if (stats) {
        csvData.push(`${dataset.name},${stats.stats.min},Min`);
        csvData.push(`${dataset.name},${stats.stats.p25},P25`);
        csvData.push(`${dataset.name},${stats.stats.p50},Median`);
        csvData.push(`${dataset.name},${stats.stats.mean},Mean`);
        csvData.push(`${dataset.name},${stats.stats.p75},P75`);
        csvData.push(`${dataset.name},${stats.stats.p95},P95`);
        csvData.push(`${dataset.name},${stats.stats.max},Max`);
      }
    });

    const csv = csvData.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'confidence-data.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4" ref={chartRef}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            {enableExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportPNG}>
                    <FileImage className="w-4 h-4 mr-2" />
                    Export as PNG
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportSVG}>
                    <FileType className="w-4 h-4 mr-2" />
                    Export as SVG
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportCSV}>
                    <FileType className="w-4 h-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Main Visualization Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Distribution
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Compare
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {datasetStats.map((dataset, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{dataset.name}</CardTitle>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: dataset.color }}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Median:</span>
                    <span className="font-bold">{dataset.stats.p50.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mean:</span>
                    <span className="font-medium">{dataset.stats.mean.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Std Dev:</span>
                    <span className="font-medium">{dataset.stats.stdDev.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Samples:</span>
                    <span className="font-medium">{dataset.stats.outliers.length > 0 ? `${coloredDatasets[index].values.length} (${dataset.stats.outliers.length} outliers)` : coloredDatasets[index].values.length}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Box Plot */}
          <Card>
            <CardHeader>
              <CardTitle>Quartile Distribution</CardTitle>
              <CardDescription>
                Box plot visualization showing quartiles and outliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BoxPlot data={boxPlotData} height={350} showOutliers={true} />
            </CardContent>
          </Card>

          {/* Comparison Metrics */}
          {comparisonData && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Comparison</CardTitle>
                <CardDescription>
                  {comparisonData.baseline} vs {comparisonData.optimized}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Median Change</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">
                        {comparisonData.medianChange > 0 ? '+' : ''}
                        {comparisonData.medianChange.toFixed(1)}%
                      </p>
                      <Badge variant={comparisonData.medianChange > 0 ? 'default' : 'destructive'}>
                        {comparisonData.medianChange > 0 ? 'Improvement' : 'Decline'}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Mean Change</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">
                        {comparisonData.meanChange > 0 ? '+' : ''}
                        {comparisonData.meanChange.toFixed(1)}%
                      </p>
                      <Badge variant={comparisonData.meanChange > 0 ? 'default' : 'destructive'}>
                        {comparisonData.meanChange > 0 ? 'Improvement' : 'Decline'}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Std Dev Change</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">
                        {comparisonData.stdDevChange > 0 ? '+' : ''}
                        {comparisonData.stdDevChange.toFixed(1)}%
                      </p>
                      <Badge variant={comparisonData.stdDevChange < 0 ? 'default' : 'secondary'}>
                        {comparisonData.stdDevChange < 0 ? 'More Consistent' : 'More Variable'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {coloredDatasets.map((dataset, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: dataset.color }}
                    />
                    <CardTitle className="text-base">{dataset.name}</CardTitle>
                  </div>
                  <CardDescription>Score frequency distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScoreHistogram
                    data={dataset.values}
                    binSize={10}
                    height={300}
                    showNormalCurve={true}
                    colorScheme="performance"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          {trendData.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Confidence Trends Over Time</CardTitle>
                <CardDescription>
                  Quartile evolution showing p25, p50 (median), p75, and p95
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConfidenceTrend
                  data={trendData}
                  height={400}
                  showBands={true}
                  enableZoom={true}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Activity className="w-12 h-12 mb-4 opacity-50" />
                  <p>No trend data available</p>
                  <p className="text-sm">Trend data will appear as you collect more samples over time</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          {showComparison ? (
            <>
              {/* Side-by-side box plots */}
              <Card>
                <CardHeader>
                  <CardTitle>Comparative Analysis</CardTitle>
                  <CardDescription>Direct comparison of quartile distributions</CardDescription>
                </CardHeader>
                <CardContent>
                  <BoxPlot data={boxPlotData} height={350} showOutliers={true} />
                </CardContent>
              </Card>

              {/* Detailed comparison table */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistical Comparison</CardTitle>
                  <CardDescription>Detailed metrics across datasets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-4">Metric</th>
                          {datasetStats.map((dataset, index) => (
                            <th key={index} className="text-right py-2 px-4">
                              {dataset.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {['min', 'p25', 'p50', 'p75', 'p95', 'max', 'mean', 'stdDev'].map(
                          (metric) => (
                            <tr key={metric} className="border-b border-border">
                              <td className="py-2 px-4 font-medium capitalize">
                                {metric === 'p25'
                                  ? 'P25'
                                  : metric === 'p50'
                                  ? 'Median (P50)'
                                  : metric === 'p75'
                                  ? 'P75'
                                  : metric === 'p95'
                                  ? 'P95'
                                  : metric === 'stdDev'
                                  ? 'Std Dev'
                                  : metric.charAt(0).toUpperCase() + metric.slice(1)}
                              </td>
                              {datasetStats.map((dataset, index) => (
                                <td key={index} className="text-right py-2 px-4">
                                  {(dataset.stats as any)[metric].toFixed(2)}
                                </td>
                              ))}
                            </tr>
                          )
                        )}
                        <tr className="border-b border-border">
                          <td className="py-2 px-4 font-medium">Outliers</td>
                          {datasetStats.map((dataset, index) => (
                            <td key={index} className="text-right py-2 px-4">
                              {dataset.stats.outliers.length}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Settings className="w-12 h-12 mb-4 opacity-50" />
                  <p>Comparison requires multiple datasets</p>
                  <p className="text-sm">Add more datasets to enable comparison features</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
