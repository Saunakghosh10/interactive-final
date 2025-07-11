import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// Mark route as dynamic
export const dynamic = "force-dynamic"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { status, requestId } = await req.json()
    if (!status || !["ACCEPTED", "REJECTED"].includes(status)) {
      return new NextResponse("Invalid status", { status: 400 })
    }

    if (!requestId) {
      return new NextResponse("Request ID is required", { status: 400 })
    }

    // Find the contribution request
    const contributionRequest = await prisma.contributionRequest.findFirst({
      where: {
        id: requestId,
        ideaId: params.id,
        userId: session.user.id,
        status: "PENDING",
        initiatedByOwner: true,
      },
      include: {
        idea: {
          select: {
            title: true,
            authorId: true,
            author: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    if (!contributionRequest) {
      return new NextResponse("Invitation not found", { status: 404 })
    }

    // Update the request status
    await prisma.contributionRequest.update({
      where: { id: requestId },
      data: { status, respondedAt: new Date() },
    })

    // Create activity record
    await prisma.activity.create({
      data: {
        type: status === "ACCEPTED" ? "CONTRIBUTION_ACCEPTED" : "CONTRIBUTION_WITHDRAWN",
        description: status === "ACCEPTED"
          ? `Accepted invitation to contribute to "${contributionRequest.idea.title}"`
          : `Declined invitation to contribute to "${contributionRequest.idea.title}"`,
        ideaId: params.id,
        userId: session.user.id,
        metadata: {
          requestId: contributionRequest.id,
          ideaTitle: contributionRequest.idea.title,
          authorName: contributionRequest.idea.author.name,
        },
      },
    })

    // Create notification for idea owner
    await prisma.notification.create({
      data: {
        userId: contributionRequest.idea.authorId,
        type: status === "ACCEPTED" ? "CONTRIBUTION_ACCEPTED" : "CONTRIBUTION_REQUEST",
        title: status === "ACCEPTED" ? "Contribution Invitation Accepted" : "Contribution Invitation Declined",
        message: status === "ACCEPTED"
          ? `${session.user.name} accepted your invitation to contribute to "${contributionRequest.idea.title}"`
          : `${session.user.name} declined your invitation to contribute to "${contributionRequest.idea.title}"`,
        metadata: {
          ideaId: params.id,
          ideaTitle: contributionRequest.idea.title,
          requestId: contributionRequest.id,
          userId: session.user.id,
          userName: session.user.name,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: status === "ACCEPTED"
        ? "Invitation accepted successfully"
        : "Invitation declined successfully",
    })
  } catch (error) {
    console.error("[CONTRIBUTION_INVITE_RESPONSE_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 