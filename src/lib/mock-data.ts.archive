import { Project, OverviewMetrics, IrisEvent, ProjectDetails } from '@/types/iris';
import { DiagnosticData } from '@/types/diagnostics';

export const mockOverviewMetrics: OverviewMetrics = {
  total_projects: 3,
  healthy_projects: 2,
  warning_projects: 1,
  critical_projects: 0,
  total_runs_today: 847,
  avg_success_rate: 94.2,
  active_experts: 24,
  total_reflexions: 156,
};

export const mockProjects: Project[] = [
  {
    id: 'nfl-predictor',
    name: 'NFL Predictor',
    status: 'healthy',
    health_score: 96,
    last_run: '2 minutes ago',
    total_runs: 1247,
    success_rate: 96.8,
    active_experts: 8,
    reflexions_count: 45,
    avg_latency: 342,
  },
  {
    id: 'microbiome',
    name: 'OneMe Microbiome',
    status: 'warning',
    health_score: 78,
    last_run: '15 minutes ago',
    total_runs: 892,
    success_rate: 88.4,
    active_experts: 6,
    reflexions_count: 67,
    avg_latency: 521,
  },
  {
    id: 'beclever',
    name: 'BeClever',
    status: 'healthy',
    health_score: 94,
    last_run: '5 minutes ago',
    total_runs: 2103,
    success_rate: 97.2,
    active_experts: 10,
    reflexions_count: 44,
    avg_latency: 298,
  },
];

export const mockEvents: IrisEvent[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    project: 'nfl-predictor',
    event_type: 'evaluation',
    severity: 'info',
    message: 'Project evaluation completed successfully',
    metadata: { health_score: 96 },
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    project: 'microbiome',
    event_type: 'reflexion',
    severity: 'warning',
    message: 'Pattern divergence detected in expert consensus',
    metadata: { confidence: 0.72 },
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 480000).toISOString(),
    project: 'beclever',
    event_type: 'retrain',
    severity: 'info',
    message: 'Expert retraining initiated for 3 underperforming signatures',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 720000).toISOString(),
    project: 'nfl-predictor',
    event_type: 'consensus',
    severity: 'info',
    message: 'New consensus pattern learned and stored',
    metadata: { pattern_id: 'cons_847' },
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    project: 'microbiome',
    event_type: 'rotation',
    severity: 'info',
    message: 'Expert rotation report generated',
  },
];

// Historical data for analytics charts
export const mockHealthTrends = [
  { time: '00:00', 'nfl-predictor': 94, 'microbiome': 82, 'beclever': 92 },
  { time: '04:00', 'nfl-predictor': 95, 'microbiome': 79, 'beclever': 93 },
  { time: '08:00', 'nfl-predictor': 93, 'microbiome': 78, 'beclever': 91 },
  { time: '12:00', 'nfl-predictor': 96, 'microbiome': 80, 'beclever': 94 },
  { time: '16:00', 'nfl-predictor': 97, 'microbiome': 77, 'beclever': 95 },
  { time: '20:00', 'nfl-predictor': 96, 'microbiome': 78, 'beclever': 94 },
];

export const mockSuccessRates = [
  { time: '00:00', 'nfl-predictor': 95.2, 'microbiome': 86.8, 'beclever': 96.1 },
  { time: '04:00', 'nfl-predictor': 96.1, 'microbiome': 85.4, 'beclever': 96.8 },
  { time: '08:00', 'nfl-predictor': 95.8, 'microbiome': 87.2, 'beclever': 96.5 },
  { time: '12:00', 'nfl-predictor': 96.8, 'microbiome': 88.9, 'beclever': 97.2 },
  { time: '16:00', 'nfl-predictor': 97.2, 'microbiome': 87.6, 'beclever': 97.5 },
  { time: '20:00', 'nfl-predictor': 96.8, 'microbiome': 88.4, 'beclever': 97.2 },
];

export const mockExpertPerformance = [
  { name: 'StatisticalAnalyzer', accuracy: 98.2, calls: 234, latency: 320 },
  { name: 'TrendDetector', accuracy: 95.7, calls: 189, latency: 380 },
  { name: 'PlayerMetrics', accuracy: 97.1, calls: 201, latency: 295 },
  { name: 'BiomeClassifier', accuracy: 82.4, calls: 156, latency: 520 },
  { name: 'TaxonomyMapper', accuracy: 91.3, calls: 142, latency: 445 },
  { name: 'ContentAnalyzer', accuracy: 97.8, calls: 312, latency: 285 },
  { name: 'EngagementPredictor', accuracy: 96.4, calls: 289, latency: 310 },
];

export const mockLatencyTrends = [
  { time: '00:00', 'nfl-predictor': 350, 'microbiome': 530, 'beclever': 305 },
  { time: '04:00', 'nfl-predictor': 340, 'microbiome': 520, 'beclever': 295 },
  { time: '08:00', 'nfl-predictor': 345, 'microbiome': 540, 'beclever': 300 },
  { time: '12:00', 'nfl-predictor': 338, 'microbiome': 515, 'beclever': 292 },
  { time: '16:00', 'nfl-predictor': 342, 'microbiome': 521, 'beclever': 298 },
  { time: '20:00', 'nfl-predictor': 342, 'microbiome': 521, 'beclever': 298 },
];

export const mockReflexionImpact = [
  { category: 'Pattern Recognition', count: 45, avg_impact: 0.87 },
  { category: 'Decision Optimization', count: 38, avg_impact: 0.92 },
  { category: 'Error Correction', count: 29, avg_impact: 0.78 },
  { category: 'Context Learning', count: 44, avg_impact: 0.85 },
];

// Anomaly detection data
export interface Anomaly {
  id: string;
  timestamp: string;
  project: string;
  type: 'health_drop' | 'latency_spike' | 'success_drop' | 'expert_failure';
  severity: 'critical' | 'warning' | 'info';
  metric: string;
  value: number;
  expected: number;
  deviation: number;
  description: string;
  resolved: boolean;
}

export const mockAnomalies: Anomaly[] = [
  {
    id: 'anom_1',
    timestamp: new Date(Date.now() - 900000).toISOString(), // 15 min ago
    project: 'microbiome',
    type: 'health_drop',
    severity: 'warning',
    metric: 'Health Score',
    value: 77,
    expected: 85,
    deviation: -9.4,
    description: 'Health score dropped below expected threshold',
    resolved: false,
  },
  {
    id: 'anom_2',
    timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
    project: 'microbiome',
    type: 'latency_spike',
    severity: 'warning',
    metric: 'Avg Latency',
    value: 540,
    expected: 420,
    deviation: 28.6,
    description: 'Latency increased significantly above baseline',
    resolved: false,
  },
  {
    id: 'anom_3',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    project: 'microbiome',
    type: 'expert_failure',
    severity: 'critical',
    metric: 'BiomeClassifier Accuracy',
    value: 82.4,
    expected: 91.0,
    deviation: -9.5,
    description: 'Expert accuracy dropped below acceptable threshold',
    resolved: false,
  },
  {
    id: 'anom_4',
    timestamp: new Date(Date.now() - 5400000).toISOString(), // 90 min ago
    project: 'nfl-predictor',
    type: 'latency_spike',
    severity: 'info',
    metric: 'Avg Latency',
    value: 380,
    expected: 340,
    deviation: 11.8,
    description: 'Minor latency increase detected',
    resolved: true,
  },
];

// Add anomaly markers to chart data
export const mockHealthTrendsWithAnomalies = [
  { time: '00:00', 'nfl-predictor': 94, 'microbiome': 82, 'beclever': 92 },
  { time: '04:00', 'nfl-predictor': 95, 'microbiome': 79, 'beclever': 93 },
  { time: '08:00', 'nfl-predictor': 93, 'microbiome': 78, 'beclever': 91, anomaly: true },
  { time: '12:00', 'nfl-predictor': 96, 'microbiome': 80, 'beclever': 94 },
  { time: '16:00', 'nfl-predictor': 97, 'microbiome': 77, 'beclever': 95, anomaly: true },
  { time: '20:00', 'nfl-predictor': 96, 'microbiome': 78, 'beclever': 94 },
];

export const mockLatencyTrendsWithAnomalies = [
  { time: '00:00', 'nfl-predictor': 350, 'microbiome': 530, 'beclever': 305 },
  { time: '04:00', 'nfl-predictor': 340, 'microbiome': 520, 'beclever': 295 },
  { time: '08:00', 'nfl-predictor': 345, 'microbiome': 540, 'beclever': 300, anomaly: true },
  { time: '12:00', 'nfl-predictor': 338, 'microbiome': 515, 'beclever': 292 },
  { time: '16:00', 'nfl-predictor': 342, 'microbiome': 521, 'beclever': 298 },
  { time: '20:00', 'nfl-predictor': 342, 'microbiome': 521, 'beclever': 298 },
];

// Diagnostic data for anomaly investigation
export const mockDiagnosticData: Record<string, DiagnosticData> = {
  'anom_1': {
    anomaly_id: 'anom_1',
    summary: {
      root_cause: 'BiomeClassifier expert experiencing degraded performance due to increased input complexity',
      impact: 'Health score reduction affecting overall project reliability and user experience',
      affected_components: ['BiomeClassifier', 'TaxonomyMapper', 'Consensus Engine'],
    },
    logs: [
      {
        id: 'log_1',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        level: 'error',
        source: 'BiomeClassifier',
        message: 'Classification timeout after 5000ms',
        context: { input_size: '1.2MB', complexity_score: 0.87 },
      },
      {
        id: 'log_2',
        timestamp: new Date(Date.now() - 870000).toISOString(),
        level: 'warning',
        source: 'Consensus Engine',
        message: 'Low confidence threshold reached: 0.72',
        context: { participating_experts: 4, expected: 6 },
      },
      {
        id: 'log_3',
        timestamp: new Date(Date.now() - 850000).toISOString(),
        level: 'error',
        source: 'TaxonomyMapper',
        message: 'Failed to retrieve taxonomy data from cache',
      },
    ],
    expert_traces: [
      {
        id: 'trace_1',
        expert_name: 'BiomeClassifier',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        input: 'Sample ID: MB_2847, Features: [diversity_index: 0.87, abundance: {...}]',
        output: 'Classification failed',
        confidence: 0.0,
        latency: 5200,
        success: false,
        error_message: 'Timeout exceeded',
      },
      {
        id: 'trace_2',
        expert_name: 'BiomeClassifier',
        timestamp: new Date(Date.now() - 880000).toISOString(),
        input: 'Sample ID: MB_2848, Features: [diversity_index: 0.65, abundance: {...}]',
        output: 'Partial classification: confidence below threshold',
        confidence: 0.68,
        latency: 4800,
        success: false,
        error_message: 'Low confidence',
      },
      {
        id: 'trace_3',
        expert_name: 'TaxonomyMapper',
        timestamp: new Date(Date.now() - 860000).toISOString(),
        input: 'Taxonomy lookup: phylum_level',
        output: 'Cache miss, fallback to database',
        confidence: 0.82,
        latency: 780,
        success: true,
      },
    ],
    remediation_actions: [
      {
        id: 'action_1',
        priority: 'high',
        title: 'Retrain BiomeClassifier Expert',
        description: 'Update expert with recent high-complexity samples to improve classification accuracy',
        automated: true,
        estimated_time: '15-20 minutes',
        steps: [
          'Collect recent failed classification samples',
          'Augment training dataset with edge cases',
          'Run incremental training cycle',
          'Validate improved performance on test set',
          'Deploy updated expert signature',
        ],
      },
      {
        id: 'action_2',
        priority: 'high',
        title: 'Optimize Input Processing Pipeline',
        description: 'Reduce input complexity through feature engineering and preprocessing',
        automated: false,
        estimated_time: '30-45 minutes',
        steps: [
          'Analyze input feature distributions',
          'Implement dimensionality reduction',
          'Add input validation and filtering',
          'Test with historical problematic samples',
        ],
      },
      {
        id: 'action_3',
        priority: 'medium',
        title: 'Restore Taxonomy Cache',
        description: 'Rebuild taxonomy mapping cache to reduce lookup latency',
        automated: true,
        estimated_time: '5 minutes',
        steps: [
          'Clear corrupted cache entries',
          'Warm up cache with frequently accessed taxonomies',
          'Verify cache hit rate improvement',
        ],
      },
      {
        id: 'action_4',
        priority: 'low',
        title: 'Increase Timeout Thresholds',
        description: 'Temporarily increase timeout limits while addressing root cause',
        automated: true,
        estimated_time: '2 minutes',
        steps: [
          'Update BiomeClassifier timeout to 7500ms',
          'Monitor for impact on overall latency',
          'Revert after expert retraining completes',
        ],
      },
    ],
    system_metrics: {
      cpu_usage: 78,
      memory_usage: 82,
      active_connections: 47,
      queue_depth: 23,
    },
  },
  'anom_2': {
    anomaly_id: 'anom_2',
    summary: {
      root_cause: 'Increased database query latency due to missing index on consensus_lineage table',
      impact: 'Response time degradation affecting user experience and system throughput',
      affected_components: ['Database', 'Query Engine', 'API Layer'],
    },
    logs: [
      {
        id: 'log_4',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        level: 'warning',
        source: 'Database',
        message: 'Slow query detected: SELECT * FROM consensus_lineage WHERE project = ?',
        context: { execution_time: '1240ms', rows_scanned: 45000 },
      },
      {
        id: 'log_5',
        timestamp: new Date(Date.now() - 1780000).toISOString(),
        level: 'warning',
        source: 'API Layer',
        message: 'Request timeout warning: /api/iris/evaluate/microbiome',
        context: { duration: 5400 },
      },
    ],
    expert_traces: [],
    remediation_actions: [
      {
        id: 'action_5',
        priority: 'high',
        title: 'Add Database Index',
        description: 'Create index on consensus_lineage(project, timestamp) for faster queries',
        automated: true,
        estimated_time: '3-5 minutes',
        steps: [
          'Analyze query patterns and execution plans',
          'Create composite index on project and timestamp columns',
          'Verify query performance improvement',
          'Monitor index usage statistics',
        ],
      },
      {
        id: 'action_6',
        priority: 'medium',
        title: 'Implement Query Result Caching',
        description: 'Cache frequently accessed consensus lineage data',
        automated: false,
        estimated_time: '20 minutes',
        steps: [
          'Identify cacheable query patterns',
          'Configure Redis cache layer',
          'Implement cache invalidation strategy',
          'Monitor cache hit rates',
        ],
      },
    ],
    system_metrics: {
      cpu_usage: 65,
      memory_usage: 71,
      active_connections: 52,
      queue_depth: 18,
    },
  },
};

export const mockProjectDetails: Record<string, ProjectDetails> = {
  'nfl-predictor': {
    ...mockProjects[0],
    recent_errors: [],
    expert_performance: [
      { expert_id: 'exp_1', name: 'StatisticalAnalyzer', accuracy: 98.2, calls: 234 },
      { expert_id: 'exp_2', name: 'TrendDetector', accuracy: 95.7, calls: 189 },
      { expert_id: 'exp_3', name: 'PlayerMetrics', accuracy: 97.1, calls: 201 },
    ],
    recent_reflexions: [
      {
        id: 'ref_1',
        pattern: 'Home team advantage in cold weather',
        impact: 0.89,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    consensus_history: [
      { timestamp: new Date(Date.now() - 3600000).toISOString(), confidence: 0.94, experts_count: 8 },
      { timestamp: new Date(Date.now() - 7200000).toISOString(), confidence: 0.92, experts_count: 8 },
    ],
  },
  'microbiome': {
    ...mockProjects[1],
    recent_errors: [
      'Expert timeout: BiomeClassifier (2 occurrences)',
      'Low confidence warning: Pattern matching < 75%',
    ],
    expert_performance: [
      { expert_id: 'exp_4', name: 'BiomeClassifier', accuracy: 82.4, calls: 156 },
      { expert_id: 'exp_5', name: 'TaxonomyMapper', accuracy: 91.3, calls: 142 },
    ],
    recent_reflexions: [
      {
        id: 'ref_2',
        pattern: 'Gut diversity correlation with dietary fiber',
        impact: 0.76,
        created_at: new Date(Date.now() - 172800000).toISOString(),
      },
    ],
    consensus_history: [
      { timestamp: new Date(Date.now() - 3600000).toISOString(), confidence: 0.78, experts_count: 6 },
      { timestamp: new Date(Date.now() - 7200000).toISOString(), confidence: 0.81, experts_count: 6 },
    ],
  },
  'beclever': {
    ...mockProjects[2],
    recent_errors: [],
    expert_performance: [
      { expert_id: 'exp_6', name: 'ContentAnalyzer', accuracy: 97.8, calls: 312 },
      { expert_id: 'exp_7', name: 'EngagementPredictor', accuracy: 96.4, calls: 289 },
    ],
    recent_reflexions: [
      {
        id: 'ref_3',
        pattern: 'Peak engagement during morning hours',
        impact: 0.92,
        created_at: new Date(Date.now() - 43200000).toISOString(),
      },
    ],
    consensus_history: [
      { timestamp: new Date(Date.now() - 3600000).toISOString(), confidence: 0.95, experts_count: 10 },
      { timestamp: new Date(Date.now() - 7200000).toISOString(), confidence: 0.93, experts_count: 10 },
    ],
  },
};
