import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  if (!url || !key) {
    // Return a dummy client to prevent crashes - the app will show a setup page
    return createBrowserClient("https://placeholder.supabase.co", "placeholder-key")
  }

  return createBrowserClient(url, key)
}
