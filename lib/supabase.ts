import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

/**
 * Browser/client-side Supabase client. Uses the public anon key, safe to
 * expose. Row Level Security must be enabled on every table (see
 * supabase/schema.sql) so this client can only read what it's allowed to.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Server-only Supabase client with the service role key. Never import this
 * from a "use client" component — it bypasses Row Level Security and must
 * only be used inside API routes / server actions.
 */
export function getServiceSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}
