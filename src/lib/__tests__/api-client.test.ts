import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  irisApi,
  adminApi,
  setApiKey,
  clearApiKey,
  hasApiKey,
  API_BASE
} from '../api-client';

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearApiKey();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('API Key Management', () => {
    it('should set API key in localStorage when remember is true', () => {
      setApiKey('test-key', true);
      expect(localStorage.setItem).toHaveBeenCalledWith('iris_api_key', 'test-key');
    });

    it('should set API key in sessionStorage when remember is false', () => {
      setApiKey('test-key', false);
      expect(sessionStorage.setItem).toHaveBeenCalledWith('iris_api_key', 'test-key');
    });

    it('should clear API key from both storages', () => {
      clearApiKey();
      expect(localStorage.removeItem).toHaveBeenCalledWith('iris_api_key');
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('iris_api_key');
    });

    it('should return true when API key exists', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('test-key');
      expect(hasApiKey()).toBe(true);
    });

    it('should return false when API key does not exist', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      vi.mocked(sessionStorage.getItem).mockReturnValue(null);
      expect(hasApiKey()).toBe(false);
    });
  });

  describe('irisApi.getAnalytics', () => {
    it('should fetch analytics data successfully', async () => {
      const mockData = { data: { overview: {}, tokenUsage: {} } };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      // Mock localStorage to return the API key
      vi.mocked(localStorage.getItem).mockReturnValue('test-key');

      const result = await irisApi.getAnalytics();

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/iris/analytics`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key',
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should handle API errors', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Server error' }),
      } as Response);

      setApiKey('test-key', true);
      await expect(irisApi.getAnalytics()).rejects.toThrow('Server error');
    });

    it('should work without API key', async () => {
      const mockData = { data: {} };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      // Ensure no API key is stored
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      vi.mocked(sessionStorage.getItem).mockReturnValue(null);

      const result = await irisApi.getAnalytics();

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      const headers = fetchCall[1]?.headers as Record<string, string>;
      expect(headers['Authorization']).toBeUndefined();
      expect(result).toEqual(mockData);
    });
  });

  describe('irisApi.getOverview', () => {
    it('should fetch overview data', async () => {
      const mockData = { metrics: {}, projects: [], events: [] };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await irisApi.getOverview();
      expect(result).toEqual(mockData);
    });
  });

  describe('irisApi.getProjects', () => {
    it('should fetch projects list', async () => {
      const mockData = { projects: [] };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await irisApi.getProjects();
      expect(result).toEqual(mockData);
    });
  });

  describe('irisApi.getProjectDetails', () => {
    it('should fetch project details by ID', async () => {
      const mockData = { id: 'project-1', name: 'Test Project' };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await irisApi.getProjectDetails('project-1');
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/iris/projects/project-1`,
        expect.any(Object)
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('irisApi.getEvents', () => {
    it('should fetch events with default limit', async () => {
      const mockData = { events: [] };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      await irisApi.getEvents();
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/iris/events?limit=50`,
        expect.any(Object)
      );
    });

    it('should fetch events with custom limit', async () => {
      const mockData = { events: [] };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      await irisApi.getEvents(100);
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/iris/events?limit=100`,
        expect.any(Object)
      );
    });
  });

  describe('irisApi.getModelRuns', () => {
    it('should fetch model runs for a project', async () => {
      const mockData = { runs: [] };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      await irisApi.getModelRuns('project-1', 100);
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/iris/model-runs?projectId=project-1&limit=100`,
        expect.any(Object)
      );
    });
  });

  describe('irisApi.evaluateAll', () => {
    it('should trigger evaluation for all projects', async () => {
      const mockData = { success: true };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await irisApi.evaluateAll();
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/iris/evaluate`,
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('irisApi.evaluateProject', () => {
    it('should trigger evaluation for specific project', async () => {
      const mockData = { success: true };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      await irisApi.evaluateProject('project-1');
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/iris/evaluate/project-1`,
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('irisApi.retrain', () => {
    it('should trigger retrain with project ID', async () => {
      const mockData = { success: true };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      await irisApi.retrain('project-1');
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/iris/retrain`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ projectId: 'project-1' }),
        })
      );
    });

    it('should trigger retrain without project ID', async () => {
      const mockData = { success: true };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      await irisApi.retrain();
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/iris/retrain`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ projectId: undefined }),
        })
      );
    });
  });

  describe('irisApi.getTokenUsage', () => {
    it('should fetch token usage with no parameters', async () => {
      const mockData = { usage: {} };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      await irisApi.getTokenUsage();
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/iris/token-usage?`,
        expect.any(Object)
      );
    });

    it('should fetch token usage with project and timeRange', async () => {
      const mockData = { usage: {} };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      await irisApi.getTokenUsage('project-1', '7d');
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/iris/token-usage?projectId=project-1&timeRange=7d`,
        expect.any(Object)
      );
    });
  });

  describe('adminApi', () => {
    it('should fetch API keys with admin key', async () => {
      const mockData = { keys: [] };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      await adminApi.getApiKeys('project-1', 'admin-key');
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/admin/api-keys?projectId=project-1`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Admin-Key': 'admin-key',
          }),
        })
      );
    });

    it('should create API key with admin credentials', async () => {
      const mockData = { key: 'new-key' };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      await adminApi.createApiKey('project-1', 'Project 1', 'test-label', 'admin-key');
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/admin/api-keys`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-Admin-Key': 'admin-key',
          }),
          body: JSON.stringify({
            projectId: 'project-1',
            projectName: 'Project 1',
            label: 'test-label',
          }),
        })
      );
    });

    it('should revoke API key', async () => {
      const mockData = { success: true };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      await adminApi.revokeApiKey('key-123', 'admin-key');
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/admin/api-keys`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'X-Admin-Key': 'admin-key',
          }),
          body: JSON.stringify({ keyId: 'key-123' }),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      await expect(irisApi.getAnalytics()).rejects.toThrow('Network error');
    });

    it('should handle non-JSON error responses', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as Response);

      vi.mocked(localStorage.getItem).mockReturnValue(null);

      await expect(irisApi.getAnalytics()).rejects.toThrow('Internal Server Error');
    });

    it('should handle error responses with message field', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Invalid request' }),
      } as Response);

      await expect(irisApi.getAnalytics()).rejects.toThrow('Invalid request');
    });
  });
});
