import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL as string) || "https://placeholder.supabase.co";
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) || "placeholder-anon-key";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  // Doesn't throw — a hard throw here crashes the build itself (Next.js
  // evaluates this module while collecting page data for every API route
  // that imports it). Missing/incorrect vars will instead surface as a
  // real network error the moment a Supabase call is actually made.
  console.warn(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. " +
      "Set it in Vercel → Project Settings → Environment Variables."
  );
}

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
