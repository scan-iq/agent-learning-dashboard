/**
 * Supabase Real-time Subscription Wrapper
 * For live updates and real-time monitoring
 */

import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import type { Database } from '../../src/supabase/types';

let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Initialize Supabase client
 */
function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseKey);
  return supabaseClient;
}

export type SubscriptionCallback<T = any> = (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T | null;
  old: T | null;
  timestamp: string;
}) => void;

export interface RealtimeSubscription {
  channel: string;
  unsubscribe: () => void;
}

/**
 * Subscribe to real-time changes on a table
 */
export function subscribe<T = any>(
  table: string,
  callback: SubscriptionCallback<T>,
  filter?: Record<string, any>
): RealtimeSubscription {
  const client = getSupabaseClient();

  let channel: RealtimeChannel = client
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
        filter: filter ? Object.entries(filter).map(([k, v]) => `${k}=eq.${v}`).join(',') : undefined,
      },
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as T | null,
          old: payload.old as T | null,
          timestamp: new Date().toISOString(),
        });
      }
    )
    .subscribe();

  return {
    channel: table,
    unsubscribe: () => {
      channel.unsubscribe();
    },
  };
}

/**
 * Subscribe to INSERT events only
 */
export function onInsert<T = any>(
  table: string,
  callback: (record: T) => void
): RealtimeSubscription {
  return subscribe<T>(table, (payload) => {
    if (payload.eventType === 'INSERT' && payload.new) {
      callback(payload.new);
    }
  });
}

/**
 * Subscribe to UPDATE events only
 */
export function onUpdate<T = any>(
  table: string,
  callback: (newRecord: T, oldRecord: T) => void
): RealtimeSubscription {
  return subscribe<T>(table, (payload) => {
    if (payload.eventType === 'UPDATE' && payload.new && payload.old) {
      callback(payload.new, payload.old);
    }
  });
}

/**
 * Subscribe to DELETE events only
 */
export function onDelete<T = any>(
  table: string,
  callback: (record: T) => void
): RealtimeSubscription {
  return subscribe<T>(table, (payload) => {
    if (payload.eventType === 'DELETE' && payload.old) {
      callback(payload.old);
    }
  });
}

/**
 * Monitor specific project changes
 */
export function monitorProject(
  projectId: string,
  onEvent: (event: {
    type: string;
    table: string;
    data: any;
  }) => void
): { unsubscribeAll: () => void } {
  const subscriptions: RealtimeSubscription[] = [];

  // Monitor reflexions
  subscriptions.push(
    subscribe('iris_reflexions', (payload) => {
      onEvent({
        type: payload.eventType,
        table: 'reflexions',
        data: payload.new,
      });
    }, { project_id: projectId })
  );

  // Monitor consensus
  subscriptions.push(
    subscribe('iris_consensus', (payload) => {
      onEvent({
        type: payload.eventType,
        table: 'consensus',
        data: payload.new,
      });
    }, { project_id: projectId })
  );

  // Monitor patterns
  subscriptions.push(
    subscribe('iris_pattern_matches', (payload) => {
      onEvent({
        type: payload.eventType,
        table: 'patterns',
        data: payload.new,
      });
    }, { project_id: projectId })
  );

  return {
    unsubscribeAll: () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
    },
  };
}

/**
 * Close all subscriptions
 */
export function unsubscribeAll(): void {
  if (supabaseClient) {
    supabaseClient.removeAllChannels();
  }
}
