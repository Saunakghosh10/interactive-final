import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { randomBytes } from "crypto"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "Email is already verified" }, { status: 400 })
    }

    // Generate new verification token
    const verificationToken = randomBytes(32).toString("hex")
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Update user with new verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationExpires,
      },
    })

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken)
    } catch (error) {
      console.error("Failed to send verification email:", error)
      return NextResponse.json(
        { message: "Failed to send verification email. Please try again." },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { message: "Verification email sent successfully. Please check your inbox." },
      { status: 200 },
    )
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 