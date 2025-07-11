import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// Create a new contributor post
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { title, content, visibility, groupId } = await req.json()
    if (!title?.trim()) {
      return new NextResponse("Title is required", { status: 400 })
    }

    if (!content?.trim()) {
      return new NextResponse("Content is required", { status: 400 })
    }

    // Check if the user is a contributor or owner of the idea
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

    if (idea.authorId !== session.user.id && idea.contributionRequests.length === 0) {
      return new NextResponse("Only contributors can create posts", { status: 403 })
    }

    // If posting to a group, verify group membership
    if (groupId) {
      const member = await prisma.groupMember.findUnique({
        where: {
          userId_groupId: {
            userId: session.user.id,
            groupId,
          },
        },
      })

      if (!member) {
        return new NextResponse("You must be a member of the group to post", { status: 403 })
      }
    }

    const post = await prisma.contributorPost.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        visibility,
        groupId,
        userId: session.user.id,
        ideaId: params.id,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Create activity record
    await prisma.activity.create({
      data: {
        type: "CONTRIBUTOR_POST_CREATED",
        description: `Created a post "${title.trim()}" for idea "${idea.title}"`,
        userId: session.user.id,
        ideaId: params.id,
        metadata: {
          postId: post.id,
          postTitle: title.trim(),
          ideaTitle: idea.title,
          visibility,
          groupId,
        },
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error("[CONTRIBUTOR_POST_CREATE_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// Get contributor posts for an idea
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const groupId = searchParams.get("groupId")
    const cursor = searchParams.get("cursor")
    const limit = parseInt(searchParams.get("limit") || "10")

    // Check user's access level
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

    const isContributor = idea.authorId === session.user.id || idea.contributionRequests.length > 0

    // Build query conditions based on access level
    const conditions: any = {
      ideaId: params.id,
      status: "PUBLISHED",
      OR: [
        { visibility: "PUBLIC" },
        isContributor ? { visibility: "IDEA" } : {},
      ],
    }

    // If requesting group posts, verify membership
    if (groupId) {
      const member = await prisma.groupMember.findUnique({
        where: {
          userId_groupId: {
            userId: session.user.id,
            groupId,
          },
        },
      })

      if (!member) {
        return new NextResponse("You must be a member of the group to view posts", { status: 403 })
      }

      conditions.groupId = groupId
      conditions.OR.push({ visibility: "GROUP" })
    }

    const posts = await prisma.contributorPost.findMany({
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      where: conditions,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            comments: true,
            sparks: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    let nextCursor: typeof cursor = null
    if (posts.length === limit) {
      nextCursor = posts[posts.length - 1].id
    }

    return NextResponse.json({
      posts,
      nextCursor,
    })
  } catch (error) {
    console.error("[CONTRIBUTOR_POSTS_GET_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 