import 'server-only';

export const resolveSupabaseServerEnv = () => {
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

  return {
    url,
    serviceKey,
    missing,
  };
};
