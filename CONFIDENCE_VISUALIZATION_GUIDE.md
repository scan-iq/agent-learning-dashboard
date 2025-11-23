# Confidence Visualization Components Guide

## Overview

This guide documents the comprehensive confidence score visualization system created for the IRIS dashboard. The system provides statistical analysis and interactive charts for analyzing confidence distributions, trends, and comparisons.

## Components Created

### 1. Statistical Utilities (`src/lib/stats-utils.ts`)

Core statistical functions for data analysis:

**Functions:**
- `calculateQuartiles(data)` - Calculates p25, p50, p75, p95, mean, stdDev, and outliers
- `detectOutliers(data, threshold)` - Z-score based outlier detection
- `detectOutliersIQR(data, multiplier)` - IQR method outlier detection
- `binData(data, binSize)` - Bins continuous data into histogram buckets
- `binDataCustom(data, ranges)` - Custom range binning
- `normalizeData(data)` - Normalizes data to 0-1 scale
- `normalPDF(x, mean, stdDev)` - Normal distribution probability density
- `generateNormalCurve(mean, stdDev, min, max, points)` - Generates normal curve data
- `movingAverage(data, windowSize)` - Calculates moving average
- `calculateConfidenceInterval(data, confidenceLevel)` - Confidence interval calculation

**Usage Example:**
```typescript
import { calculateQuartiles } from '@/lib/stats-utils';

const scores = [65, 72, 68, 70, 75, 80, 85];
const stats = calculateQuartiles(scores);

console.log(stats);
// {
//   p25: 68.5,
//   p50: 72,
//   p75: 80,
//   p95: 84.5,
//   mean: 73.57,
//   stdDev: 6.94,
//   outliers: []
// }
```

---

### 2. BoxPlot Component (`src/components/dashboard/charts/BoxPlot.tsx`)

Displays quartile distribution using recharts ComposedChart.

**Features:**
- Shows min, p25, median (p50), p75, max
- Highlights outliers with different colors
- Supports horizontal and vertical orientations
- Interactive tooltips with detailed statistics
- Multiple datasets comparison

**Props:**
```typescript
interface BoxPlotProps {
  data: BoxPlotData[];           // Array of datasets
  orientation?: 'horizontal' | 'vertical';  // Default: 'vertical'
  height?: number;                // Default: 300
  showOutliers?: boolean;         // Default: true
  outlierColor?: string;          // Default: red
}

interface BoxPlotData {
  name: string;
  values: number[];
  color?: string;
}
```

**Usage Example:**
```typescript
import { BoxPlot } from '@/components/dashboard/charts/BoxPlot';

<BoxPlot
  data={[
    { name: 'Baseline', values: [65, 70, 72, 75, 80] },
    { name: 'Optimized', values: [75, 80, 82, 85, 90] }
  ]}
  orientation="vertical"
  height={350}
  showOutliers={true}
/>
```

---

### 3. ScoreHistogram Component (`src/components/dashboard/charts/ScoreHistogram.tsx`)

Frequency distribution with normal curve overlay and performance color-coding.

**Features:**
- Bins scores into ranges (configurable bin size)
- Shows frequency distribution
- Overlays normal distribution curve
- Color-codes by performance (green/cyan/orange/red)
- Displays mean, median, std dev, and outlier count
- Interactive tooltips

**Props:**
```typescript
interface ScoreHistogramProps {
  data: number[];                 // Array of scores
  binSize?: number;               // Default: 10
  height?: number;                // Default: 300
  showNormalCurve?: boolean;      // Default: true
  colorScheme?: 'performance' | 'uniform';  // Default: 'performance'
  title?: string;
}
```

**Color Mapping (Performance Mode):**
- 80-100: Green (Good)
- 60-79: Cyan (OK)
- 40-59: Orange (Warning)
- 0-39: Red (Poor)

**Usage Example:**
```typescript
import { ScoreHistogram } from '@/components/dashboard/charts/ScoreHistogram';

<ScoreHistogram
  data={[65, 70, 72, 75, 80, 85, 90]}
  binSize={10}
  height={300}
  showNormalCurve={true}
  colorScheme="performance"
  title="Baseline Distribution"
/>
```

---

### 4. ConfidenceTrend Component (`src/components/dashboard/charts/ConfidenceTrend.tsx`)

Time series visualization showing confidence evolution over time.

**Features:**
- Line chart or area chart with confidence bands
- Multiple series (p25, p50, p75, p95, mean)
- Zoom and pan controls
- Brush for time range selection
- Interactive tooltips with timestamps
- Responsive date formatting

**Props:**
```typescript
interface ConfidenceTrendProps {
  data: ConfidenceTrendDataPoint[];
  height?: number;                // Default: 400
  showBands?: boolean;            // Default: true (area chart)
  showLines?: boolean;            // Default: true
  enableZoom?: boolean;           // Default: true
  dateFormat?: string;            // Default: 'MMM dd'
}

interface ConfidenceTrendDataPoint {
  timestamp: string | Date;
  p25?: number;
  p50?: number;
  p75?: number;
  p95?: number;
  mean?: number;
  values?: number[];
}
```

**Usage Example:**
```typescript
import { ConfidenceTrend } from '@/components/dashboard/charts/ConfidenceTrend';

const trendData = [
  {
    timestamp: new Date('2024-01-01'),
    p25: 60,
    p50: 70,
    p75: 80,
    p95: 90,
    mean: 72
  },
  // ... more data points
];

<ConfidenceTrend
  data={trendData}
  height={400}
  showBands={true}
  enableZoom={true}
  dateFormat="MMM dd"
/>
```

---

### 5. ConfidenceChart Component (`src/components/dashboard/ConfidenceChart.tsx`)

Main component combining box plot and histogram with statistical insights.

**Features:**
- Combines multiple visualizations
- Statistical summary cards
- Dataset comparison metrics
- Shows improvement percentages
- Outlier alerts
- Supports multiple datasets

**Props:**
```typescript
interface ConfidenceChartProps {
  datasets: ConfidenceDataset[];
  title?: string;
  description?: string;
  showHistogram?: boolean;        // Default: true
  showBoxPlot?: boolean;          // Default: true
  showStats?: boolean;            // Default: true
  height?: number;                // Default: 300
}

interface ConfidenceDataset {
  name: string;
  values: number[];
  color?: string;
}
```

**Usage Example:**
```typescript
import { ConfidenceChart } from '@/components/dashboard/ConfidenceChart';

<ConfidenceChart
  datasets={[
    { name: 'Baseline', values: baselineScores },
    { name: 'Optimized', values: optimizedScores }
  ]}
  title="Confidence Distribution"
  showHistogram={true}
  showBoxPlot={true}
  showStats={true}
/>
```

---

### 6. ConfidenceVisualization Component (`src/components/dashboard/ConfidenceVisualization.tsx`)

**Comprehensive dashboard panel** combining all visualizations with tabs, export, and comparison features.

**Features:**
- Tab interface (Overview, Distribution, Trends, Comparison)
- Export to PNG/SVG/CSV
- Responsive grid layout
- Dark mode support
- Statistical comparison tables
- Performance metrics
- Interactive data exploration

**Tabs:**
1. **Overview** - Summary cards, box plots, comparison metrics
2. **Distribution** - Side-by-side histograms for each dataset
3. **Trends** - Time series charts with zoom controls
4. **Comparison** - Detailed statistical comparison table

**Props:**
```typescript
interface ConfidenceVisualizationProps {
  datasets: ConfidenceDataset[];
  trendData?: ConfidenceTrendDataPoint[];
  title?: string;
  description?: string;
  enableExport?: boolean;         // Default: true
}
```

**Usage Example:**
```typescript
import { ConfidenceVisualization } from '@/components/dashboard/ConfidenceVisualization';

<ConfidenceVisualization
  datasets={[
    { name: 'Baseline', values: baselineScores, color: 'hsl(38, 92%, 50%)' },
    { name: 'Optimized', values: optimizedScores, color: 'hsl(142, 76%, 36%)' }
  ]}
  trendData={trendDataPoints}
  title="IRIS Optimization Results"
  description="Comparing baseline vs optimized configuration"
  enableExport={true}
/>
```

---

## File Structure

```
src/
├── lib/
│   └── stats-utils.ts                 # Statistical utility functions
├── components/
│   └── dashboard/
│       ├── charts/
│       │   ├── index.ts               # Chart exports
│       │   ├── BoxPlot.tsx            # Box plot component
│       │   ├── ScoreHistogram.tsx     # Histogram component
│       │   └── ConfidenceTrend.tsx    # Trend chart component
│       ├── ConfidenceChart.tsx        # Main chart component
│       ├── ConfidenceVisualization.tsx # Comprehensive panel
│       └── ConfidenceVisualizationExample.tsx  # Usage examples
```

---

## Integration Guide

### Step 1: Import Components

```typescript
import { ConfidenceVisualization } from '@/components/dashboard/ConfidenceVisualization';
// or individual components
import { BoxPlot, ScoreHistogram, ConfidenceTrend } from '@/components/dashboard/charts';
```

### Step 2: Prepare Your Data

```typescript
// Confidence scores from your optimization runs
const baselineScores = [65, 72, 68, 70, 75, 80, ...];
const optimizedScores = [78, 82, 80, 85, 88, 90, ...];

const datasets = [
  {
    name: 'Baseline',
    values: baselineScores,
    color: 'hsl(38, 92%, 50%)',  // Optional custom color
  },
  {
    name: 'Optimized',
    values: optimizedScores,
    color: 'hsl(142, 76%, 36%)',
  },
];
```

### Step 3: Add Trend Data (Optional)

```typescript
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
```

### Step 4: Use the Component

```typescript
<ConfidenceVisualization
  datasets={datasets}
  trendData={trendData}
  title="My Analysis"
  enableExport={true}
/>
```

---

## Styling and Theming

All components use HSL color variables from your theme:
- `--primary` - Primary brand color
- `--card` - Card background
- `--border` - Border color
- `--muted-foreground` - Secondary text

**Dark Mode:** Automatically supported through CSS variables.

**Custom Colors:** Pass custom colors in dataset objects:
```typescript
{ name: 'Dataset', values: [...], color: 'hsl(142, 76%, 36%)' }
```

**Responsive Breakpoints:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

---

## Performance Optimization

**Large Datasets (1000+ points):**
- Statistical calculations are optimized with single-pass algorithms
- Charts use recharts' built-in virtualization
- Tooltips are memoized to prevent re-renders

**Best Practices:**
1. Use binning for very large datasets (>10,000 points)
2. Enable lazy loading for trend data
3. Limit outlier display for performance
4. Use appropriate bin sizes (10-20 for most cases)

---

## Accessibility

**Color-Blind Friendly:**
- All charts use distinguishable color schemes
- Patterns and textures available as fallback
- High contrast ratios for text

**Keyboard Navigation:**
- Tab through interactive elements
- Arrow keys for zoom controls
- Enter/Space to activate buttons

**Screen Readers:**
- ARIA labels on all charts
- Descriptive tooltips
- Alternative text for visual elements

---

## Export Features

**Supported Formats:**
1. **PNG** - Raster image export
2. **SVG** - Vector graphics export
3. **CSV** - Raw data export

**Usage:**
Click the "Export" dropdown in the visualization header and select your format.

**CSV Format:**
```csv
Dataset,Value,Quartile
Baseline,60,Min
Baseline,68.5,P25
Baseline,72,Median
Baseline,80,P75
Baseline,84.5,P95
Baseline,90,Max
```

---

## Common Use Cases

### 1. A/B Testing Comparison
```typescript
<ConfidenceVisualization
  datasets={[
    { name: 'Control', values: controlScores },
    { name: 'Variant A', values: variantAScores },
    { name: 'Variant B', values: variantBScores }
  ]}
/>
```

### 2. Performance Monitoring Over Time
```typescript
<ConfidenceTrend
  data={dailyConfidenceData}
  height={400}
  showBands={true}
  enableZoom={true}
/>
```

### 3. Score Distribution Analysis
```typescript
<ScoreHistogram
  data={allScores}
  binSize={10}
  showNormalCurve={true}
  colorScheme="performance"
/>
```

### 4. Outlier Detection
```typescript
import { calculateQuartiles } from '@/lib/stats-utils';

const stats = calculateQuartiles(scores);
console.log(`Found ${stats.outliers.length} outliers`);
```

---

## Troubleshooting

**Issue: Charts not rendering**
- Ensure recharts is installed: `npm install recharts`
- Check that data is in correct format
- Verify parent container has defined height

**Issue: Colors not matching theme**
- Use HSL color variables: `hsl(var(--primary))`
- Check theme provider is wrapping component

**Issue: Performance lag with large datasets**
- Increase bin size for histograms
- Reduce trend data resolution
- Use sampling for visualization

**Issue: Export not working**
- Install html2canvas: `npm install html2canvas`
- Ensure browser supports Blob API
- Check CORS policies for images

---

## API Reference

### calculateQuartiles
```typescript
function calculateQuartiles(data: number[]): QuartilesResult
```

### BoxPlot
```typescript
function BoxPlot(props: BoxPlotProps): JSX.Element
```

### ScoreHistogram
```typescript
function ScoreHistogram(props: ScoreHistogramProps): JSX.Element
```

### ConfidenceTrend
```typescript
function ConfidenceTrend(props: ConfidenceTrendProps): JSX.Element
```

### ConfidenceChart
```typescript
function ConfidenceChart(props: ConfidenceChartProps): JSX.Element
```

### ConfidenceVisualization
```typescript
function ConfidenceVisualization(props: ConfidenceVisualizationProps): JSX.Element
```

---

## Examples

See `src/components/dashboard/ConfidenceVisualizationExample.tsx` for comprehensive usage examples including:
- Sample data generation
- Full dashboard implementation
- Individual component usage
- Integration patterns

---

## Dependencies

- **recharts** (^2.15.4) - Charting library
- **date-fns** (^3.6.0) - Date formatting
- **lucide-react** (^0.462.0) - Icons
- **@radix-ui/react-tabs** - Tab interface
- **shadcn/ui components** - UI primitives

---

## Future Enhancements

Potential improvements:
1. Real-time streaming data support
2. Advanced statistical tests (t-test, ANOVA)
3. Machine learning anomaly detection
4. Custom theme builder
5. 3D visualization options
6. Advanced filtering and grouping
7. Collaborative annotations
8. PDF report generation

---

## License

Part of the IRIS Dashboard project.

## Support

For issues or questions, please refer to the main project documentation or create an issue in the project repository.
