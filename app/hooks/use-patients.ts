"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/app/lib/auth-context"
import { createClient } from "@/app/lib/supabase/client"

export function usePatients() {
  const [patients, setPatients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, isAuthenticated } = useAuth()

  const fetchPatients = async () => {
    if (!isAuthenticated || !user) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const supabase = createClient()

      const { data, error: fetchError } = await supabase
        .from("patients")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError

      setPatients(data || [])
      setError(null)
    } catch (err) {
      console.error("[v0] Error fetching patients:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()

    if (!user) return

    const supabase = createClient()
    const subscription = supabase
      .channel(`patients:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "patients",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchPatients()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [isAuthenticated, user])

  const addPatient = async (patientData: any) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientData),
      })
      if (!response.ok) throw new Error("Failed to add patient")
      const newPatient = await response.json()
      setPatients([newPatient, ...patients])
      return newPatient
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    }
  }

  const updatePatient = async (id: string, updates: any) => {
    try {
      const response = await fetch(`/api/patients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!response.ok) throw new Error("Failed to update patient")
      const updated = await response.json()
      setPatients(patients.map((p) => (p.id === id ? updated : p)))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    }
  }

  const deletePatient = async (id: string) => {
    try {
      const response = await fetch(`/api/patients/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete patient")
      setPatients(patients.filter((p) => p.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    }
  }

  return { patients, isLoading, error, addPatient, updatePatient, deletePatient, refetch: fetchPatients }
}
