import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
      select: { authorId: true },
    })

    if (!idea) {
      return NextResponse.json({ message: "Idea not found" }, { status: 404 })
    }

    if (idea.authorId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { visibility } = data

    if (!visibility || !["PUBLIC", "PRIVATE"].includes(visibility)) {
      return NextResponse.json({ message: "Invalid visibility value" }, { status: 400 })
    }

    const updatedIdea = await prisma.idea.update({
      where: { id: params.id },
      data: { visibility },
      select: {
        id: true,
        title: true,
        visibility: true,
      },
    })

    return NextResponse.json(updatedIdea)
  } catch (error) {
    console.error("Error updating idea visibility:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 