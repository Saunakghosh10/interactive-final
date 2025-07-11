import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// Get a single contributor post
export async function GET(
  req: Request,
  { params }: { params: { id: string; postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const post = await prisma.contributorPost.findUnique({
      where: { id: params.postId },
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
    })

    if (!post) {
      return new NextResponse("Post not found", { status: 404 })
    }

    // Check access based on visibility
    if (post.visibility === "GROUP") {
      const member = await prisma.groupMember.findUnique({
        where: {
          userId_groupId: {
            userId: session.user.id,
            groupId: post.groupId!,
          },
        },
      })

      if (!member) {
        return new NextResponse("You must be a member of the group to view this post", { status: 403 })
      }
    } else if (post.visibility === "IDEA") {
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

      if (!idea || (idea.authorId !== session.user.id && idea.contributionRequests.length === 0)) {
        return new NextResponse("You must be a contributor to view this post", { status: 403 })
      }
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("[CONTRIBUTOR_POST_GET_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// Update a contributor post
export async function PATCH(
  req: Request,
  { params }: { params: { id: string; postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { title, content, visibility } = await req.json()
    if (!title?.trim()) {
      return new NextResponse("Title is required", { status: 400 })
    }

    if (!content?.trim()) {
      return new NextResponse("Content is required", { status: 400 })
    }

    const post = await prisma.contributorPost.findUnique({
      where: { id: params.postId },
      include: {
        idea: {
          select: {
            title: true,
          },
        },
      },
    })

    if (!post) {
      return new NextResponse("Post not found", { status: 404 })
    }

    if (post.userId !== session.user.id) {
      return new NextResponse("Only the author can update this post", { status: 403 })
    }

    const updatedPost = await prisma.contributorPost.update({
      where: { id: params.postId },
      data: {
        title: title.trim(),
        content: content.trim(),
        visibility,
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
        type: "CONTRIBUTOR_POST_UPDATED",
        description: `Updated post "${title.trim()}" for idea "${post.idea.title}"`,
        userId: session.user.id,
        ideaId: params.id,
        metadata: {
          postId: post.id,
          postTitle: title.trim(),
          ideaTitle: post.idea.title,
          visibility,
        },
      },
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error("[CONTRIBUTOR_POST_UPDATE_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// Delete a contributor post
export async function DELETE(
  req: Request,
  { params }: { params: { id: string; postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const post = await prisma.contributorPost.findUnique({
      where: { id: params.postId },
      include: {
        idea: {
          select: {
            title: true,
          },
        },
      },
    })

    if (!post) {
      return new NextResponse("Post not found", { status: 404 })
    }

    if (post.userId !== session.user.id) {
      return new NextResponse("Only the author can delete this post", { status: 403 })
    }

    await prisma.contributorPost.delete({
      where: { id: params.postId },
    })

    // Create activity record
    await prisma.activity.create({
      data: {
        type: "CONTRIBUTOR_POST_DELETED",
        description: `Deleted post "${post.title}" from idea "${post.idea.title}"`,
        userId: session.user.id,
        ideaId: params.id,
        metadata: {
          postId: post.id,
          postTitle: post.title,
          ideaTitle: post.idea.title,
        },
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[CONTRIBUTOR_POST_DELETE_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 