import { Resend } from "resend"

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Get the app URL with a fallback
const getAppUrl = () => {
  const url = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "http://localhost:3000"
  return url.replace(/\/$/, "") // Remove trailing slash if present
}

export async function sendVerificationEmail(email: string, verificationToken: string) {
  const appUrl = getAppUrl()
  const verificationUrl = `${appUrl}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(
    email,
  )}`

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured")
    throw new Error("Email service is not configured")
  }

  try {
    console.log("Sending verification email to:", email)
    console.log("App URL:", appUrl)
    console.log("Verification URL:", verificationUrl)

    const data = await resend.emails.send({
      from: "Interactive Ideas <onboarding@resend.dev>", // Using Resend's default domain
      to: email,
      subject: "Verify your email address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6d28d9;">Welcome to Interactive Ideas!</h2>
          <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
          <div style="margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: linear-gradient(to right, #6d28d9, #f59e0b);
                      color: white;
                      padding: 12px 24px;
                      border-radius: 6px;
                      text-decoration: none;
                      display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If you didn't create an account, you can safely ignore this email.
          </p>
          <p style="color: #666; font-size: 14px;">
            This verification link will expire in 24 hours.
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            If the button above doesn't work, copy and paste this URL into your browser:
            <br />
            ${verificationUrl}
          </p>
        </div>
      `,
    })

    console.log("Verification email sent successfully:", data)
    return data
  } catch (error) {
    console.error("Error sending verification email:", error)
    throw error
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const appUrl = getAppUrl()
  const resetUrl = `${appUrl}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(
    email,
  )}`

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured")
    throw new Error("Email service is not configured")
  }

  try {
    console.log("Sending password reset email to:", email)
    console.log("Reset URL:", resetUrl)

    const data = await resend.emails.send({
      from: "Interactive Ideas <onboarding@resend.dev>", // Using Resend's default domain
      to: email,
      subject: "Reset your password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6d28d9;">Reset Your Password</h2>
          <p>You requested to reset your password. Click the button below to create a new password.</p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(to right, #6d28d9, #f59e0b);
                      color: white;
                      padding: 12px 24px;
                      border-radius: 6px;
                      text-decoration: none;
                      display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If you didn't request a password reset, you can safely ignore this email.
          </p>
          <p style="color: #666; font-size: 14px;">
            This reset link will expire in 1 hour.
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            If the button above doesn't work, copy and paste this URL into your browser:
            <br />
            ${resetUrl}
          </p>
        </div>
      `,
    })

    console.log("Password reset email sent successfully:", data)
    return data
  } catch (error) {
    console.error("Error sending password reset email:", error)
    throw error
  }
} 