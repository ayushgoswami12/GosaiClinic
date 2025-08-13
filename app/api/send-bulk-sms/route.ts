import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { appointments, message } = await request.json()

    if (!appointments || !Array.isArray(appointments) || appointments.length === 0) {
      return NextResponse.json({ error: "Appointments array is required" }, { status: 400 })
    }

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const results = []
    const errors = []

    // Send SMS to each appointment
    for (const appointment of appointments) {
      try {
        // Format phone number
        let formattedPhone = appointment.phone.replace(/\s+/g, "").replace(/[^\d+]/g, "")
        if (!formattedPhone.startsWith("+91") && formattedPhone.startsWith("91")) {
          formattedPhone = "+" + formattedPhone
        } else if (!formattedPhone.startsWith("+91") && !formattedPhone.startsWith("91")) {
          formattedPhone = "+91" + formattedPhone
        }

        // Personalize message
        const personalizedMessage = message
          .replace("{patient}", appointment.patient)
          .replace("{time}", appointment.time)
          .replace("{date}", new Date(appointment.date).toLocaleDateString())
          .replace("{doctor}", appointment.doctor)

        // Here you would integrate with actual SMS service
        console.log(`Bulk SMS would be sent to ${formattedPhone}: ${personalizedMessage}`)

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        results.push({
          appointmentId: appointment.id,
          patient: appointment.patient,
          phone: formattedPhone,
          success: true,
          messageId: `msg_${Date.now()}_${appointment.id}`,
        })
      } catch (error) {
        errors.push({
          appointmentId: appointment.id,
          patient: appointment.patient,
          phone: appointment.phone,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      success: true,
      sent: results.length,
      failed: errors.length,
      results,
      errors,
    })
  } catch (error) {
    console.error("Bulk SMS sending error:", error)
    return NextResponse.json(
      { error: "Failed to send bulk SMS", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
