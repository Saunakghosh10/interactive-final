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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")

    const projects = await prisma.project.findMany({
      where: {
        authorId: params.id
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        status: true,
        _count: {
          select: {
            collaborations: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: limit
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching user projects:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 