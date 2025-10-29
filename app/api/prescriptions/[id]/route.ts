import { type NextRequest, NextResponse } from "next/server"
import { fetchSharedPrescriptions, saveSharedPrescriptions } from "@/app/lib/jsonbin"

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const prescriptions = await fetchSharedPrescriptions()
    const rx = prescriptions.find((p: any) => p.id === params.id)
    if (!rx) return NextResponse.json({ error: "Prescription not found" }, { status: 404 })
    return NextResponse.json(rx)
  } catch (error) {
    console.error("[v0] Error fetching prescription (JSONBin):", error)
    return NextResponse.json({ error: "Failed to fetch prescription" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const prescriptions = await fetchSharedPrescriptions()
    const updated = prescriptions.map((p: any) => (p.id === params.id ? { ...p, ...updates } : p))
    await saveSharedPrescriptions(updated)
    const rx = updated.find((p: any) => p.id === params.id)
    if (!rx) return NextResponse.json({ error: "Prescription not found" }, { status: 404 })
    return NextResponse.json(rx)
  } catch (error) {
    console.error("[v0] Error updating prescription (JSONBin):", error)
    return NextResponse.json({ error: "Failed to update prescription" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const prescriptions = await fetchSharedPrescriptions()
    const updated = prescriptions.filter((p: any) => p.id !== params.id)
    await saveSharedPrescriptions(updated)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting prescription (JSONBin):", error)
    return NextResponse.json({ error: "Failed to delete prescription" }, { status: 500 })
  }
}