import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// Mark route as dynamic
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const invites = await prisma.contributionRequest.findMany({
      where: {
        userId: session.user.id,
        initiatedByOwner: true,
        status: "PENDING",
      },
      include: {
        idea: {
          select: {
            id: true,
            title: true,
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(invites)
  } catch (error) {
    console.error("[CONTRIBUTION_INVITES_GET_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 