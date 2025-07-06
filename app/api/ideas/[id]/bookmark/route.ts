import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const ideaId = params.id
    const userId = session.user.id

    // Check if idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
    })

    if (!idea) {
      return NextResponse.json({ message: "Idea not found" }, { status: 404 })
    }

    // Create bookmark
    const bookmark = await prisma.bookmark.create({
      data: {
        userId,
        ideaId,
      },
    })

    return NextResponse.json(bookmark)
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Already bookmarked" }, { status: 400 })
    }
    console.error("Error creating bookmark:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const ideaId = params.id
    const userId = session.user.id

    // Delete bookmark
    await prisma.bookmark.delete({
      where: {
        userId_ideaId: {
          userId,
          ideaId,
        },
      },
    })

    return NextResponse.json({ message: "Bookmark removed" })
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ message: "Bookmark not found" }, { status: 404 })
    }
    console.error("Error deleting bookmark:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const ideaId = params.id
    const userId = session.user.id

    // Check if bookmark exists
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_ideaId: {
          userId,
          ideaId,
        },
      },
    })

    return NextResponse.json({ isBookmarked: !!bookmark })
  } catch (error) {
    console.error("Error checking bookmark:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 