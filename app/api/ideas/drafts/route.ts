import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Check if draft already exists for this user
    const existingDraft = await prisma.ideaDraft.findFirst({
      where: { authorId: session.user.id },
    })

    if (existingDraft) {
      // Update existing draft
      const updatedDraft = await prisma.ideaDraft.update({
        where: { id: existingDraft.id },
        data: {
          title: data.title,
          description: data.description,
          content: data.content,
          category: data.category,
          visibility: data.visibility,
          tags: data.tags || [],
          skills: data.skills?.map((s: any) => s.name) || [],
          industries: data.industries?.map((i: any) => i.name) || [],
        },
      })
      return NextResponse.json(updatedDraft)
    } else {
      // Create new draft
      const draft = await prisma.ideaDraft.create({
        data: {
          title: data.title,
          description: data.description,
          content: data.content,
          category: data.category,
          visibility: data.visibility,
          tags: data.tags || [],
          skills: data.skills?.map((s: any) => s.name) || [],
          industries: data.industries?.map((i: any) => i.name) || [],
          authorId: session.user.id,
        },
      })
      return NextResponse.json(draft, { status: 201 })
    }
  } catch (error) {
    console.error("Error saving draft:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
