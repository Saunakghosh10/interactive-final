import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { message } = await req.json()
    if (!message?.trim()) {
      return new NextResponse("Message is required", { status: 400 })
    }

    // Check if idea exists and get author
    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
      select: { 
        id: true,
        authorId: true,
        title: true,
        author: {
          select: {
            name: true
          }
        }
      },
    })

    if (!idea) {
      return new NextResponse("Idea not found", { status: 404 })
    }

    // Prevent self-contribution requests
    if (idea.authorId === session.user.id) {
      return new NextResponse("Cannot request to contribute to your own idea", { status: 400 })
    }

    // Check for existing request
    const existingRequest = await prisma.contributionRequest.findFirst({
      where: {
        ideaId: params.id,
          userId: session.user.id,
        status: "PENDING",
      },
    })

    if (existingRequest) {
      return new NextResponse("Contribution request already exists", { status: 400 })
    }

    // Create contribution request
    const contributionRequest = await prisma.contributionRequest.create({
      data: {
        ideaId: params.id,
        userId: session.user.id,
        message: message.trim(),
        status: "PENDING",
      },
    })

    // Create activity record
    await prisma.activity.create({
      data: {
        type: "CONTRIBUTION_REQUESTED",
        description: `Requested to contribute to "${idea.title}"`,
        ideaId: params.id,
        userId: session.user.id,
        metadata: {
          requestId: contributionRequest.id,
          message: message.trim(),
          ideaTitle: idea.title,
          authorName: idea.author.name
        },
      },
    })

    return NextResponse.json(contributionRequest)
  } catch (error) {
    console.error("[CONTRIBUTION_REQUEST_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Find the contribution request
    const contributionRequest = await prisma.contributionRequest.findFirst({
      where: {
        ideaId: params.id,
        userId: session.user.id,
        status: "PENDING",
      },
      include: {
        idea: {
          select: {
            title: true,
            author: {
              select: {
                name: true
              }
            }
          },
        },
      },
    })

    if (!contributionRequest) {
      return new NextResponse("Contribution request not found", { status: 404 })
    }

    // Delete the request
    await prisma.contributionRequest.delete({
      where: { id: contributionRequest.id },
    })

    // Create activity record for withdrawal
    await prisma.activity.create({
      data: {
        type: "CONTRIBUTION_WITHDRAWN",
        description: `Withdrew contribution request for "${contributionRequest.idea.title}"`,
        ideaId: params.id,
        userId: session.user.id,
        metadata: {
          requestId: contributionRequest.id,
          ideaTitle: contributionRequest.idea.title,
          authorName: contributionRequest.idea.author.name
        },
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[CONTRIBUTION_REQUEST_DELETE_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const contributionRequest = await prisma.contributionRequest.findFirst({
      where: {
        ideaId: params.id,
        userId: session.user.id,
        status: "PENDING",
      },
    })

    return NextResponse.json({ hasRequested: !!contributionRequest })
  } catch (error) {
    console.error("[CONTRIBUTION_REQUEST_CHECK_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
