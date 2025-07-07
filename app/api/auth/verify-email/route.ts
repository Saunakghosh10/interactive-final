import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ message: "Verification token is required" }, { status: 400 })
    }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationExpires: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
      },
    })

    if (!user) {
      return NextResponse.json({ message: "Invalid or expired verification token" }, { status: 400 })
    }

    // Update user as verified
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationExpires: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
      },
    })

    return NextResponse.json({
      message: "Email verified successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      { message: "Internal server error", error: process.env.NODE_ENV === "development" ? error : undefined },
      { status: 500 },
    )
  }
}
