import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const [total, featured, thisWeek] = await Promise.all([
      prisma.idea.count({
        where: {
          status: "PUBLISHED",
          visibility: "PUBLIC",
        },
      }),
      prisma.idea.count({
        where: {
          status: "PUBLISHED",
          visibility: "PUBLIC",
          featured: true,
        },
      }),
      prisma.idea.count({
        where: {
          status: "PUBLISHED",
          visibility: "PUBLIC",
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ])

    return NextResponse.json({
      total,
      featured,
      thisWeek,
    })
  } catch (error) {
    console.error("Error fetching idea stats:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
