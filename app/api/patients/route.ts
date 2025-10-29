import { type NextRequest, NextResponse } from "next/server"
import { fetchSharedPatients, saveSharedPatients } from "@/app/lib/jsonbin"

export async function GET(_request: NextRequest) {
  try {
    const patients = await fetchSharedPatients()
    return NextResponse.json(patients)
  } catch (error) {
    console.error("[v0] Error fetching patients (JSONBin):", error)
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const patientData = await request.json()

    // Shape patient object similar to localStorage structure
    const newPatient = {
      id: patientData.id || `PAT-${Date.now()}`,
      firstName: patientData.firstName,
      lastName: patientData.lastName,
      age: patientData.age,
      gender: patientData.gender,
      phone: patientData.phone,
      address: patientData.address,
      bloodType: patientData.bloodType,
      allergies: patientData.allergies,
      medicalHistory: patientData.medicalHistory,
      dateOfVisit: patientData.dateOfVisit,
      registrationDate: patientData.registrationDate || new Date().toISOString(),
      images: patientData.images || [],
    }

    const patients = await fetchSharedPatients()
    await saveSharedPatients([newPatient, ...patients])

    return NextResponse.json(newPatient, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating patient (JSONBin):", error)
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 })
  }
}
