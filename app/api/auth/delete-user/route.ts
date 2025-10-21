import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/app/lib/supabase/server"

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await supabase.from("patients").delete().eq("user_id", user.id)

    await supabase.from("prescriptions").delete().eq("user_id", user.id)

    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error("[v0] Error deleting user:", deleteError)
      return NextResponse.json({ error: "Failed to delete user account" }, { status: 500 })
    }

    await supabase.auth.signOut()

    return NextResponse.json({ success: true, message: "User account deleted successfully" })
  } catch (error) {
    console.error("[v0] Error in delete user route:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
