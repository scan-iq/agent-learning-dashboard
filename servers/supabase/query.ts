/**
 * Direct Supabase Query Wrapper
 * For operations that need direct database access
 */

import { createClient } from '@supabase/supabase-js';
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

export type SupabaseRow = Record<string, any>;

export interface SupabaseQueryOptions {
  select?: string;
  filter?: Record<string, any>;
  order?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

/**
 * Query any Supabase table directly
 */
export async function query<T = SupabaseRow>(
  table: string,
  options: SupabaseQueryOptions = {}
): Promise<T[]> {
  const client = getSupabaseClient();

  let queryBuilder = client
    .from(table)
    .select(options.select ?? '*');

  // Apply filters
  if (options.filter) {
    Object.entries(options.filter).forEach(([key, value]) => {
      queryBuilder = queryBuilder.eq(key, value);
    });
  }

  // Apply ordering
  if (options.order) {
    queryBuilder = queryBuilder.order(
      options.order.column,
      { ascending: options.order.ascending ?? true }
    );
  }

  // Apply pagination
  if (options.limit) {
    queryBuilder = queryBuilder.limit(options.limit);
  }
  if (options.offset) {
    queryBuilder = queryBuilder.range(
      options.offset,
      options.offset + (options.limit ?? 100) - 1
    );
  }

  const { data, error } = await queryBuilder;

  if (error) {
    throw new Error(`Supabase query failed: ${error.message}`);
  }

  return (data ?? []) as T[];
}

/**
 * Insert data into Supabase table
 */
export async function insert<T = SupabaseRow>(
  table: string,
  data: Partial<T> | Partial<T>[]
): Promise<T[]> {
  const client = getSupabaseClient();

  const { data: inserted, error } = await client
    .from(table)
    .insert(data as any)
    .select();

  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`);
  }

  return (inserted ?? []) as T[];
}

/**
 * Update data in Supabase table
 */
export async function update<T = SupabaseRow>(
  table: string,
  filter: Record<string, any>,
  updates: Partial<T>
): Promise<T[]> {
  const client = getSupabaseClient();

  let queryBuilder = client.from(table).update(updates as any);

  // Apply filters
  Object.entries(filter).forEach(([key, value]) => {
    queryBuilder = queryBuilder.eq(key, value);
  });

  const { data: updated, error } = await queryBuilder.select();

  if (error) {
    throw new Error(`Supabase update failed: ${error.message}`);
  }

  return (updated ?? []) as T[];
}

/**
 * Delete from Supabase table
 */
export async function deleteRows(
  table: string,
  filter: Record<string, any>
): Promise<number> {
  const client = getSupabaseClient();

  let queryBuilder = client.from(table).delete();

  // Apply filters
  Object.entries(filter).forEach(([key, value]) => {
    queryBuilder = queryBuilder.eq(key, value);
  });

  const { data, error } = await queryBuilder.select();

  if (error) {
    throw new Error(`Supabase delete failed: ${error.message}`);
  }

  return data?.length ?? 0;
}

/**
 * Execute raw SQL (for complex queries)
 */
export async function executeSql<T = SupabaseRow>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  const client = getSupabaseClient();

  const { data, error } = await client.rpc('execute_sql', {
    sql_query: sql,
    params: params ?? [],
  });

  if (error) {
    throw new Error(`SQL execution failed: ${error.message}`);
  }

  return (data ?? []) as T[];
}
