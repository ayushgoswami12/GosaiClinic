import { type NextRequest, NextResponse } from "next/server"

// Mock users for demo
const mockUsers = [
  { id: "1", email: "doctor@clinic.com", password: "doctor123", name: "Dr. Sarah Wilson", role: "Doctor" },
  { id: "2", email: "nurse@clinic.com", password: "nurse123", name: "Nurse John", role: "Nurse" },
  { id: "3", email: "admin@clinic.com", password: "admin123", name: "Admin User", role: "Admin" },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Find user
    const user = mockUsers.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create session
    const sessionData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      loginTime: new Date().toISOString(),
    }

    // Set cookie for server-side session
    const response = NextResponse.json(sessionData)
    response.cookies.set("session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
