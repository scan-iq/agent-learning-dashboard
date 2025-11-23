import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useIrisWebSocket, useRemediationStream } from '../useIrisWebSocket';
import { ReactNode } from 'react';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useIrisWebSocket', () => {
  let mockWebSocket: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a mock WebSocket instance that we can control
    mockWebSocket = {
      url: '',
      readyState: WebSocket.CONNECTING,
      onopen: null,
      onclose: null,
      onmessage: null,
      onerror: null,
      send: vi.fn(),
      close: vi.fn(),
    };

    // Mock WebSocket constructor
    global.WebSocket = vi.fn().mockImplementation((url) => {
      mockWebSocket.url = url;
      return mockWebSocket;
    }) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should connect automatically when autoConnect is true', () => {
    renderHook(() => useIrisWebSocket({ autoConnect: true }), {
      wrapper: createWrapper(),
    });

    expect(global.WebSocket).toHaveBeenCalledWith(expect.stringContaining('/api/iris/ws'));
  });

  it('should not connect automatically when autoConnect is false', () => {
    renderHook(() => useIrisWebSocket({ autoConnect: false }), {
      wrapper: createWrapper(),
    });

    expect(global.WebSocket).not.toHaveBeenCalled();
  });

  it('should update connection state to connected when socket opens', async () => {
    const { result } = renderHook(() => useIrisWebSocket({ autoConnect: true }), {
      wrapper: createWrapper(),
    });

    expect(result.current.connectionState).toBe('connecting');

    // Simulate WebSocket open event
    act(() => {
      mockWebSocket.readyState = WebSocket.OPEN;
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }
    });

    await waitFor(() => {
      expect(result.current.connectionState).toBe('connected');
      expect(result.current.isConnected).toBe(true);
    });
  });

  it('should handle WebSocket errors', async () => {
    const onError = vi.fn();
    const { result } = renderHook(
      () => useIrisWebSocket({ autoConnect: true, onError }),
      { wrapper: createWrapper() }
    );

    // Simulate WebSocket error
    act(() => {
      if (mockWebSocket.onerror) {
        mockWebSocket.onerror(new Event('error'));
      }
    });

    await waitFor(() => {
      expect(result.current.connectionState).toBe('error');
      expect(onError).toHaveBeenCalled();
    });
  });

  it('should handle WebSocket close and attempt reconnection', async () => {
    vi.useFakeTimers();

    const { result } = renderHook(
      () => useIrisWebSocket({ autoConnect: true, reconnectInterval: 1000 }),
      { wrapper: createWrapper() }
    );

    // Open connection first
    act(() => {
      mockWebSocket.readyState = WebSocket.OPEN;
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Clear the initial WebSocket call
    vi.clearAllMocks();

    // Simulate WebSocket close
    act(() => {
      mockWebSocket.readyState = WebSocket.CLOSED;
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose(new Event('close'));
      }
    });

    await waitFor(() => {
      expect(result.current.connectionState).toBe('disconnected');
    });

    // Fast-forward time to trigger reconnection
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(global.WebSocket).toHaveBeenCalled();
    });

    vi.useRealTimers();
  });

  it('should stop reconnecting after max attempts', async () => {
    vi.useFakeTimers();

    const { result } = renderHook(
      () =>
        useIrisWebSocket({
          autoConnect: true,
          reconnectInterval: 1000,
          maxReconnectAttempts: 2,
        }),
      { wrapper: createWrapper() }
    );

    // Simulate multiple connection failures
    for (let i = 0; i < 3; i++) {
      act(() => {
        if (mockWebSocket.onclose) {
          mockWebSocket.onclose(new Event('close'));
        }
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }

    // After max attempts, should not try again
    const callCount = vi.mocked(global.WebSocket).mock.calls.length;

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(vi.mocked(global.WebSocket).mock.calls.length).toBe(callCount);

    vi.useRealTimers();
  });

  it('should handle incoming messages', async () => {
    const onMessage = vi.fn();
    const { result } = renderHook(
      () => useIrisWebSocket({ autoConnect: true, onMessage }),
      { wrapper: createWrapper() }
    );

    // Open connection
    act(() => {
      mockWebSocket.readyState = WebSocket.OPEN;
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }
    });

    const testMessage = {
      type: 'project_update',
      timestamp: '2025-01-01T12:00:00Z',
      data: { project_id: 'test-project' },
    };

    // Simulate incoming message
    act(() => {
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage(
          new MessageEvent('message', {
            data: JSON.stringify(testMessage),
          })
        );
      }
    });

    await waitFor(() => {
      expect(result.current.lastMessage).toEqual(testMessage);
      expect(onMessage).toHaveBeenCalledWith(testMessage);
    });
  });

  it('should send messages when connected', async () => {
    const { result } = renderHook(() => useIrisWebSocket({ autoConnect: true }), {
      wrapper: createWrapper(),
    });

    // Open connection
    act(() => {
      mockWebSocket.readyState = WebSocket.OPEN;
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    const testMessage = { type: 'ping', data: {} };

    act(() => {
      result.current.sendMessage(testMessage);
    });

    expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(testMessage));
  });

  it('should not send messages when disconnected', () => {
    const { result } = renderHook(() => useIrisWebSocket({ autoConnect: false }), {
      wrapper: createWrapper(),
    });

    const testMessage = { type: 'ping', data: {} };

    act(() => {
      result.current.sendMessage(testMessage);
    });

    expect(mockWebSocket.send).not.toHaveBeenCalled();
  });

  it('should disconnect when disconnect is called', async () => {
    const { result } = renderHook(() => useIrisWebSocket({ autoConnect: true }), {
      wrapper: createWrapper(),
    });

    // Open connection
    act(() => {
      mockWebSocket.readyState = WebSocket.OPEN;
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    act(() => {
      result.current.disconnect();
    });

    expect(mockWebSocket.close).toHaveBeenCalled();
  });

  it('should call custom callbacks', async () => {
    const onConnect = vi.fn();
    const onDisconnect = vi.fn();

    renderHook(
      () => useIrisWebSocket({ autoConnect: true, onConnect, onDisconnect }),
      { wrapper: createWrapper() }
    );

    // Open connection
    act(() => {
      mockWebSocket.readyState = WebSocket.OPEN;
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }
    });

    await waitFor(() => {
      expect(onConnect).toHaveBeenCalled();
    });

    // Close connection
    act(() => {
      mockWebSocket.readyState = WebSocket.CLOSED;
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose(new Event('close'));
      }
    });

    await waitFor(() => {
      expect(onDisconnect).toHaveBeenCalled();
    });
  });

  it('should handle malformed message JSON', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderHook(() => useIrisWebSocket({ autoConnect: true }), {
      wrapper: createWrapper(),
    });

    // Open connection
    act(() => {
      mockWebSocket.readyState = WebSocket.OPEN;
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }
    });

    // Send malformed JSON
    act(() => {
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage(
          new MessageEvent('message', {
            data: 'invalid json',
          })
        );
      }
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to parse WebSocket message:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('should cleanup on unmount', async () => {
    const { unmount } = renderHook(() => useIrisWebSocket({ autoConnect: true }), {
      wrapper: createWrapper(),
    });

    // Open connection
    act(() => {
      mockWebSocket.readyState = WebSocket.OPEN;
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }
    });

    unmount();

    expect(mockWebSocket.close).toHaveBeenCalled();
  });
});

describe('useRemediationStream', () => {
  let mockWebSocket: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockWebSocket = {
      url: '',
      readyState: WebSocket.CONNECTING,
      onopen: null,
      onclose: null,
      onmessage: null,
      onerror: null,
      send: vi.fn(),
      close: vi.fn(),
    };

    global.WebSocket = vi.fn().mockImplementation((url) => {
      mockWebSocket.url = url;
      return mockWebSocket;
    }) as any;
  });

  it('should track remediation progress', async () => {
    const { result } = renderHook(() => useRemediationStream('exec-123'), {
      wrapper: createWrapper(),
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.progress).toBe(0);

    // Open WebSocket connection
    act(() => {
      mockWebSocket.readyState = WebSocket.OPEN;
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }
    });

    // Simulate remediation progress message
    const progressMessage = {
      type: 'remediation_progress',
      timestamp: '2025-01-01T12:00:00Z',
      data: {
        execution_id: 'exec-123',
        progress: 45,
        current_step: 'Analyzing issue',
        status: 'running',
      },
    };

    act(() => {
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage(
          new MessageEvent('message', {
            data: JSON.stringify(progressMessage),
          })
        );
      }
    });

    await waitFor(() => {
      expect(result.current.progress).toBe(45);
      expect(result.current.currentStep).toBe('Analyzing issue');
      expect(result.current.status).toBe('running');
    });
  });

  it('should ignore messages for different execution IDs', async () => {
    const { result } = renderHook(() => useRemediationStream('exec-123'), {
      wrapper: createWrapper(),
    });

    // Open WebSocket connection
    act(() => {
      mockWebSocket.readyState = WebSocket.OPEN;
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }
    });

    // Message for different execution
    const progressMessage = {
      type: 'remediation_progress',
      timestamp: '2025-01-01T12:00:00Z',
      data: {
        execution_id: 'exec-456',
        progress: 75,
        current_step: 'Different execution',
        status: 'running',
      },
    };

    act(() => {
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage(
          new MessageEvent('message', {
            data: JSON.stringify(progressMessage),
          })
        );
      }
    });

    // Should not update
    expect(result.current.progress).toBe(0);
    expect(result.current.currentStep).toBe('');
    expect(result.current.status).toBe('idle');
  });
});
