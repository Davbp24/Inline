import { createClient as createBareSupabase } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { ModelProvider } from '@/lib/ai/providers/models'

// Note: '@/lib/supabase/server' (which imports next/headers) is loaded lazily
// inside getSupabaseAndUserFromRequest so this module — and the agent graph
// that depends on it — can also be imported in plain Node (e.g. the eval
// harness) without pulling in Next request-only APIs at import time.

/**
 * Google Gemini key. Kept as the canonical helper used by embeddings and the
 * existing single-provider AI routes — do not change its signature.
 */
export async function getAIApiKey(): Promise<string | null> {
  return process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? null
}

/** Resolve the API key for any supported provider (multi-provider layer). */
export async function getProviderApiKey(provider: ModelProvider): Promise<string | null> {
  switch (provider) {
    case 'google':
      return process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? null
    case 'openai':
      return process.env.OPENAI_API_KEY ?? null
    case 'anthropic':
      return process.env.ANTHROPIC_API_KEY ?? null
    default:
      return null
  }
}

/**
 * Resolve the calling user plus a Supabase client whose PostgREST requests run
 * AS that user, so RLS policies apply correctly in both auth modes:
 *
 * - `Authorization: Bearer <jwt>` (extension / Express backend): a client
 *   bound to that token. Previously the token was only used to look up the
 *   user while queries ran anonymously — RPCs relying on auth.uid() failed.
 * - Cookie session (dashboard): the SSR cookie client.
 */
export async function getSupabaseAndUserFromRequest(request: Request) {
  const authHeader = request.headers.get('Authorization')

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim()
    if (token.split('.').length === 3 && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const bearerClient = createBareSupabase<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
        },
      )
      const { data: { user } } = await bearerClient.auth.getUser(token)
      if (user) return { supabase: bearerClient, user }
    }
  }

  const { createClient: createServerSupabase } = await import('@/lib/supabase/server')
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user: user ?? null }
}
