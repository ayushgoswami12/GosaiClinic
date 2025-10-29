"use client"

import { useEffect, useState } from "react"

export function usePatients() {
  const [patients, setPatients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPatients = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/patients", { cache: "no-store" })
      if (!response.ok) throw new Error("Failed to fetch patients")
      const data = await response.json()
      setPatients(data || [])
      localStorage.setItem("patients", JSON.stringify(data || []))
      setError(null)
    } catch (err) {
      console.error("[v0] Error fetching patients (JSONBin):", err)
      // Fallback to localStorage if remote fetch fails
      const local = JSON.parse(localStorage.getItem("patients") || "[]")
      setPatients(local)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const addPatient = async (patientData: any) => {
    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientData),
      })
      if (!response.ok) throw new Error("Failed to add patient")
      const newPatient = await response.json()
      const updated = [newPatient, ...patients]
      setPatients(updated)
      localStorage.setItem("patients", JSON.stringify(updated))
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
      const updatedPatient = await response.json()
      const updatedList = patients.map((p) => (p.id === id ? updatedPatient : p))
      setPatients(updatedList)
      localStorage.setItem("patients", JSON.stringify(updatedList))
      return updatedPatient
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    }
  }

  const deletePatient = async (id: string) => {
    try {
      const response = await fetch(`/api/patients/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete patient")
      const updatedPatients = patients.filter((p: any) => p.id !== id)
      setPatients(updatedPatients)
      localStorage.setItem("patients", JSON.stringify(updatedPatients))
      // Also remove related prescriptions locally
      const localPrescriptions = JSON.parse(localStorage.getItem("prescriptions") || "[]")
      const updatedPrescriptions = localPrescriptions.filter((p: any) => p.patientId !== id)
      localStorage.setItem("prescriptions", JSON.stringify(updatedPrescriptions))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    }
  }

  return { patients, isLoading, error, addPatient, updatePatient, deletePatient, refetch: fetchPatients }
}
