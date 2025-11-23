# Confidence Visualization - Quick Start Guide

## 1-Minute Integration

### Step 1: Import
```typescript
import { ConfidenceVisualization } from '@/components/dashboard/ConfidenceVisualization';
```

### Step 2: Prepare Data
```typescript
const datasets = [
  {
    name: 'Baseline',
    values: [65, 70, 72, 75, 80, 82, 85],  // Your confidence scores
  },
  {
    name: 'Optimized',
    values: [75, 78, 82, 85, 88, 90, 92],
  },
];
```

### Step 3: Render
```typescript
<ConfidenceVisualization
  datasets={datasets}
  title="My Analysis"
  enableExport={true}
/>
```

That's it! You now have a full-featured confidence analysis dashboard.

---

## Component Quick Reference

### BoxPlot
```typescript
import { BoxPlot } from '@/components/dashboard/charts';

<BoxPlot
  data={[{ name: 'Dataset', values: [65, 70, 75, 80, 85] }]}
  height={300}
  showOutliers={true}
/>
```

### ScoreHistogram
```typescript
import { ScoreHistogram } from '@/components/dashboard/charts';

<ScoreHistogram
  data={[65, 70, 75, 80, 85]}
  binSize={10}
  showNormalCurve={true}
  colorScheme="performance"
/>
```

### ConfidenceTrend
```typescript
import { ConfidenceTrend } from '@/components/dashboard/charts';

<ConfidenceTrend
  data={[
    { timestamp: new Date(), p25: 60, p50: 70, p75: 80, p95: 90 }
  ]}
  enableZoom={true}
/>
```

### Statistical Functions
```typescript
import { calculateQuartiles, detectOutliers } from '@/lib/stats-utils';

const stats = calculateQuartiles([65, 70, 75, 80, 85]);
// Returns: { p25, p50, p75, p95, mean, stdDev, outliers }

const outliers = detectOutliers([65, 70, 75, 80, 150], 2);
// Returns: [150] (values >2σ from mean)
```

---

## Common Use Cases

### A/B Test Comparison
```typescript
<ConfidenceVisualization
  datasets={[
    { name: 'Control', values: controlScores },
    { name: 'Variant A', values: variantAScores },
  ]}
  title="A/B Test Results"
/>
```

### Performance Monitoring
```typescript
const trendData = dailyData.map(day => ({
  timestamp: day.date,
  p25: day.quartiles.p25,
  p50: day.quartiles.p50,
  p75: day.quartiles.p75,
  p95: day.quartiles.p95,
}));

<ConfidenceTrend data={trendData} />
```

### Score Distribution
```typescript
<ScoreHistogram
  data={allConfidenceScores}
  binSize={10}
  title="Overall Distribution"
/>
```

---

## Files Created

```
/home/user/agent-learning-dashboard/
├── src/
│   ├── lib/
│   │   └── stats-utils.ts                    # Statistical functions
│   └── components/
│       └── dashboard/
│           ├── charts/
│           │   ├── index.ts                  # Exports
│           │   ├── BoxPlot.tsx               # Box plot chart
│           │   ├── ScoreHistogram.tsx        # Histogram chart
│           │   └── ConfidenceTrend.tsx       # Trend chart
│           ├── ConfidenceChart.tsx           # Combined chart
│           ├── ConfidenceVisualization.tsx   # Full panel
│           └── ConfidenceVisualizationExample.tsx
├── CONFIDENCE_VISUALIZATION_GUIDE.md         # Full documentation
├── VISUALIZATION_DELIVERY_SUMMARY.md         # Delivery summary
├── VISUALIZATION_ARCHITECTURE.md             # Architecture diagrams
└── QUICK_START.md                            # This file
```

---

## Features at a Glance

- Box plots with quartiles (p25, p50, p75) and p95 whiskers
- Histograms with normal distribution overlay
- Time series trends with zoom/pan
- Outlier detection and highlighting (>2σ)
- Multiple dataset comparison
- Performance color coding (green/cyan/orange/red)
- Interactive tooltips
- Responsive design
- Dark mode support
- Export to CSV (PNG/SVG placeholders)
- Tab navigation (Overview, Distribution, Trends, Comparison)
- Statistical summary cards
- TypeScript type-safe

---

## Need Help?

1. See working examples: `src/components/dashboard/ConfidenceVisualizationExample.tsx`
2. Read full guide: `CONFIDENCE_VISUALIZATION_GUIDE.md`
3. Check architecture: `VISUALIZATION_ARCHITECTURE.md`
4. Review delivery: `VISUALIZATION_DELIVERY_SUMMARY.md`

---

## Performance Tips

- For large datasets (>10,000 points), increase bin size
- Use sampling for trend visualization
- Enable lazy loading for very large datasets
- Limit outlier display if performance is critical

---

## Customization

### Custom Colors
```typescript
datasets={[
  {
    name: 'Dataset',
    values: [...],
    color: 'hsl(142, 76%, 36%)'  // Custom color
  }
]}
```

### Custom Bin Size
```typescript
<ScoreHistogram data={scores} binSize={5} />  // Smaller bins
```

### Disable Features
```typescript
<ConfidenceChart
  datasets={datasets}
  showHistogram={false}  // Hide histogram
  showBoxPlot={true}     // Show only box plot
  showStats={true}       // Show stats
/>
```

---

## What's Next?

1. Copy example from `ConfidenceVisualizationExample.tsx`
2. Replace sample data with your real data
3. Customize colors and layout
4. Export your analysis as CSV
5. Share insights with your team

Happy visualizing!
