import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const ideaId = params.id

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    // Check if idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
    })

    if (!idea) {
      return NextResponse.json(
        { message: "Idea not found" },
        { status: 404 }
      )
    }

    // Check if user has already sparked
    const existingSpark = await prisma.spark.findUnique({
      where: {
        userId_ideaId: {
          userId: session.user.id,
          ideaId,
        },
      },
    })

    if (existingSpark) {
      return NextResponse.json(
        { message: "Already sparked" },
        { status: 400 }
      )
    }

    // Create spark
    await prisma.spark.create({
      data: {
        userId: session.user.id,
        ideaId,
      },
    })

    // Update idea spark count
    await prisma.idea.update({
      where: { id: ideaId },
      data: { sparkCount: { increment: 1 } },
    })

    return NextResponse.json({ message: "Sparked successfully" })
  } catch (error) {
    console.error("Error sparking idea:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const ideaId = params.id

    // Delete spark
    await prisma.spark.delete({
      where: {
        userId_ideaId: {
          userId: session.user.id,
          ideaId,
        },
      },
    })

    return NextResponse.json({ message: "Unsparked successfully" })
  } catch (error) {
    console.error("Error unsparking idea:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ hasSparked: false })
    }

    const ideaId = params.id

    const spark = await prisma.spark.findUnique({
        where: {
        userId_ideaId: {
          userId: session.user.id,
          ideaId,
        },
        },
    })

    return NextResponse.json({ hasSparked: !!spark })
  } catch (error) {
    console.error("Error checking spark status:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
