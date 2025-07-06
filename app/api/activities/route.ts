import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get activities from users the current user follows
    const followedUsers = await prisma.follow.findMany({
      where: {
        followerId: session.user.id,
      },
      select: {
        followingId: true,
      },
    })

    const followedUserIds = followedUsers.map((f) => f.followingId)
    followedUserIds.push(session.user.id) // Include own activities

    const activities = await prisma.activity.findMany({
      where: {
        userId: {
          in: followedUserIds,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        idea: {
          select: {
            id: true,
            title: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    })

    // Format activities with metadata
    const formattedActivities = activities.map((activity) => ({
      id: activity.id,
      type: activity.type,
      description: activity.description,
      createdAt: activity.createdAt,
      user: activity.user,
      metadata: {
        ideaId: activity.idea?.id,
        ideaTitle: activity.idea?.title,
        projectId: activity.project?.id,
        projectTitle: activity.project?.title,
        ...activity.metadata,
      },
    }))

    return NextResponse.json(formattedActivities)
  } catch (error) {
    console.error("Error fetching activities:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
