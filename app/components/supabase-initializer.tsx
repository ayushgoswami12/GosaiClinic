'use client'

import { useEffect } from 'react'
import initializeSupabase from '../lib/supabase/init'

export default function SupabaseInitializer() {
  useEffect(() => {
    // Initialize Supabase on component mount (client-side only)
    initializeSupabase()
      .then(result => {
        if (result.success) {
          console.log('Supabase initialized successfully')
        } else {
          console.error('Supabase initialization failed:', result.error)
        }
      })
      .catch(err => {
        console.error('Error initializing Supabase:', err)
      })
  }, [])

  // This component doesn't render anything
  return null
}
