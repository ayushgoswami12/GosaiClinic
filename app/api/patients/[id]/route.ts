import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/app/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: patient, error } = await supabase
      .from("patients")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (error || !patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    return NextResponse.json(patient)
  } catch (error) {
    console.error("[v0] Error fetching patient:", error)
    return NextResponse.json({ error: "Failed to fetch patient" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const patientData = await request.json()

    const { data: updatedPatient, error } = await supabase
      .from("patients")
      .update({
        first_name: patientData.firstName,
        last_name: patientData.lastName,
        age: patientData.age,
        gender: patientData.gender,
        phone: patientData.phone,
        address: patientData.address,
        blood_type: patientData.bloodType,
        allergies: patientData.allergies,
        medical_history: patientData.medicalHistory,
        date_of_visit: patientData.dateOfVisit,
        images: patientData.images || [],
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()

    if (error || !updatedPatient?.[0]) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    return NextResponse.json(updatedPatient[0])
  } catch (error) {
    console.error("[v0] Error updating patient:", error)
    return NextResponse.json({ error: "Failed to update patient" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase.from("patients").delete().eq("id", params.id).eq("user_id", user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting patient:", error)
    return NextResponse.json({ error: "Failed to delete patient" }, { status: 500 })
  }
}
