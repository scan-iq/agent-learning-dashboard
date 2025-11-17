import { Project, OverviewMetrics, IrisEvent, ProjectDetails } from '@/types/iris';

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
