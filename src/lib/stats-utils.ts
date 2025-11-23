/**
 * Statistical Utilities for Confidence Score Analysis
 * Provides quartile calculations, outlier detection, and data binning
 */

export interface QuartilesResult {
  p25: number;
  p50: number;
  p75: number;
  p95: number;
  min: number;
  max: number;
  mean: number;
  stdDev: number;
  outliers: number[];
}

export interface BinResult {
  range: string;
  min: number;
  max: number;
  count: number;
  percentage: number;
}

/**
 * Calculates quartiles and statistical measures for a dataset
 * @param data Array of numerical values
 * @returns Object containing p25, p50, p75, p95, mean, stdDev, and outliers
 */
export function calculateQuartiles(data: number[]): QuartilesResult {
  if (!data || data.length === 0) {
    return {
      p25: 0,
      p50: 0,
      p75: 0,
      p95: 0,
      min: 0,
      max: 0,
      mean: 0,
      stdDev: 0,
      outliers: [],
    };
  }

  // Sort data for percentile calculations
  const sorted = [...data].sort((a, b) => a - b);
  const n = sorted.length;

  // Calculate percentiles
  const percentile = (p: number) => {
    const index = (p / 100) * (n - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    if (lower === upper) {
      return sorted[lower];
    }

    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  };

  const p25 = percentile(25);
  const p50 = percentile(50);
  const p75 = percentile(75);
  const p95 = percentile(95);
  const min = sorted[0];
  const max = sorted[n - 1];

  // Calculate mean
  const mean = data.reduce((sum, val) => sum + val, 0) / n;

  // Calculate standard deviation
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  // Detect outliers using IQR method and z-score method
  const outliers = detectOutliers(data, 2);

  return {
    p25,
    p50,
    p75,
    p95,
    min,
    max,
    mean,
    stdDev,
    outliers,
  };
}

/**
 * Detects outliers using z-score method
 * @param data Array of numerical values
 * @param threshold Number of standard deviations (default 2)
 * @returns Array of outlier values
 */
export function detectOutliers(data: number[], threshold: number = 2): number[] {
  if (!data || data.length === 0) {
    return [];
  }

  const n = data.length;
  const mean = data.reduce((sum, val) => sum + val, 0) / n;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) {
    return [];
  }

  const outliers: number[] = [];
  data.forEach((value) => {
    const zScore = Math.abs((value - mean) / stdDev);
    if (zScore > threshold) {
      outliers.push(value);
    }
  });

  return outliers;
}

/**
 * Detects outliers using IQR (Interquartile Range) method
 * @param data Array of numerical values
 * @param multiplier IQR multiplier (default 1.5)
 * @returns Array of outlier values
 */
export function detectOutliersIQR(data: number[], multiplier: number = 1.5): number[] {
  if (!data || data.length === 0) {
    return [];
  }

  const sorted = [...data].sort((a, b) => a - b);
  const n = sorted.length;

  const q1Index = Math.floor(n * 0.25);
  const q3Index = Math.floor(n * 0.75);

  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;

  const lowerBound = q1 - multiplier * iqr;
  const upperBound = q3 + multiplier * iqr;

  return data.filter((value) => value < lowerBound || value > upperBound);
}

/**
 * Bins continuous data into histogram buckets
 * @param data Array of numerical values
 * @param binSize Size of each bin (e.g., 10 for 0-10, 10-20, etc.)
 * @returns Array of bin objects with range, count, and percentage
 */
export function binData(data: number[], binSize: number = 10): BinResult[] {
  if (!data || data.length === 0) {
    return [];
  }

  const min = Math.min(...data);
  const max = Math.max(...data);

  // Calculate number of bins
  const numBins = Math.ceil((max - min) / binSize);

  // Initialize bins
  const bins: Map<number, { min: number; max: number; count: number }> = new Map();

  for (let i = 0; i < numBins; i++) {
    const binMin = min + i * binSize;
    const binMax = binMin + binSize;
    bins.set(i, { min: binMin, max: binMax, count: 0 });
  }

  // Distribute data into bins
  data.forEach((value) => {
    const binIndex = Math.min(Math.floor((value - min) / binSize), numBins - 1);
    const bin = bins.get(binIndex);
    if (bin) {
      bin.count++;
    }
  });

  // Convert to result format
  const total = data.length;
  return Array.from(bins.values()).map((bin) => ({
    range: `${bin.min.toFixed(0)}-${bin.max.toFixed(0)}`,
    min: bin.min,
    max: bin.max,
    count: bin.count,
    percentage: (bin.count / total) * 100,
  }));
}

/**
 * Bins data with custom ranges
 * @param data Array of numerical values
 * @param ranges Array of range boundaries (e.g., [0, 10, 20, 30, 40, 50])
 * @returns Array of bin objects
 */
export function binDataCustom(data: number[], ranges: number[]): BinResult[] {
  if (!data || data.length === 0 || ranges.length < 2) {
    return [];
  }

  const bins: BinResult[] = [];
  const total = data.length;

  for (let i = 0; i < ranges.length - 1; i++) {
    const min = ranges[i];
    const max = ranges[i + 1];
    const count = data.filter((value) => value >= min && value < max).length;

    bins.push({
      range: `${min.toFixed(0)}-${max.toFixed(0)}`,
      min,
      max,
      count,
      percentage: (count / total) * 100,
    });
  }

  // Handle values at or above the last range
  const lastMin = ranges[ranges.length - 1];
  const lastCount = data.filter((value) => value >= lastMin).length;

  if (lastCount > 0) {
    bins.push({
      range: `${lastMin.toFixed(0)}+`,
      min: lastMin,
      max: Math.max(...data),
      count: lastCount,
      percentage: (lastCount / total) * 100,
    });
  }

  return bins;
}

/**
 * Normalizes data to a 0-1 scale
 * @param data Array of numerical values
 * @returns Normalized data array
 */
export function normalizeData(data: number[]): number[] {
  if (!data || data.length === 0) {
    return [];
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;

  if (range === 0) {
    return data.map(() => 0.5);
  }

  return data.map((value) => (value - min) / range);
}

/**
 * Calculates normal distribution probability density
 * @param x Value to calculate PDF for
 * @param mean Mean of the distribution
 * @param stdDev Standard deviation of the distribution
 * @returns PDF value
 */
export function normalPDF(x: number, mean: number, stdDev: number): number {
  if (stdDev === 0) {
    return 0;
  }

  const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
  return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
}

/**
 * Generates normal distribution curve data points
 * @param mean Mean of the distribution
 * @param stdDev Standard deviation
 * @param min Minimum x value
 * @param max Maximum x value
 * @param points Number of points to generate
 * @returns Array of {x, y} points
 */
export function generateNormalCurve(
  mean: number,
  stdDev: number,
  min: number,
  max: number,
  points: number = 100
): Array<{ x: number; y: number }> {
  const step = (max - min) / (points - 1);
  const curve: Array<{ x: number; y: number }> = [];

  for (let i = 0; i < points; i++) {
    const x = min + i * step;
    const y = normalPDF(x, mean, stdDev);
    curve.push({ x, y });
  }

  return curve;
}

/**
 * Calculates moving average for time series data
 * @param data Array of numerical values
 * @param windowSize Size of the moving window
 * @returns Array of moving averages
 */
export function movingAverage(data: number[], windowSize: number): number[] {
  if (!data || data.length === 0 || windowSize <= 0) {
    return [];
  }

  const result: number[] = [];

  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(data.length, i + Math.ceil(windowSize / 2));
    const window = data.slice(start, end);
    const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
    result.push(avg);
  }

  return result;
}

/**
 * Calculates confidence interval for a dataset
 * @param data Array of numerical values
 * @param confidenceLevel Confidence level (e.g., 0.95 for 95%)
 * @returns Object with lower and upper bounds
 */
export function calculateConfidenceInterval(
  data: number[],
  confidenceLevel: number = 0.95
): { lower: number; upper: number; margin: number } {
  if (!data || data.length === 0) {
    return { lower: 0, upper: 0, margin: 0 };
  }

  const n = data.length;
  const mean = data.reduce((sum, val) => sum + val, 0) / n;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  // Using z-score for large samples (n > 30)
  // For 95% confidence: z = 1.96
  // For 99% confidence: z = 2.576
  const zScore = confidenceLevel === 0.99 ? 2.576 : 1.96;

  const standardError = stdDev / Math.sqrt(n);
  const margin = zScore * standardError;

  return {
    lower: mean - margin,
    upper: mean + margin,
    margin,
  };
}
