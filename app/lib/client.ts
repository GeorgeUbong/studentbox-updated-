import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // We use createBrowserClient because this runs 100% on the client side
  // once the user is logged in to manage the offline sync.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}