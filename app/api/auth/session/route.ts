import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")

    if (!sessionCookie) {
      // Try localStorage fallback
      const authHeader = request.headers.get("x-user-data")
      if (authHeader) {
        return NextResponse.json(JSON.parse(authHeader))
      }
      return NextResponse.json(null, { status: 401 })
    }

    return NextResponse.json(JSON.parse(sessionCookie.value))
  } catch (error) {
    return NextResponse.json(null, { status: 401 })
  }
}
