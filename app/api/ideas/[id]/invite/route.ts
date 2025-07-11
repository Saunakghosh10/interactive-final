import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// Mark route as dynamic
export const dynamic = "force-dynamic"

// Send a contribution invitation to a user
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { userId, message, requiredSkills } = await req.json()
    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 })
    }

    if (!message?.trim()) {
      return new NextResponse("Message is required", { status: 400 })
    }

    if (!requiredSkills?.length) {
      return new NextResponse("At least one required skill is required", { status: 400 })
    }

    // Check if idea exists and user is the author
    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        authorId: true,
        title: true,
        author: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!idea) {
      return new NextResponse("Idea not found", { status: 404 })
    }

    if (idea.authorId !== session.user.id) {
      return new NextResponse("Only the idea owner can send contribution invitations", { status: 403 })
    }

    // Check if the invited user exists
    const invitedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
      },
    })

    if (!invitedUser) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Check for existing request
    const existingRequest = await prisma.contributionRequest.findFirst({
      where: {
        ideaId: params.id,
        userId: userId,
        status: { in: ["PENDING", "ACCEPTED"] },
      },
    })

    if (existingRequest) {
      return new NextResponse(
        existingRequest.status === "PENDING"
          ? "User already has a pending contribution request"
          : "User is already a contributor",
        { status: 400 }
      )
    }

    // Create contribution request
    const contributionRequest = await prisma.contributionRequest.create({
      data: {
        ideaId: params.id,
        userId: userId,
        message: message.trim(),
        skills: requiredSkills,
        status: "PENDING",
        initiatedByOwner: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
    })

    // Create notification for invited user
    await prisma.notification.create({
      data: {
        userId: userId,
        type: "CONTRIBUTION_REQUEST",  // Changed from CONTRIBUTION_INVITATION to match NotificationType enum
        title: "New Contribution Invitation",
        message: `${idea.author.name} invited you to contribute to "${idea.title}"`,
        metadata: {
          ideaId: params.id,
          ideaTitle: idea.title,
          requestId: contributionRequest.id,
          authorId: session.user.id,
          authorName: idea.author.name,
          message: message.trim(),
          skills: requiredSkills,
        },
      },
    })

    // Create activity record
    await prisma.activity.create({
      data: {
        type: "CONTRIBUTION_INVITED",
        description: `Invited ${invitedUser.name} to contribute to "${idea.title}"`,
        ideaId: params.id,
        userId: session.user.id,
        metadata: {
          requestId: contributionRequest.id,
          message: message.trim(),
          skills: requiredSkills,
          ideaTitle: idea.title,
          invitedUserId: userId,
          invitedUserName: invitedUser.name,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: contributionRequest,
      message: "Invitation sent successfully"
    })
  } catch (error) {
    console.error("[CONTRIBUTION_INVITE_ERROR]", error)
    return NextResponse.json({
      success: false,
      error: "Failed to send invitation. Please try again."
    }, { status: 500 })
  }
}

// Get all contribution invitations for an idea
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if idea exists and user is the author
    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        authorId: true,
      },
    })

    if (!idea) {
      return new NextResponse("Idea not found", { status: 404 })
    }

    if (idea.authorId !== session.user.id) {
      return new NextResponse("Only the idea owner can view contribution invitations", { status: 403 })
    }

    const invitations = await prisma.contributionRequest.findMany({
      where: {
        ideaId: params.id,
        initiatedByOwner: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
      orderBy: [
        { status: "asc" }, // Show pending first
        { createdAt: "desc" }, // Then by date
      ],
    })

    return NextResponse.json(invitations)
  } catch (error) {
    console.error("[CONTRIBUTION_INVITES_GET_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// Cancel a contribution invitation
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const requestId = searchParams.get("requestId")
    if (!requestId) {
      return new NextResponse("Request ID is required", { status: 400 })
    }

    // Check if idea exists and user is the author
    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        authorId: true,
        title: true,
      },
    })

    if (!idea) {
      return new NextResponse("Idea not found", { status: 404 })
    }

    if (idea.authorId !== session.user.id) {
      return new NextResponse("Only the idea owner can cancel contribution invitations", { status: 403 })
    }

    // Find and delete the invitation
    const invitation = await prisma.contributionRequest.findFirst({
      where: {
        id: requestId,
        ideaId: params.id,
        initiatedByOwner: true,
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!invitation) {
      return new NextResponse("Invitation not found", { status: 404 })
    }

    await prisma.contributionRequest.delete({
      where: { id: requestId },
    })

    // Create activity record
    await prisma.activity.create({
      data: {
        type: "CONTRIBUTION_INVITATION_CANCELLED",
        description: `Cancelled contribution invitation for ${invitation.user.name} to "${idea.title}"`,
        ideaId: params.id,
        userId: session.user.id,
        metadata: {
          requestId: invitation.id,
          ideaTitle: idea.title,
          invitedUserId: invitation.userId,
          invitedUserName: invitation.user.name,
        },
      },
    })

    // Create notification for invited user
    await prisma.notification.create({
      data: {
        userId: invitation.userId,
        type: "CONTRIBUTION_INVITATION_CANCELLED",
        title: "Contribution Invitation Cancelled",
        message: `Your invitation to contribute to "${idea.title}" has been cancelled`,
        metadata: {
          ideaId: params.id,
          ideaTitle: idea.title,
          requestId: invitation.id,
          authorId: session.user.id,
        },
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[CONTRIBUTION_INVITE_CANCEL_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 