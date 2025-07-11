import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// Add a member to the group
export async function POST(
  req: Request,
  { params }: { params: { id: string; groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { userId, role = "MEMBER" } = await req.json()
    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 })
    }

    // Check if the group exists and the user has permission
    const group = await prisma.ideaGroup.findUnique({
      where: { id: params.groupId },
      include: {
        idea: {
          include: {
            contributionRequests: {
              where: {
                userId: session.user.id,
                status: "ACCEPTED",
              },
            },
          },
        },
        members: {
          where: {
            userId: session.user.id,
            role: { in: ["OWNER", "ADMIN"] },
          },
        },
      },
    })

    if (!group) {
      return new NextResponse("Group not found", { status: 404 })
    }

    // Only allow idea owner, group owner/admin, or accepted contributors to add members
    if (
      group.idea.authorId !== session.user.id &&
      group.members.length === 0 &&
      group.idea.contributionRequests.length === 0
    ) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Check if the user to be added is an accepted contributor or the idea owner
    const isValidMember = await prisma.idea.findFirst({
      where: {
        id: params.id,
        OR: [
          { authorId: userId },
          {
            contributionRequests: {
              some: {
                userId,
                status: "ACCEPTED",
              },
            },
          },
        ],
      },
    })

    if (!isValidMember) {
      return new NextResponse(
        "User must be an accepted contributor or the idea owner",
        { status: 400 }
      )
    }

    const member = await prisma.groupMember.create({
      data: {
        userId,
        groupId: params.groupId,
        role,
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

    return NextResponse.json(member)
  } catch (error) {
    console.error("[GROUP_MEMBER_ADD_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// Remove a member from the group
export async function DELETE(
  req: Request,
  { params }: { params: { id: string; groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 })
    }

    // Check if the group exists and the user has permission
    const group = await prisma.ideaGroup.findUnique({
      where: { id: params.groupId },
      include: {
        idea: true,
        members: {
          where: {
            userId: session.user.id,
            role: { in: ["OWNER", "ADMIN"] },
          },
        },
      },
    })

    if (!group) {
      return new NextResponse("Group not found", { status: 404 })
    }

    // Only allow idea owner, group owner/admin to remove members
    if (group.idea.authorId !== session.user.id && group.members.length === 0) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Cannot remove the group owner
    const memberToRemove = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: params.groupId,
        },
      },
    })

    if (!memberToRemove) {
      return new NextResponse("Member not found", { status: 404 })
    }

    if (memberToRemove.role === "OWNER") {
      return new NextResponse("Cannot remove the group owner", { status: 400 })
    }

    await prisma.groupMember.delete({
      where: {
        userId_groupId: {
          userId,
          groupId: params.groupId,
        },
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[GROUP_MEMBER_REMOVE_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// Get all members of a group
export async function GET(
  req: Request,
  { params }: { params: { id: string; groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if the user is a member of the group or the idea owner
    const group = await prisma.ideaGroup.findUnique({
      where: { id: params.groupId },
      include: {
        idea: true,
        members: {
          where: {
            userId: session.user.id,
          },
        },
      },
    })

    if (!group) {
      return new NextResponse("Group not found", { status: 404 })
    }

    if (
      group.idea.authorId !== session.user.id &&
      group.members.length === 0
    ) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const members = await prisma.groupMember.findMany({
      where: { groupId: params.groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: [
        { role: "asc" },
        { joinedAt: "asc" },
      ],
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error("[GROUP_MEMBERS_GET_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 