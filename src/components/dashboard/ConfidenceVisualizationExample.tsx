/**
 * ConfidenceVisualizationExample Component
 * Demonstrates usage of confidence visualization components with sample data
 * This file can be used as a reference for integration
 */

import { ConfidenceVisualization } from './ConfidenceVisualization';
import { ConfidenceChart } from './ConfidenceChart';
import { ConfidenceTrend } from './charts/ConfidenceTrend';
import { ScoreHistogram } from './charts/ScoreHistogram';
import { BoxPlot } from './charts/BoxPlot';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Generate sample confidence scores with normal distribution
 */
function generateSampleScores(
  count: number,
  mean: number,
  stdDev: number,
  min: number = 0,
  max: number = 100
): number[] {
  const scores: number[] = [];

  for (let i = 0; i < count; i++) {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

    let score = mean + z0 * stdDev;

    // Clamp to min/max range
    score = Math.max(min, Math.min(max, score));

    scores.push(score);
  }

  return scores;
}

/**
 * Generate sample trend data over time
 */
function generateTrendData(days: number) {
  const trendData = [];
  const now = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - i));

    // Simulate improvement over time
    const baseConfidence = 60 + (i / days) * 20;
    const noise = Math.random() * 5;

    const values = generateSampleScores(50, baseConfidence + noise, 8);
    const sorted = [...values].sort((a, b) => a - b);

    trendData.push({
      timestamp: date,
      p25: sorted[Math.floor(values.length * 0.25)],
      p50: sorted[Math.floor(values.length * 0.5)],
      p75: sorted[Math.floor(values.length * 0.75)],
      p95: sorted[Math.floor(values.length * 0.95)],
      mean: values.reduce((sum, v) => sum + v, 0) / values.length,
    });
  }

  return trendData;
}

export function ConfidenceVisualizationExample() {
  // Sample data: baseline vs optimized
  const baselineScores = generateSampleScores(200, 65, 12);
  const optimizedScores = generateSampleScores(200, 78, 8);

  const datasets = [
    {
      name: 'Baseline',
      values: baselineScores,
      color: 'hsl(38, 92%, 50%)', // Orange
    },
    {
      name: 'Optimized',
      values: optimizedScores,
      color: 'hsl(142, 76%, 36%)', // Green
    },
  ];

  // Generate trend data
  const trendData = generateTrendData(30);

  return (
    <div className="space-y-8 p-6">
      {/* Full Comprehensive Dashboard */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Comprehensive Visualization Panel</h2>
        <ConfidenceVisualization
          datasets={datasets}
          trendData={trendData}
          title="IRIS Optimization Results"
          description="Comparing baseline vs optimized configuration performance"
          enableExport={true}
        />
      </section>

      {/* Individual Chart Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold mb-4">Individual Component Examples</h2>

        {/* ConfidenceChart (Combined Box Plot + Histogram) */}
        <div>
          <h3 className="text-xl font-semibold mb-3">ConfidenceChart Component</h3>
          <ConfidenceChart
            datasets={datasets}
            title="Confidence Distribution Analysis"
            description="Quartile and frequency distribution"
            showHistogram={true}
            showBoxPlot={true}
            showStats={true}
          />
        </div>

        {/* Box Plot Only */}
        <div>
          <h3 className="text-xl font-semibold mb-3">BoxPlot Component</h3>
          <Card>
            <CardHeader>
              <CardTitle>Quartile Box Plot</CardTitle>
              <CardDescription>
                Standalone box plot showing p25, median, p75, and outliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BoxPlot
                data={datasets.map((d) => ({
                  name: d.name,
                  values: d.values,
                  color: d.color,
                }))}
                orientation="vertical"
                height={300}
                showOutliers={true}
              />
            </CardContent>
          </Card>
        </div>

        {/* Histogram Only */}
        <div>
          <h3 className="text-xl font-semibold mb-3">ScoreHistogram Component</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {datasets.map((dataset, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{dataset.name} Distribution</CardTitle>
                  <CardDescription>Frequency histogram with normal curve</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScoreHistogram
                    data={dataset.values}
                    binSize={10}
                    height={300}
                    showNormalCurve={true}
                    colorScheme="performance"
                    title={`${dataset.name} Score Distribution`}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Trend Chart Only */}
        <div>
          <h3 className="text-xl font-semibold mb-3">ConfidenceTrend Component</h3>
          <Card>
            <CardHeader>
              <CardTitle>Confidence Trends Over Time</CardTitle>
              <CardDescription>
                30-day trend showing quartile evolution with zoom controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConfidenceTrend
                data={trendData}
                height={400}
                showBands={true}
                showLines={true}
                enableZoom={true}
                dateFormat="MMM dd"
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Usage Example Code */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Usage Example</CardTitle>
            <CardDescription>How to integrate these components in your code</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
              <code>{`import { ConfidenceVisualization } from '@/components/dashboard/ConfidenceVisualization';

// Prepare your data
const datasets = [
  {
    name: 'Baseline',
    values: [65, 72, 68, 70, 75, ...], // Your confidence scores
    color: 'hsl(38, 92%, 50%)',
  },
  {
    name: 'Optimized',
    values: [78, 82, 80, 85, 88, ...],
    color: 'hsl(142, 76%, 36%)',
  },
];

const trendData = [
  {
    timestamp: new Date('2024-01-01'),
    p25: 60,
    p50: 70,
    p75: 80,
    p95: 90,
    mean: 72,
  },
  // ... more data points
];

// Use the component
<ConfidenceVisualization
  datasets={datasets}
  trendData={trendData}
  title="My Analysis"
  enableExport={true}
/>`}</code>
            </pre>
          </CardContent>
        </Card>
      </section>

      {/* Features Summary */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Features Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Statistical Analysis</h4>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  <li>Quartile calculations (p25, p50, p75, p95)</li>
                  <li>Mean and standard deviation</li>
                  <li>Outlier detection (z-score method)</li>
                  <li>Normal distribution overlay</li>
                  <li>Confidence intervals</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Visualizations</h4>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  <li>Box plots with whiskers and outliers</li>
                  <li>Histograms with performance color-coding</li>
                  <li>Time series trend charts</li>
                  <li>Comparative analysis views</li>
                  <li>Interactive tooltips</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Interactive Features</h4>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  <li>Zoom and pan controls</li>
                  <li>Tab-based navigation</li>
                  <li>Export to PNG/SVG/CSV</li>
                  <li>Responsive grid layouts</li>
                  <li>Dark mode support</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Performance</h4>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  <li>Optimized for 1000+ data points</li>
                  <li>Efficient statistical calculations</li>
                  <li>Memoized chart rendering</li>
                  <li>Lazy loading for large datasets</li>
                  <li>Accessible color schemes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
