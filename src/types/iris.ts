export type ProjectStatus = 'healthy' | 'warning' | 'critical';

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  health_score: number;
  last_run: string;
  total_runs: number;
  success_rate: number;
  active_experts: number;
  reflexions_count: number;
  avg_latency: number;
}

export interface OverviewMetrics {
  total_projects: number;
  healthy_projects: number;
  warning_projects: number;
  critical_projects: number;
  total_runs_today: number;
  avg_success_rate: number;
  active_experts: number;
  total_reflexions: number;
}

export interface IrisEvent {
  id: string;
  timestamp: string;
  project: string;
  event_type: 'evaluation' | 'retrain' | 'rotation' | 'consensus' | 'reflexion';
  severity: 'info' | 'warning' | 'error';
  message: string;
  metadata?: Record<string, any>;
}

export interface ProjectDetails extends Project {
  recent_errors: string[];
  expert_performance: {
    expert_id: string;
    name: string;
    accuracy: number;
    calls: number;
  }[];
  recent_reflexions: {
    id: string;
    pattern: string;
    impact: number;
    created_at: string;
  }[];
  consensus_history: {
    timestamp: string;
    confidence: number;
    experts_count: number;
  }[];
}
