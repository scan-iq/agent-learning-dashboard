import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import { irisQueryKeys } from './useIrisData';

// API Base URL from environment
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

// Generic POST/PUT/DELETE API client
async function mutateAPI<TData, TResponse = void>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST',
  data?: TData
): Promise<TResponse> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    // For DELETE requests or no content responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as TResponse;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

// Retrain expert request
export interface RetrainExpertRequest {
  project_id: string;
  expert_id?: string; // If not provided, retrain all experts for project
  training_data?: any[];
  config?: {
    epochs?: number;
    learning_rate?: number;
    batch_size?: number;
  };
}

export interface RetrainExpertResponse {
  job_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  message: string;
  estimated_duration?: number;
}

// Hook: Retrain expert
export function useRetrainExpert(): UseMutationResult<
  RetrainExpertResponse,
  Error,
  RetrainExpertRequest
> {
  const queryClient = useQueryClient();

  return useMutation<RetrainExpertResponse, Error, RetrainExpertRequest>({
    mutationFn: (request) =>
      mutateAPI<RetrainExpertRequest, RetrainExpertResponse>(
        '/api/iris/retrain',
        'POST',
        request
      ),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: irisQueryKeys.projects() });
      queryClient.invalidateQueries({
        queryKey: irisQueryKeys.project(variables.project_id),
      });
      queryClient.invalidateQueries({ queryKey: [...irisQueryKeys.all, 'experts'] });

      toast.success('Retraining Initiated', {
        description: data.message || 'Expert retraining has started',
      });
    },
    onError: (error) => {
      toast.error('Retraining Failed', {
        description: error.message,
      });
    },
  });
}

// Send event request
export interface SendEventRequest {
  project: string;
  event_type: 'evaluation' | 'retrain' | 'rotation' | 'consensus' | 'reflexion';
  severity?: 'info' | 'warning' | 'error';
  message: string;
  metadata?: Record<string, any>;
}

export interface SendEventResponse {
  event_id: string;
  timestamp: string;
}

// Hook: Send event
export function useSendEvent(): UseMutationResult<
  SendEventResponse,
  Error,
  SendEventRequest
> {
  const queryClient = useQueryClient();

  return useMutation<SendEventResponse, Error, SendEventRequest>({
    mutationFn: (request) =>
      mutateAPI<SendEventRequest, SendEventResponse>(
        '/api/iris/events',
        'POST',
        request
      ),
    onSuccess: () => {
      // Invalidate events query to show new event
      queryClient.invalidateQueries({ queryKey: irisQueryKeys.events() });

      toast.success('Event Sent', {
        description: 'Event has been logged successfully',
      });
    },
    onError: (error) => {
      toast.error('Failed to Send Event', {
        description: error.message,
      });
    },
  });
}

// Execute evaluation request
export interface ExecuteEvaluationRequest {
  project_id?: string; // If not provided, evaluates all projects
  include_consensus?: boolean;
  include_reflexions?: boolean;
}

export interface ExecutionResult {
  project: string;
  status: 'success' | 'failed';
  score?: number;
  errors?: string[];
}

export interface ExecuteEvaluationResponse {
  job_id: string;
  status: 'running' | 'completed' | 'failed';
  results: ExecutionResult[];
  total_projects: number;
  successful: number;
  failed: number;
}

// Hook: Execute evaluation
export function useExecuteEvaluation(): UseMutationResult<
  ExecuteEvaluationResponse,
  Error,
  ExecuteEvaluationRequest
> {
  const queryClient = useQueryClient();

  return useMutation<ExecuteEvaluationResponse, Error, ExecuteEvaluationRequest>({
    mutationFn: (request) =>
      mutateAPI<ExecuteEvaluationRequest, ExecuteEvaluationResponse>(
        '/api/iris/evaluate',
        'POST',
        request
      ),
    onSuccess: (data) => {
      // Refresh all relevant data
      queryClient.invalidateQueries({ queryKey: irisQueryKeys.overview() });
      queryClient.invalidateQueries({ queryKey: irisQueryKeys.projects() });
      queryClient.invalidateQueries({ queryKey: irisQueryKeys.events() });

      toast.success('Evaluation Completed', {
        description: `${data.successful} of ${data.total_projects} projects evaluated successfully`,
      });
    },
    onError: (error) => {
      toast.error('Evaluation Failed', {
        description: error.message,
      });
    },
  });
}

// Execute remediation request
export interface ExecuteRemediationRequest {
  anomaly_id: string;
  action_id: string;
  parameters?: Record<string, any>;
  dry_run?: boolean;
}

export interface ExecuteRemediationResponse {
  execution_id: string;
  status: 'preparing' | 'running' | 'completed' | 'failed';
  steps: {
    id: string;
    description: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
  }[];
}

// Hook: Execute remediation action
export function useExecuteRemediation(): UseMutationResult<
  ExecuteRemediationResponse,
  Error,
  ExecuteRemediationRequest
> {
  const queryClient = useQueryClient();

  return useMutation<ExecuteRemediationResponse, Error, ExecuteRemediationRequest>({
    mutationFn: (request) =>
      mutateAPI<ExecuteRemediationRequest, ExecuteRemediationResponse>(
        '/api/iris/remediate',
        'POST',
        request
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: irisQueryKeys.anomalies() });
      queryClient.invalidateQueries({ queryKey: irisQueryKeys.events() });

      toast.success('Remediation Started', {
        description: `Execution ID: ${data.execution_id}`,
      });
    },
    onError: (error) => {
      toast.error('Remediation Failed', {
        description: error.message,
      });
    },
  });
}

// Acknowledge anomaly request
export interface AcknowledgeAnomalyRequest {
  anomaly_id: string;
  acknowledged_by: string;
  notes?: string;
}

// Hook: Acknowledge anomaly
export function useAcknowledgeAnomaly(): UseMutationResult<
  void,
  Error,
  AcknowledgeAnomalyRequest
> {
  const queryClient = useQueryClient();

  return useMutation<void, Error, AcknowledgeAnomalyRequest>({
    mutationFn: (request) =>
      mutateAPI<AcknowledgeAnomalyRequest>(
        `/api/iris/anomalies/${request.anomaly_id}/acknowledge`,
        'POST',
        request
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: irisQueryKeys.anomalies() });

      toast.success('Anomaly Acknowledged', {
        description: 'The anomaly has been marked as acknowledged',
      });
    },
    onError: (error) => {
      toast.error('Failed to Acknowledge', {
        description: error.message,
      });
    },
  });
}

// Rotate expert request
export interface RotateExpertRequest {
  project_id: string;
  strategy?: 'performance' | 'round_robin' | 'weighted';
  force?: boolean;
}

export interface RotateExpertResponse {
  project: string;
  previous_expert: string;
  new_expert: string;
  reason: string;
}

// Hook: Rotate expert
export function useRotateExpert(): UseMutationResult<
  RotateExpertResponse,
  Error,
  RotateExpertRequest
> {
  const queryClient = useQueryClient();

  return useMutation<RotateExpertResponse, Error, RotateExpertRequest>({
    mutationFn: (request) =>
      mutateAPI<RotateExpertRequest, RotateExpertResponse>(
        '/api/iris/rotate',
        'POST',
        request
      ),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: irisQueryKeys.project(variables.project_id),
      });
      queryClient.invalidateQueries({ queryKey: [...irisQueryKeys.all, 'experts'] });
      queryClient.invalidateQueries({ queryKey: irisQueryKeys.events() });

      toast.success('Expert Rotated', {
        description: `Switched from ${data.previous_expert} to ${data.new_expert}`,
      });
    },
    onError: (error) => {
      toast.error('Rotation Failed', {
        description: error.message,
      });
    },
  });
}

// Apply reflexion request
export interface ApplyReflexionRequest {
  reflexion_id: string;
  project_id: string;
  auto_retrain?: boolean;
}

export interface ApplyReflexionResponse {
  status: 'applied' | 'pending_retrain';
  message: string;
  retrain_job_id?: string;
}

// Hook: Apply reflexion
export function useApplyReflexion(): UseMutationResult<
  ApplyReflexionResponse,
  Error,
  ApplyReflexionRequest
> {
  const queryClient = useQueryClient();

  return useMutation<ApplyReflexionResponse, Error, ApplyReflexionRequest>({
    mutationFn: (request) =>
      mutateAPI<ApplyReflexionRequest, ApplyReflexionResponse>(
        '/api/iris/reflexions/apply',
        'POST',
        request
      ),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [...irisQueryKeys.all, 'reflexions'] });
      queryClient.invalidateQueries({
        queryKey: irisQueryKeys.project(variables.project_id),
      });
      queryClient.invalidateQueries({ queryKey: irisQueryKeys.events() });

      toast.success('Reflexion Applied', {
        description: data.message,
      });
    },
    onError: (error) => {
      toast.error('Failed to Apply Reflexion', {
        description: error.message,
      });
    },
  });
}

// Update project configuration request
export interface UpdateProjectConfigRequest {
  project_id: string;
  config: {
    auto_retrain?: boolean;
    rotation_strategy?: 'performance' | 'round_robin' | 'weighted';
    consensus_threshold?: number;
    anomaly_detection?: boolean;
  };
}

// Hook: Update project configuration
export function useUpdateProjectConfig(): UseMutationResult<
  void,
  Error,
  UpdateProjectConfigRequest
> {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateProjectConfigRequest>({
    mutationFn: (request) =>
      mutateAPI<UpdateProjectConfigRequest>(
        `/api/iris/projects/${request.project_id}/config`,
        'PUT',
        request
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: irisQueryKeys.project(variables.project_id),
      });

      toast.success('Configuration Updated', {
        description: 'Project settings have been saved',
      });
    },
    onError: (error) => {
      toast.error('Update Failed', {
        description: error.message,
      });
    },
  });
}
