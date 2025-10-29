import { type NextRequest, NextResponse } from "next/server"
import { fetchSharedPrescriptions, saveSharedPrescriptions } from "@/app/lib/jsonbin"

export async function GET(_request: NextRequest) {
  try {
    const prescriptions = await fetchSharedPrescriptions()
    return NextResponse.json(prescriptions)
  } catch (error) {
    console.error("[v0] Error fetching prescriptions (JSONBin):", error)
    return NextResponse.json({ error: "Failed to fetch prescriptions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const prescriptionData = await request.json()

    const newPrescription = {
      id: prescriptionData.id || `RX-${Date.now()}`,
      patientId: prescriptionData.patientId,
      patientName: prescriptionData.patientName,
      doctorName: prescriptionData.doctorName,
      medications: Array.isArray(prescriptionData.medications) ? prescriptionData.medications : [],
      diagnosis: prescriptionData.diagnosis || "",
      investigation: prescriptionData.investigation || "",
      fee: prescriptionData.fee || "",
      notes: prescriptionData.notes || "",
      injections: prescriptionData.injections || "",
      additionalMedicines: prescriptionData.additionalMedicines || "",
      prescriptionDate: prescriptionData.prescriptionDate || new Date().toISOString().split("T")[0],
      status: prescriptionData.status || "Active",
      date: prescriptionData.date || new Date().toISOString(),
    }

    const prescriptions = await fetchSharedPrescriptions()
    await saveSharedPrescriptions([newPrescription, ...prescriptions])

    return NextResponse.json(newPrescription, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating prescription (JSONBin):", error)
    return NextResponse.json({ error: "Failed to create prescription" }, { status: 500 })
  }
}
