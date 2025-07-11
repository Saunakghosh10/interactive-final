import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    // First check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Then fetch their contributions
    const contributions = await prisma.contributionRequest.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        idea: {
          include: {
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

    // Group contributions by status
    const groupedContributions = {
      pending: contributions.filter((c) => c.status === "PENDING"),
      accepted: contributions.filter((c) => c.status === "ACCEPTED"),
      rejected: contributions.filter((c) => c.status === "REJECTED"),
      withdrawn: contributions.filter((c) => c.status === "WITHDRAWN"),
    }

    return NextResponse.json(groupedContributions)
  } catch (error) {
    console.error("Error fetching contributions:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 