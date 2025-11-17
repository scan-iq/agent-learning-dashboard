export interface ExecutionHistoryRecord {
  id: string;
  actionId: string;
  actionTitle: string;
  projectId: string;
  projectName: string;
  startTime: string;
  endTime: string;
  duration: number; // in seconds
  status: 'completed' | 'failed' | 'rolled_back';
  totalSteps: number;
  completedSteps: number;
  failedStep?: number;
  errorMessage?: string;
  rollbackReason?: string;
  metrics: {
    avgCpuUsage: number;
    avgMemoryUsage: number;
    peakCpuUsage: number;
    peakMemoryUsage: number;
    avgResponseTime: number;
    errorCount: number;
  };
  executedBy: 'manual' | 'scheduled' | 'automatic';
  triggeredBy?: string;
}

export interface HistoryFilters {
  status?: ExecutionHistoryRecord['status'][];
  projectId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  executedBy?: ExecutionHistoryRecord['executedBy'][];
  searchQuery?: string;
}
