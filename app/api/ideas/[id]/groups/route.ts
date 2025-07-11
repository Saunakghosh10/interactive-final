import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// Create a new group
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { name, description } = await req.json()
    if (!name?.trim()) {
      return new NextResponse("Group name is required", { status: 400 })
    }

    // Check if the idea exists and the user has permission
    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
      include: {
        contributionRequests: {
          where: {
            userId: session.user.id,
            status: "ACCEPTED",
          },
        },
      },
    })

    if (!idea) {
      return new NextResponse("Idea not found", { status: 404 })
    }

    // Only allow idea owner or accepted contributors to create groups
    if (idea.authorId !== session.user.id && idea.contributionRequests.length === 0) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const group = await prisma.ideaGroup.create({
      data: {
        name,
        description,
        ideaId: params.id,
        ownerId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER",
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(group)
  } catch (error) {
    console.error("[GROUP_CREATE_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// Get all groups for an idea
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
      include: {
        contributionRequests: {
          where: {
            userId: session.user.id,
            status: "ACCEPTED",
          },
        },
      },
    })

    if (!idea) {
      return new NextResponse("Idea not found", { status: 404 })
    }

    // Only allow idea owner or accepted contributors to view groups
    if (idea.authorId !== session.user.id && idea.contributionRequests.length === 0) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const groups = await prisma.ideaGroup.findMany({
      where: { ideaId: params.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(groups)
  } catch (error) {
    console.error("[GROUP_GET_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 