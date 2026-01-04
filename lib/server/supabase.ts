import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type SupabaseEnv = {
  url?: string;
  serviceKey?: string;
  missing: string[];
};

export type SupabaseEnvError = Error & { missing: string[] };

let loggedEnvSuccess = false;
let loggedEnvError = false;

export const resolveSupabaseServerEnv = (): SupabaseEnv => {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

  const missing: string[] = [];
  if (!url) {
    missing.push('SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL fallback)');
  }
  if (!serviceKey) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY fallback)');
  }

  if (!missing.length && !loggedEnvSuccess) {
    console.info('Supabase server env resolved successfully.');
    loggedEnvSuccess = true;
  }

  return {
    url,
    serviceKey,
    missing,
  };
};

const logMissingEnvOnce = (missing: string[]) => {
  if (loggedEnvError) return;
  console.error('Supabase server env missing required values.', {
    missing,
  });
  loggedEnvError = true;
};

export const getSupabaseServerClient = (): SupabaseClient => {
  const { url, serviceKey, missing } = resolveSupabaseServerEnv();
  if (!url || !serviceKey) {
    logMissingEnvOnce(missing);
    const error = new Error('Missing Supabase env') as SupabaseEnvError;
    error.missing = missing;
    throw error;
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

export const isSupabaseEnvError = (error: unknown): error is SupabaseEnvError => {
  return (
    error instanceof Error &&
    'missing' in error &&
    Array.isArray((error as SupabaseEnvError).missing)
  );
};
