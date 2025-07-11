import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { findSkillMatches } from "@/lib/skill-matching"

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
        ideaSkills: {
          include: {
            skill: true,
          },
        },
      },
    })

    if (!idea) {
      return new NextResponse("Idea not found", { status: 404 })
    }

    if (idea.authorId !== session.user.id) {
      return new NextResponse("Only the idea owner can view skill matches", { status: 403 })
    }

    const requiredSkills = idea.ideaSkills.map((s) => s.skill.name)
    const matches = await findSkillMatches(params.id, requiredSkills)

    return NextResponse.json(matches)
  } catch (error) {
    console.error("[SKILL_MATCHES_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 