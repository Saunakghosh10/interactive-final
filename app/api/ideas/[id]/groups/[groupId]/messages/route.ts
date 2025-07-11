import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// Send a message to the group
export async function POST(
  req: Request,
  { params }: { params: { id: string; groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { content } = await req.json()
    if (!content?.trim()) {
      return new NextResponse("Message content is required", { status: 400 })
    }

    // Check if the user is a member of the group
    const member = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: params.groupId,
        },
      },
    })

    if (!member) {
      return new NextResponse("You must be a member of the group to send messages", { status: 403 })
    }

    const message = await prisma.groupMessage.create({
      data: {
        content,
        userId: session.user.id,
        groupId: params.groupId,
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

    return NextResponse.json(message)
  } catch (error) {
    console.error("[GROUP_MESSAGE_SEND_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// Get messages for a group
export async function GET(
  req: Request,
  { params }: { params: { id: string; groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if the user is a member of the group
    const member = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: params.groupId,
        },
      },
    })

    if (!member) {
      return new NextResponse("You must be a member of the group to view messages", { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const cursor = searchParams.get("cursor")
    const limit = parseInt(searchParams.get("limit") || "50")

    const messages = await prisma.groupMessage.findMany({
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        groupId: params.groupId,
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
      orderBy: {
        createdAt: "desc",
      },
    })

    let nextCursor: typeof cursor = null
    if (messages.length === limit) {
      nextCursor = messages[messages.length - 1].id
    }

    return NextResponse.json({
      messages,
      nextCursor,
    })
  } catch (error) {
    console.error("[GROUP_MESSAGES_GET_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 