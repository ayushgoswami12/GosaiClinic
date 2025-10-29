import { type NextRequest, NextResponse } from "next/server"
import { fetchSharedPatients, saveSharedPatients } from "@/app/lib/jsonbin"

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const patients = await fetchSharedPatients()
    const patient = patients.find((p: any) => p.id === params.id)
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    return NextResponse.json(patient)
  } catch (error) {
    console.error("[v0] Error fetching patient (JSONBin):", error)
    return NextResponse.json({ error: "Failed to fetch patient" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const patients = await fetchSharedPatients()
    const updated = patients.map((p: any) => (p.id === params.id ? { ...p, ...updates } : p))
    await saveSharedPatients(updated)
    const patient = updated.find((p: any) => p.id === params.id)
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    return NextResponse.json(patient)
  } catch (error) {
    console.error("[v0] Error updating patient (JSONBin):", error)
    return NextResponse.json({ error: "Failed to update patient" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const patients = await fetchSharedPatients()
    const updated = patients.filter((p: any) => p.id !== params.id)
    await saveSharedPatients(updated)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting patient (JSONBin):", error)
    return NextResponse.json({ error: "Failed to delete patient" }, { status: 500 })
  }
}
