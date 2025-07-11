import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Only allow users to view their own contributions
    if (session.user.id !== params.id) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const contributionRequests = await prisma.contributionRequest.findMany({
      where: {
        userId: params.id,
      },
      include: {
        idea: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            ideaSkills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Group requests by status
    const groupedRequests = {
      pending: contributionRequests.filter(req => req.status === "PENDING"),
      accepted: contributionRequests.filter(req => req.status === "ACCEPTED"),
      rejected: contributionRequests.filter(req => req.status === "REJECTED"),
      withdrawn: contributionRequests.filter(req => req.status === "WITHDRAWN"),
    }

    return NextResponse.json(groupedRequests)
  } catch (error) {
    console.error("[CONTRIBUTION_REQUESTS_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 