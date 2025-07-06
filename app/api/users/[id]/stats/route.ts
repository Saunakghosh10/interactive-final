import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get user stats
    const [
      projectCount,
      collaborationCount,
      ideasCount,
      followersLastMonth,
      followersLastTwoMonths
    ] = await Promise.all([
      prisma.project.count({
        where: { authorId: params.id }
      }),
      prisma.collaboration.count({
        where: { userId: params.id }
      }),
      prisma.idea.count({
        where: { authorId: params.id }
      }),
      prisma.follow.count({
        where: {
          followingId: params.id,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      prisma.follow.count({
        where: {
          followingId: params.id,
          createdAt: {
            gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // Last 60 days
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    // Calculate network growth
    const networkGrowth = followersLastTwoMonths === 0 
      ? followersLastMonth === 0 ? "0%" : "+100%" 
      : `${Math.round((followersLastMonth - followersLastTwoMonths) / followersLastTwoMonths * 100)}%`

    return NextResponse.json({
      projectCount,
      collaborationCount,
      ideasCount,
      networkGrowth: networkGrowth.startsWith("-") ? networkGrowth : "+" + networkGrowth
    })
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 