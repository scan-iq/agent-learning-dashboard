/**
 * ConfidenceChart Component
 * Main component for visualizing confidence score distributions
 * Combines box plot, histogram, and statistical insights
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BoxPlot, BoxPlotData } from './charts/BoxPlot';
import { ScoreHistogram } from './charts/ScoreHistogram';
import { calculateQuartiles } from '@/lib/stats-utils';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

export interface ConfidenceDataset {
  name: string;
  values: number[];
  color?: string;
}

export interface ConfidenceChartProps {
  datasets: ConfidenceDataset[];
  title?: string;
  description?: string;
  showHistogram?: boolean;
  showBoxPlot?: boolean;
  showStats?: boolean;
  height?: number;
}

export function ConfidenceChart({
  datasets,
  title = 'Confidence Distribution',
  description = 'Statistical analysis of confidence scores',
  showHistogram = true,
  showBoxPlot = true,
  showStats = true,
  height = 300,
}: ConfidenceChartProps) {
  if (!datasets || datasets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate statistics for each dataset
  const datasetStats = datasets.map((dataset) => ({
    name: dataset.name,
    stats: calculateQuartiles(dataset.values),
    color: dataset.color,
  }));

  // Prepare data for box plot
  const boxPlotData: BoxPlotData[] = datasets.map((dataset) => ({
    name: dataset.name,
    values: dataset.values,
    color: dataset.color,
  }));

  // For histogram, combine all datasets or show the first one
  const primaryDataset = datasets[0];

  // Calculate comparison metrics if there are multiple datasets
  const showComparison = datasets.length > 1;
  let comparisonMetrics: {
    improvement: number;
    direction: 'up' | 'down';
    significant: boolean;
  } | null = null;

  if (showComparison) {
    const baseline = datasetStats[0].stats;
    const optimized = datasetStats[1].stats;
    const improvement = ((optimized.p50 - baseline.p50) / baseline.p50) * 100;
    const direction = improvement > 0 ? 'up' : 'down';
    // Consider significant if improvement > 5%
    const significant = Math.abs(improvement) > 5;

    comparisonMetrics = {
      improvement: Math.abs(improvement),
      direction,
      significant,
    };
  }

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            {comparisonMetrics && (
              <Badge
                variant={
                  comparisonMetrics.significant
                    ? comparisonMetrics.direction === 'up'
                      ? 'default'
                      : 'destructive'
                    : 'secondary'
                }
                className="flex items-center gap-1"
              >
                {comparisonMetrics.direction === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {comparisonMetrics.improvement.toFixed(1)}%
              </Badge>
            )}
          </div>
        </CardHeader>

        {showStats && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {datasetStats.map((dataset, index) => (
                <div
                  key={index}
                  className="space-y-2 p-3 border border-border rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{dataset.name}</span>
                    {dataset.stats.outliers.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {dataset.stats.outliers.length} outliers
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Median</p>
                      <p className="font-semibold">{dataset.stats.p50.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Mean</p>
                      <p className="font-semibold">{dataset.stats.mean.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">P25</p>
                      <p className="font-semibold">{dataset.stats.p25.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">P75</p>
                      <p className="font-semibold">{dataset.stats.p75.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Std Dev</p>
                      <p className="font-semibold">{dataset.stats.stdDev.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">P95</p>
                      <p className="font-semibold">{dataset.stats.p95.toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Box Plot */}
      {showBoxPlot && (
        <Card>
          <CardHeader>
            <CardTitle>Quartile Distribution</CardTitle>
            <CardDescription>
              Box plot showing p25, median (p50), p75, and outliers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BoxPlot data={boxPlotData} height={height} showOutliers={true} />
          </CardContent>
        </Card>
      )}

      {/* Histogram */}
      {showHistogram && (
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>
              Frequency distribution with normal curve overlay
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScoreHistogram
              data={primaryDataset.values}
              binSize={10}
              height={height}
              showNormalCurve={true}
              colorScheme="performance"
            />
          </CardContent>
        </Card>
      )}

      {/* Multiple dataset comparison histograms */}
      {showComparison && showHistogram && datasets.length > 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {datasets.map((dataset, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-base">{dataset.name}</CardTitle>
                <CardDescription>Distribution details</CardDescription>
              </CardHeader>
              <CardContent>
                <ScoreHistogram
                  data={dataset.values}
                  binSize={10}
                  height={250}
                  showNormalCurve={true}
                  colorScheme="performance"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
