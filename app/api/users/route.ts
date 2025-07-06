import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const filter = searchParams.get("filter") || "all"

    const where: any = {}

    // Add search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        {
          skills: {
            some: {
              skill: {
                name: { contains: search, mode: "insensitive" }
              }
            }
          }
        },
        {
          industries: {
            some: {
              industry: {
                name: { contains: search, mode: "insensitive" }
              }
            }
          }
        }
      ]
    }

    let orderBy: any = { createdAt: "desc" }

    // Add filter
    if (filter === "active") {
      orderBy = [
        { ideas: { _count: "desc" } },
        { projects: { _count: "desc" } }
      ]
    } else if (filter === "new") {
      orderBy = { createdAt: "desc" }
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
        location: true,
        skills: {
          select: {
            skill: {
              select: {
                name: true
              }
            }
          }
        },
        industries: {
          select: {
            industry: {
              select: {
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            followers: true,
            following: true,
            ideas: true,
            projects: true
          }
        }
      },
      orderBy,
      take: 50
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 