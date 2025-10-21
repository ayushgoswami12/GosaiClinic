"use client"

export function SetupRequired() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Setup Required</h1>
        <p className="text-gray-700 mb-6">
          Supabase environment variables are not configured. Please add them to your Vercel project:
        </p>
        <div className="bg-slate-50 p-4 rounded mb-6 text-sm font-mono">
          <p className="text-gray-800 mb-2">
            <strong>NEXT_PUBLIC_SUPABASE_URL</strong>
          </p>
          <p className="text-gray-600 mb-4">https://whikjssuxcximvepskej.supabase.co</p>
          <p className="text-gray-800 mb-2">
            <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong>
          </p>
          <p className="text-gray-600 break-all">
            eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoaWtqc3N1eGN4aW12ZXBza2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NzA1MTQsImV4cCI6MjA3NjE0NjUxNH0._cJyaocRLtOZX-HiLZ9z_8-gjzm3M9ohCAKietFT6Vg
          </p>
        </div>
        <ol className="text-gray-700 text-sm space-y-2">
          <li>
            1. Open the <strong>Vars</strong> section in the left sidebar
          </li>
          <li>2. Add the two variables above</li>
          <li>3. Refresh this page</li>
        </ol>
      </div>
    </div>
  )
}
