export interface OptimizationRun {
  id: string;
  timestamp: string;
  project: string;
  expert_role: string;
  baseline_score: number;
  optimized_score: number;
  improvement_pct: number;
  cost_usd: number;
  duration_ms: number;
  confidence_scores: {
    p25: number;
    p50: number;
    p75: number;
    p95: number;
  };
  examples_count: number;
  optimizer_type: 'dspy' | 'manual' | 'auto';
  metadata?: Record<string, any>;
}

export interface OptimizationFilters {
  expert_type?: string;
  date_from?: string;
  date_to?: string;
  min_improvement?: number;
  optimizer_type?: string;
}

export interface OptimizationMetrics {
  total_optimizations: number;
  avg_improvement: number;
  total_cost: number;
  avg_duration_ms: number;
  best_improvement: number;
  optimizer_distribution: {
    dspy: number;
    manual: number;
    auto: number;
  };
}

export interface OptimizationTrend {
  timestamp: string;
  improvement: number;
  cost: number;
  count: number;
}

export type SortField = 'timestamp' | 'improvement_pct' | 'cost_usd' | 'duration_ms';
export type SortOrder = 'asc' | 'desc';
