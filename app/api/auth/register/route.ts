import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"
import { sendVerificationEmail } from "@/lib/email"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Received registration request:", {
      ...body,
      password: body.password ? "[REDACTED]" : undefined,
    })

    const { name, email, password, username } = body

    // Validation
    if (!name || !email || !password || !username) {
      console.log("Missing required fields:", {
        name: !name,
        email: !email,
        password: !password,
        username: !username,
      })
      return NextResponse.json(
        {
          message: "Missing required fields",
          details: {
            name: !name ? "Name is required" : null,
            email: !email ? "Email is required" : null,
            password: !password ? "Password is required" : null,
            username: !username ? "Username is required" : null,
          },
        },
        { status: 400 },
      )
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_-]+$/
    if (!usernameRegex.test(username)) {
      console.log("Invalid username format:", username)
      return NextResponse.json({ 
        message: "Username can only contain letters, numbers, underscores, and hyphens" 
      }, { status: 400 })
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("Invalid email format:", email)
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 })
    }

    // Password validation
    if (password.length < 8) {
      console.log("Password too short")
      return NextResponse.json({ message: "Password must be at least 8 characters long" }, { status: 400 })
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
    if (!passwordRegex.test(password)) {
      console.log("Password does not meet requirements")
      return NextResponse.json(
        {
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        },
        { status: 400 },
      )
    }

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { username }
          ]
        }
      })

      if (existingUser) {
        console.log("User already exists:", existingUser.email === email ? "email" : "username")
        return NextResponse.json({ 
          message: existingUser.email === email 
            ? "User with this email already exists" 
            : "Username is already taken"
        }, { status: 400 })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Generate verification token
      const verificationToken = randomBytes(32).toString("hex")
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          username,
          password: hashedPassword,
          emailVerified: null,
          verificationToken,
          verificationExpires,
        },
      })

      console.log("User created successfully:", {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
      })

      // Send verification email
      try {
        await sendVerificationEmail(email, verificationToken)
        console.log("Verification email sent successfully")
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError)
        // Delete the created user if email sending fails
        await prisma.user.delete({
          where: { id: user.id },
        })
        return NextResponse.json(
          { message: "Failed to send verification email. Please try again." },
          { status: 500 },
        )
      }

      // Remove sensitive data from response
      const { password: _, verificationToken: __, ...userWithoutSensitiveData } = user

      return NextResponse.json(
        {
          message: "User created successfully. Please check your email to verify your account.",
          user: userWithoutSensitiveData,
        },
        { status: 201 },
      )
    } catch (dbError) {
      console.error("Database error:", dbError)
      if (dbError instanceof PrismaClientKnownRequestError) {
        if (dbError.code === "P2002") {
          return NextResponse.json({ message: "User with this email already exists" }, { status: 400 })
        }
      }
      throw dbError // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    )
  }
}
