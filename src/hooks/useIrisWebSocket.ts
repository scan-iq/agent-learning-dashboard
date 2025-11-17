import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { irisQueryKeys } from './useIrisData';

// WebSocket URL from environment
const WS_BASE = import.meta.env.VITE_WS_BASE || 'ws://localhost:3000';

// WebSocket message types
export type WebSocketEventType =
  | 'project_update'
  | 'anomaly_detected'
  | 'expert_rotated'
  | 'evaluation_complete'
  | 'remediation_progress'
  | 'system_alert'
  | 'reflexion_created'
  | 'consensus_reached';

export interface WebSocketMessage {
  type: WebSocketEventType;
  timestamp: string;
  data: any;
}

export interface UseIrisWebSocketOptions {
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export interface UseIrisWebSocketReturn {
  isConnected: boolean;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: any) => void;
  lastMessage: WebSocketMessage | null;
}

/**
 * Hook for real-time WebSocket updates from IRIS
 *
 * @example
 * ```tsx
 * const { isConnected, lastMessage } = useIrisWebSocket({
 *   autoConnect: true,
 *   onMessage: (msg) => console.log('Received:', msg)
 * });
 * ```
 */
export function useIrisWebSocket(
  options: UseIrisWebSocketOptions = {}
): UseIrisWebSocketReturn {
  const {
    autoConnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [connectionState, setConnectionState] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  // Handle incoming messages
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        setLastMessage(message);

        // Invalidate relevant queries based on message type
        switch (message.type) {
          case 'project_update':
            queryClient.invalidateQueries({ queryKey: irisQueryKeys.projects() });
            if (message.data?.project_id) {
              queryClient.invalidateQueries({
                queryKey: irisQueryKeys.project(message.data.project_id),
              });
            }
            break;

          case 'anomaly_detected':
            queryClient.invalidateQueries({ queryKey: irisQueryKeys.anomalies() });
            toast.warning('Anomaly Detected', {
              description: message.data?.description || 'A new anomaly has been detected',
            });
            break;

          case 'expert_rotated':
            queryClient.invalidateQueries({ queryKey: [...irisQueryKeys.all, 'experts'] });
            queryClient.invalidateQueries({ queryKey: irisQueryKeys.events() });
            break;

          case 'evaluation_complete':
            queryClient.invalidateQueries({ queryKey: irisQueryKeys.overview() });
            queryClient.invalidateQueries({ queryKey: irisQueryKeys.projects() });
            break;

          case 'remediation_progress':
            // Real-time remediation updates handled by specific component
            break;

          case 'system_alert':
            queryClient.invalidateQueries({ queryKey: [...irisQueryKeys.all, 'health'] });
            if (message.data?.severity === 'critical') {
              toast.error('System Alert', {
                description: message.data?.message || 'Critical system alert',
              });
            }
            break;

          case 'reflexion_created':
            queryClient.invalidateQueries({ queryKey: [...irisQueryKeys.all, 'reflexions'] });
            break;

          case 'consensus_reached':
            queryClient.invalidateQueries({ queryKey: [...irisQueryKeys.all, 'consensus'] });
            break;
        }

        // Call custom message handler if provided
        onMessage?.(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    },
    [queryClient, onMessage]
  );

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      setConnectionState('connecting');
      const ws = new WebSocket(`${WS_BASE}/api/iris/ws`);

      ws.onopen = () => {
        setConnectionState('connected');
        reconnectAttemptsRef.current = 0;
        onConnect?.();
        toast.success('Connected to IRIS', {
          description: 'Real-time updates enabled',
        });
      };

      ws.onmessage = handleMessage;

      ws.onerror = (error) => {
        setConnectionState('error');
        onError?.(error);
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        setConnectionState('disconnected');
        onDisconnect?.();

        // Attempt to reconnect if not intentionally closed
        if (
          reconnectAttemptsRef.current < maxReconnectAttempts &&
          autoConnect
        ) {
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            toast.info('Reconnecting to IRIS...', {
              description: `Attempt ${reconnectAttemptsRef.current} of ${maxReconnectAttempts}`,
            });
            connect();
          }, reconnectInterval);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          toast.error('Connection Lost', {
            description: 'Failed to reconnect to IRIS. Please refresh the page.',
          });
        }
      };

      wsRef.current = ws;
    } catch (error) {
      setConnectionState('error');
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [
    autoConnect,
    maxReconnectAttempts,
    reconnectInterval,
    handleMessage,
    onConnect,
    onDisconnect,
    onError,
  ]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnectionState('disconnected');
    reconnectAttemptsRef.current = maxReconnectAttempts; // Prevent auto-reconnect
  }, [maxReconnectAttempts]);

  // Send message through WebSocket
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
      toast.warning('Not Connected', {
        description: 'Unable to send message. Connection is not established.',
      });
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected: connectionState === 'connected',
    connectionState,
    connect,
    disconnect,
    sendMessage,
    lastMessage,
  };
}

/**
 * Hook for subscribing to specific WebSocket event types
 *
 * @example
 * ```tsx
 * useIrisWebSocketSubscription('anomaly_detected', (data) => {
 *   console.log('New anomaly:', data);
 * });
 * ```
 */
export function useIrisWebSocketSubscription(
  eventType: WebSocketEventType,
  callback: (data: any) => void
) {
  const { lastMessage } = useIrisWebSocket({ autoConnect: true });

  useEffect(() => {
    if (lastMessage && lastMessage.type === eventType) {
      callback(lastMessage.data);
    }
  }, [lastMessage, eventType, callback]);
}

/**
 * Hook for real-time remediation execution updates
 */
export function useRemediationStream(executionId: string | null) {
  const [progress, setProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [status, setStatus] = useState<'running' | 'completed' | 'failed' | 'idle'>('idle');

  useIrisWebSocketSubscription('remediation_progress', (data) => {
    if (data.execution_id === executionId) {
      setProgress(data.progress || 0);
      setCurrentStep(data.current_step || '');
      setStatus(data.status || 'running');
    }
  });

  return { progress, currentStep, status };
}
