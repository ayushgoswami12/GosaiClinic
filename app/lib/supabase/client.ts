import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  console.log("[v0] Supabase URL:", url ? "✓ Set" : "✗ Missing")
  console.log("[v0] Supabase Key:", key ? "✓ Set" : "✗ Missing")

  if (!url || !key) {
    console.error(
      "[v0] Missing Supabase environment variables. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your Vercel project settings.",
    )
    // Return a dummy client to prevent crashes - the app will show a setup page
    return createBrowserClient("https://placeholder.supabase.co", "placeholder-key")
  }

  return createBrowserClient(url, key)
}
