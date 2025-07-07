import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ideaId = params.id

    const comments = await prisma.comment.findMany({
      where: {
        ideaId,
        parentId: null, // Only top-level comments
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
            replies: {
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
                    replies: true,
                  },
                },
              },
            },
            _count: {
              select: {
                replies: true,
              },
            },
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const ideaId = params.id

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

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

    // Verify idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      select: { id: true }
    })

    if (!idea) {
      return NextResponse.json(
        { message: "Idea not found" },
        { status: 404 }
      )
    }

    const { content, parentId } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ message: "Content is required" }, { status: 400 })
    }

    // If parentId is provided, verify parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true }
      })

      if (!parentComment) {
        return NextResponse.json(
          { message: "Parent comment not found" },
          { status: 404 }
        )
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        authorId: session.user.id,
        ideaId,
        parentId: parentId || null,
      },
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
            replies: true,
          },
        },
      },
    })

    // Create activity
    await prisma.activity.create({
      data: {
        type: "IDEA_COMMENTED",
        description: parentId ? "replied to a comment" : "commented on an idea",
        userId: session.user.id,
        ideaId,
      },
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
