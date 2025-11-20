/**
 * Submit Telemetry - IRIS API Wrapper
 *
 * Submits telemetry events to the IRIS system
 */

import { apiRequest } from './client';
import type { SubmitTelemetryArgs, TelemetryEvent } from './types';

/**
 * Submit telemetry event
 *
 * @param args - Telemetry event data
 * @returns Telemetry event confirmation with ID
 *
 * @example
 * ```typescript
 * const event = await submitTelemetry({
 *   eventType: 'expert_rotation',
 *   projectId: 'nfl-predictor',
 *   expertId: 'expert-001',
 *   data: {
 *     reason: 'performance_degradation',
 *     oldAccuracy: 0.85,
 *     newAccuracy: 0.92
 *   }
 * });
 *
 * console.log(`Telemetry event recorded: ${event.eventId}`);
 * ```
 */
export async function submitTelemetry(
  args: SubmitTelemetryArgs
): Promise<TelemetryEvent> {
  const { eventType, projectId, expertId, data } = args;

  const result = await apiRequest<TelemetryEvent>(
    '/api/iris/telemetry',
    {
      method: 'POST',
      body: {
        eventType,
        projectId,
        expertId,
        data,
        timestamp: new Date().toISOString()
      }
    }
  );

  return result;
}
