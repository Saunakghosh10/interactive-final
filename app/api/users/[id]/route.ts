import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const userId = params.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        industries: {
          include: {
            industry: true,
          },
        },
        _count: {
          select: {
            projects: true,
            followers: true,
            following: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Check if profile is private and user is not the owner
    if (user.profileVisibility === "PRIVATE" && session?.user?.id !== userId) {
      return NextResponse.json({ message: "Profile is private" }, { status: 403 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const userId = params.id

    if (!session || session.user?.id !== userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const {
      name,
      username,
      bio,
      location,
      website,
      linkedinUrl,
      githubUrl,
      twitterUrl,
      profileVisibility,
      image,
      skills,
      industries,
    } = data

    // Check if username is already taken
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: userId },
        },
      })

      if (existingUser) {
        return NextResponse.json({ message: "Username is already taken" }, { status: 400 })
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        username,
        bio,
        location,
        website,
        linkedinUrl,
        githubUrl,
        twitterUrl,
        profileVisibility,
        image,
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        industries: {
          include: {
            industry: true,
          },
        },
        _count: {
          select: {
            projects: true,
            followers: true,
            following: true,
          },
        },
      },
    })

    // Update skills
    if (skills) {
      // Remove existing skills
      await prisma.userSkill.deleteMany({
        where: { userId },
      })

      // Add new skills
      for (const skill of skills) {
        let skillRecord = await prisma.skill.findFirst({
          where: { name: skill.name },
        })

        if (!skillRecord) {
          skillRecord = await prisma.skill.create({
            data: {
              name: skill.name,
              category: skill.category,
            },
          })
        }

        await prisma.userSkill.create({
          data: {
            userId,
            skillId: skillRecord.id,
          },
        })
      }
    }

    // Update industries
    if (industries) {
      // Remove existing industries
      await prisma.userIndustry.deleteMany({
        where: { userId },
      })

      // Add new industries
      for (const industry of industries) {
        let industryRecord = await prisma.industry.findFirst({
          where: { name: industry.name },
        })

        if (!industryRecord) {
          industryRecord = await prisma.industry.create({
            data: {
              name: industry.name,
            },
          })
        }

        await prisma.userIndustry.create({
          data: {
            userId,
            industryId: industryRecord.id,
          },
        })
      }
    }

    // Fetch updated user with relations
    const finalUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        industries: {
          include: {
            industry: true,
          },
        },
        _count: {
          select: {
            projects: true,
            followers: true,
            following: true,
          },
        },
      },
    })

    return NextResponse.json(finalUser)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
