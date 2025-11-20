import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { irisApi } from '@/lib/api-client';

export interface TelemetryHealth {
  ok?: boolean;
  summary?: {
    queued?: number;
    sent?: number;
    failed?: number;
    lastFlush?: string | null;
  };
  message?: string;
}

export function useTelemetryHealth(): UseQueryResult<TelemetryHealth> {
  return useQuery({
    queryKey: ['telemetry-health'],
    queryFn: async () => {
      try {
        const res = await irisApi.getTelemetryHealth();
        return res;
      } catch (error: any) {
        console.error('Telemetry health error', error);
        return { ok: false, message: error?.message || 'Telemetry health unavailable' };
      }
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

export function useDecisionDrafts(status: string = 'pending'): UseQueryResult<any[]> {
  return useQuery({
    queryKey: ['decision-drafts', status],
    queryFn: async () => {
      try {
        const res = await irisApi.getDecisionDrafts(status);
        return Array.isArray(res) ? res : res?.data || [];
      } catch (error) {
        console.error('Decision drafts error', error);
        return [];
      }
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });
}
