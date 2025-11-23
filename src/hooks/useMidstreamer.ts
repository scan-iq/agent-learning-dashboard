/**
 * Midstreamer Integration Hook
 * Provides real-time data streaming capabilities using WebSocket/SSE
 * Uses native WebSocket and EventSource APIs with a unified interface
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface MidstreamerConfig {
  url: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export interface MidstreamerState<T> {
  data: T | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  reconnectAttempt: number;
  lastUpdate: Date | null;
}

export interface MidstreamerActions {
  connect: () => void;
  disconnect: () => void;
  reset: () => void;
}

export type UseMidstreamerReturn<T> = MidstreamerState<T> & MidstreamerActions;

/**
 * Custom hook for midstreamer integration with advanced reconnection logic
 * Supports WebSocket and Server-Sent Events (SSE)
 */
export function useMidstreamer<T = any>(
  endpoint: string,
  config: Partial<MidstreamerConfig> = {}
): UseMidstreamerReturn<T> {
  const {
    reconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 10,
    heartbeatInterval = 30000,
  } = config;

  // State management
  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Refs for cleanup and reconnection logic
  const streamerRef = useRef<any>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  /**
   * Calculate exponential backoff delay
   */
  const getReconnectDelay = useCallback((attempt: number): number => {
    // Exponential backoff: 3s, 6s, 12s, 24s, 48s, max 60s
    const delay = Math.min(reconnectInterval * Math.pow(2, attempt), 60000);
    // Add jitter (random ±20%) to prevent thundering herd
    const jitter = delay * 0.2 * (Math.random() - 0.5);
    return delay + jitter;
  }, [reconnectInterval]);

  /**
   * Handle connection establishment
   */
  const handleConnect = useCallback(() => {
    if (!mountedRef.current) return;

    console.log('✅ Midstreamer connected:', endpoint);
    setIsConnected(true);
    setIsConnecting(false);
    setError(null);
    setReconnectAttempt(0);

    // Update connection status in ref
    if (streamerRef.current) {
      streamerRef.current.isConnected = true;
    }

    // Start heartbeat to detect dead connections
    if (heartbeatInterval > 0) {
      heartbeatTimerRef.current = setInterval(() => {
        if (streamerRef.current?.isConnected) {
          streamerRef.current.ping?.();
        }
      }, heartbeatInterval);
    }
  }, [endpoint, heartbeatInterval]);

  /**
   * Handle connection loss
   */
  const handleDisconnect = useCallback(() => {
    if (!mountedRef.current) return;

    console.log('⚠️ Midstreamer disconnected:', endpoint);
    setIsConnected(false);
    setIsConnecting(false);

    // Clear heartbeat
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }

    // Attempt reconnection with exponential backoff
    if (reconnect && reconnectAttempt < maxReconnectAttempts) {
      const delay = getReconnectDelay(reconnectAttempt);
      console.log(`🔄 Reconnecting in ${Math.round(delay / 1000)}s (attempt ${reconnectAttempt + 1}/${maxReconnectAttempts})`);

      setReconnectAttempt(prev => prev + 1);
      setIsConnecting(true);

      reconnectTimerRef.current = setTimeout(() => {
        if (mountedRef.current && streamerRef.current) {
          streamerRef.current.connect();
        }
      }, delay);
    } else if (reconnectAttempt >= maxReconnectAttempts) {
      setError(new Error(`Failed to reconnect after ${maxReconnectAttempts} attempts`));
      setIsConnecting(false);
    }
  }, [endpoint, reconnect, reconnectAttempt, maxReconnectAttempts, getReconnectDelay]);

  /**
   * Handle incoming data
   */
  const handleData = useCallback((newData: T) => {
    if (!mountedRef.current) return;

    console.log('📊 Midstreamer data received:', newData);
    setData(newData);
    setLastUpdate(new Date());
    setError(null);
  }, []);

  /**
   * Handle errors
   */
  const handleError = useCallback((err: Error) => {
    if (!mountedRef.current) return;

    console.error('❌ Midstreamer error:', err);
    setError(err);
  }, []);

  /**
   * Connect to midstreamer (WebSocket or SSE)
   */
  const connect = useCallback(() => {
    if (streamerRef.current || isConnecting) {
      console.log('Already connected or connecting');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // Determine protocol based on endpoint
      const url = endpoint.startsWith('http') ? endpoint : `${window.location.origin}${endpoint}`;
      const useWebSocket = url.startsWith('ws://') || url.startsWith('wss://') || url.includes('/ws/');

      if (useWebSocket) {
        // WebSocket implementation
        const wsUrl = url.replace(/^http/, 'ws');
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          handleConnect();
        };

        ws.onclose = () => {
          handleDisconnect();
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleData(data);
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        };

        ws.onerror = (event) => {
          handleError(new Error('WebSocket error'));
        };

        streamerRef.current = {
          connection: ws,
          type: 'websocket',
          isConnected: false,
          disconnect: () => ws.close(),
          ping: () => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'ping' }));
            }
          },
        };
      } else {
        // Server-Sent Events (SSE) implementation
        const eventSource = new EventSource(url);

        eventSource.onopen = () => {
          handleConnect();
        };

        eventSource.onerror = (event) => {
          if (eventSource.readyState === EventSource.CLOSED) {
            handleDisconnect();
          } else {
            handleError(new Error('SSE error'));
          }
        };

        // Listen for different event types
        ['message', 'update', 'event', 'telemetry'].forEach((eventType) => {
          eventSource.addEventListener(eventType, (event: MessageEvent) => {
            try {
              const data = JSON.parse(event.data);
              handleData(data);
            } catch (err) {
              console.error(`Failed to parse SSE ${eventType}:`, err);
            }
          });
        });

        streamerRef.current = {
          connection: eventSource,
          type: 'sse',
          isConnected: false,
          disconnect: () => eventSource.close(),
          ping: () => {}, // SSE doesn't need explicit ping
        };
      }

      console.log(`🔌 Connecting to ${useWebSocket ? 'WebSocket' : 'SSE'}:`, endpoint);
    } catch (err) {
      console.error('Failed to initialize connection:', err);
      setError(err as Error);
      setIsConnecting(false);
    }
  }, [endpoint, isConnecting, handleConnect, handleDisconnect, handleData, handleError]);

  /**
   * Disconnect from midstreamer
   */
  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting from midstreamer');

    // Clear timers
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }

    // Disconnect streamer
    if (streamerRef.current) {
      try {
        streamerRef.current.isConnected = false;
        streamerRef.current.disconnect();
      } catch (err) {
        console.error('Error disconnecting:', err);
      }
      streamerRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setReconnectAttempt(0);
  }, []);

  /**
   * Reset state and reconnect
   */
  const reset = useCallback(() => {
    disconnect();
    setData(null);
    setError(null);
    setLastUpdate(null);
    setTimeout(() => connect(), 100);
  }, [disconnect, connect]);

  /**
   * Auto-connect on mount and cleanup on unmount
   */
  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [endpoint]); // Reconnect if endpoint changes

  return {
    data,
    isConnected,
    isConnecting,
    error,
    reconnectAttempt,
    lastUpdate,
    connect,
    disconnect,
    reset,
  };
}

/**
 * Hook variant for polling fallback when connection fails
 * Automatically falls back to polling if connection cannot be established
 */
export function useMidstreamerWithFallback<T = any>(
  endpoint: string,
  fallbackFn: () => Promise<T>,
  fallbackInterval: number = 30000,
  config?: Partial<MidstreamerConfig>
) {
  const midstreamer = useMidstreamer<T>(endpoint, config);
  const [fallbackData, setFallbackData] = useState<T | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Start fallback polling if connection fails
  useEffect(() => {
    const shouldUseFallback =
      !midstreamer.isConnected &&
      !midstreamer.isConnecting &&
      midstreamer.reconnectAttempt >= (config?.maxReconnectAttempts || 10);

    if (shouldUseFallback && !usingFallback) {
      console.log('⚠️ Switching to fallback polling mode');
      setUsingFallback(true);

      // Initial fetch
      fallbackFn().then(setFallbackData).catch(console.error);

      // Start polling
      fallbackTimerRef.current = setInterval(() => {
        fallbackFn().then(setFallbackData).catch(console.error);
      }, fallbackInterval);
    } else if (!shouldUseFallback && usingFallback) {
      console.log('✅ Switching back to real-time mode');
      setUsingFallback(false);

      if (fallbackTimerRef.current) {
        clearInterval(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    }

    return () => {
      if (fallbackTimerRef.current) {
        clearInterval(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };
  }, [
    midstreamer.isConnected,
    midstreamer.isConnecting,
    midstreamer.reconnectAttempt,
    usingFallback,
    fallbackFn,
    fallbackInterval,
    config?.maxReconnectAttempts,
  ]);

  return {
    ...midstreamer,
    data: usingFallback ? fallbackData : midstreamer.data,
    usingFallback,
  };
}
