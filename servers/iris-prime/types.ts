/**
 * TypeScript types for IRIS API
 * Shared between all wrapper functions
 */

export interface ApiError {
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
}

export interface EvaluationResult {
  projectId: string;
  healthScore: number;
  status: 'healthy' | 'warning' | 'critical';
  metrics: {
    accuracy: number;
    performance: number;
    reliability: number;
    latency: number;
  };
  recommendations: string[];
  timestamp: string;
}

export interface DriftAlert {
  expertId: string;
  version: string;
  driftScore: number;
  affectedMetrics: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: string;
  description: string;
}

export interface PatternDiscovery {
  patterns: Array<{
    id: string;
    type: string;
    confidence: number;
    description: string;
    frequency: number;
    impact: 'low' | 'medium' | 'high';
  }>;
  analysisType: string;
  timestamp: string;
}

export interface GlobalMetrics {
  totalProjects: number;
  healthyProjects: number;
  warningProjects: number;
  criticalProjects: number;
  avgHealthScore: number;
  totalEvaluations: number;
  successRate: number;
  avgLatency: number;
  activeExperts: number;
  totalReflexions: number;
  timestamp: string;
}

export interface ConsensusLineage {
  consensusId: string;
  decision: string;
  confidence: number;
  expertsInvolved: Array<{
    expertId: string;
    weight: number;
    vote: any;
  }>;
  lineageTree: Array<{
    step: number;
    action: string;
    timestamp: string;
  }>;
  metadata: Record<string, any>;
}

export interface ReflexionQuery {
  patterns: Array<{
    id: string;
    pattern: string;
    impact: number;
    frequency: number;
    createdAt: string;
  }>;
  totalCount: number;
  filters: Record<string, any>;
}

export interface ExpertSignature {
  expertId: string;
  version: string;
  signature: {
    modelType: string;
    parameters: Record<string, any>;
    performance: {
      accuracy: number;
      latency: number;
      reliability: number;
    };
  };
  metadata: Record<string, any>;
  createdAt: string;
}

export interface TelemetryEvent {
  eventId: string;
  eventType: string;
  projectId?: string;
  expertId?: string;
  data: Record<string, any>;
  timestamp: string;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
}

// Request argument types
export interface EvaluateProjectArgs {
  projectId: string;
  includeRecommendations?: boolean;
}

export interface DetectDriftArgs {
  expertId: string;
  version: string;
  threshold?: number;
}

export interface DiscoverPatternsArgs {
  analysisType: 'consensus' | 'reflexion' | 'performance' | 'all';
  projectId?: string;
  timeRange?: string;
}

export interface GetMetricsArgs {
  timeRange?: '1h' | '24h' | '7d' | '30d';
  projectId?: string;
}

export interface GetConsensusLineageArgs {
  consensusId: string;
  depth?: number;
}

export interface QueryReflexionsArgs {
  projectId?: string;
  pattern?: string;
  minImpact?: number;
  limit?: number;
  offset?: number;
}

export interface GetExpertSignaturesArgs {
  expertId: string;
  version?: string;
}

export interface SubmitTelemetryArgs {
  eventType: string;
  projectId?: string;
  expertId?: string;
  data: Record<string, any>;
}
