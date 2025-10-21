import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/app/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: patients, error } = await supabase
      .from("patients")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(patients || [])
  } catch (error) {
    console.error("[v0] Error fetching patients:", error)
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const patientData = await request.json()

    const { data: newPatient, error } = await supabase
      .from("patients")
      .insert([
        {
          user_id: user.id,
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
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json(newPatient?.[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating patient:", error)
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 })
  }
}
