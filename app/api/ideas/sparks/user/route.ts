import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ sparkedIdeas: [] })
    }

    const sparks = await prisma.spark.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        ideaId: true,
      },
    })

    return NextResponse.json({
      sparkedIdeas: sparks.map((spark) => spark.ideaId),
    })
  } catch (error) {
    console.error("Error fetching user sparks:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
} 