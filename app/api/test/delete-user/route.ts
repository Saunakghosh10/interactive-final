import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // First, find the user to make sure they exist
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete the user and all related data (cascading delete will handle relations)
    await prisma.user.delete({
      where: { email },
    })

    return NextResponse.json({
      message: "User deleted successfully",
      user,
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Failed to delete user", details: error },
      { status: 500 },
    )
  }
} 