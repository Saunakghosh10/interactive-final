import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        _count: {
          select: {
            comments: true,
            sparks: true,
            ideaSkills: true,
            ideaIndustries: true,
            contributionRequests: true,
            activities: true,
            reports: true,
            bookmarks: true,
          },
        },
        ideaSkills: {
          include: {
            skill: true,
          },
        },
        ideaIndustries: {
          include: {
            industry: true,
          },
        },
        attachments: true,
      },
    })

    if (!idea) {
      return NextResponse.json({ message: "Idea not found" }, { status: 404 })
    }

    // Check if the user can access this idea
    if (idea.visibility === "PRIVATE" && idea.authorId !== session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(idea)
  } catch (error) {
    console.error("Error fetching idea:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
      select: { authorId: true },
    })

    if (!idea) {
      return NextResponse.json({ message: "Idea not found" }, { status: 404 })
    }

    if (idea.authorId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const updatedIdea = await prisma.idea.update({
      where: { id: params.id },
      data,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(updatedIdea)
  } catch (error) {
    console.error("Error updating idea:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
      select: { authorId: true },
    })

    if (!idea) {
      return NextResponse.json({ message: "Idea not found" }, { status: 404 })
    }

    if (idea.authorId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { visibility } = data

    if (!visibility || !["PUBLIC", "PRIVATE"].includes(visibility)) {
      return NextResponse.json({ message: "Invalid visibility value" }, { status: 400 })
    }

    const updatedIdea = await prisma.idea.update({
      where: { id: params.id },
      data: { visibility },
      select: {
        id: true,
        visibility: true,
      },
    })

    return NextResponse.json(updatedIdea)
  } catch (error) {
    console.error("Error updating idea visibility:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
      select: { authorId: true },
    })

    if (!idea) {
      return NextResponse.json({ message: "Idea not found" }, { status: 404 })
    }

    if (idea.authorId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await prisma.idea.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Idea deleted successfully" })
  } catch (error) {
    console.error("Error deleting idea:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
