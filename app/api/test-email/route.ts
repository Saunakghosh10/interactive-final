import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured")
      return NextResponse.json(
        { error: "Email service is not configured" },
        { status: 500 }
      )
    }

    console.log("Attempting to send test email to:", email)
    console.log("Using RESEND_API_KEY:", process.env.RESEND_API_KEY ? "Configured" : "Missing")

    const data = await resend.emails.send({
      from: "Interactive Ideas <onboarding@resend.dev>", // Using Resend's default domain for testing
      to: email,
      subject: "Test Email from Interactive Ideas",
      html: "<p>This is a test email to verify the email sending functionality.</p>",
    })

    console.log("Email sent successfully:", data)

    return NextResponse.json(
      { message: "Test email sent successfully", data },
      { status: 200 }
    )
  } catch (error) {
    console.error("Failed to send test email:", error)
    return NextResponse.json(
      { error: "Failed to send test email", details: error },
      { status: 500 }
    )
  }
} 