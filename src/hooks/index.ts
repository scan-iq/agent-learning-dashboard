/**
 * IRIS Prime Console - React Query Hooks
 *
 * Centralized exports for all data fetching and mutation hooks
 */

// Data fetching hooks
export {
  useIrisOverview,
  useIrisProjects,
  useProjectDetails,
  useIrisEvents,
  useAnomalies,
  usePatterns,
  useExpertPerformance,
  useReflexions,
  useConsensusHistory,
  useSystemHealth,
  useDiagnosticData,
  irisQueryKeys,
} from './useIrisData';

// Mutation hooks
export {
  useRetrainExpert,
  useSendEvent,
  useExecuteEvaluation,
  useExecuteRemediation,
  useAcknowledgeAnomaly,
  useRotateExpert,
  useApplyReflexion,
  useUpdateProjectConfig,
} from './useIrisMutations';

// WebSocket hooks
export {
  useIrisWebSocket,
  useIrisWebSocketSubscription,
  useRemediationStream,
} from './useIrisWebSocket';

// Re-export types for convenience
export type {
  Anomaly,
  Pattern,
  ExpertPerformance,
  Reflexion,
  ConsensusRecord,
  SystemHealth,
  DiagnosticData,
  DiagnosticLog,
} from './useIrisData';

export type {
  RetrainExpertRequest,
  RetrainExpertResponse,
  SendEventRequest,
  SendEventResponse,
  ExecuteEvaluationRequest,
  ExecuteEvaluationResponse,
  ExecuteRemediationRequest,
  ExecuteRemediationResponse,
  AcknowledgeAnomalyRequest,
  RotateExpertRequest,
  RotateExpertResponse,
  ApplyReflexionRequest,
  ApplyReflexionResponse,
  UpdateProjectConfigRequest,
} from './useIrisMutations';

export type {
  WebSocketMessage,
  WebSocketEventType,
  UseIrisWebSocketOptions,
  UseIrisWebSocketReturn,
} from './useIrisWebSocket';
