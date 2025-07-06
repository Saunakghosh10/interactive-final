import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ideaId = params.id
    const session = await getServerSession(authOptions)

    // First fetch the idea without incrementing view count
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true,
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

    // Check if idea is private and user is not the owner
    if (idea.visibility === "PRIVATE" && session?.user?.id !== idea.authorId) {
      return NextResponse.json({ message: "Idea not found" }, { status: 404 })
    }

    // Only increment view count if the viewer is not the author
    if (session?.user?.id !== idea.authorId) {
      await prisma.idea.update({
        where: { id: ideaId },
        data: { viewCount: { increment: 1 } },
      })
    }

    return NextResponse.json(idea)
  } catch (error) {
    console.error("Error fetching idea:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
    })

    if (!idea) {
      return new NextResponse("Idea not found", { status: 404 })
    }

    if (idea.authorId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const body = await req.json()

    const updatedIdea = await prisma.idea.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        tags: body.tags || [],
        attachments: {
          deleteMany: {},
          create: body.media?.map((m: { url: string; type: string }) => ({
            url: m.url,
            type: m.type,
          })) || [],
        },
        updatedAt: new Date(),
      },
      include: {
        attachments: true,
      },
    })

    return NextResponse.json(updatedIdea)
  } catch (error) {
    console.error("[IDEA_UPDATE_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
