import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const sort = searchParams.get("sort") || "newest"
    const skills = searchParams.get("skills")?.split(",") || []
    const industries = searchParams.get("industries")?.split(",") || []
    const bookmarked = searchParams.get("bookmarked") === "true"

    const where: any = {
      status: "PUBLISHED",
      OR: [
        { visibility: "PUBLIC" },
        ...(session?.user?.id ? [{ authorId: session.user.id }] : []),
      ],
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ]
    }

    if (category) {
      where.category = category
    }

    if (skills.length > 0) {
      where.ideaSkills = {
        some: {
          skill: {
            name: { in: skills },
          },
        },
      }
    }

    if (industries.length > 0) {
      where.ideaIndustries = {
        some: {
          industry: {
            name: { in: industries },
          },
        },
      }
    }

    // Add bookmark filter if user is authenticated
    if (bookmarked && session?.user?.id) {
      where.bookmarks = {
        some: {
          userId: session.user.id,
        },
      }
    }

    let orderBy: any = { createdAt: "desc" }

    switch (sort) {
      case "oldest":
        orderBy = { createdAt: "asc" }
        break
      case "popular":
        orderBy = { viewCount: "desc" }
        break
      case "featured":
        orderBy = { featured: "desc" }
        break
      case "most_sparked":
        orderBy = { sparkCount: "desc" }
        break
    }

    const ideas = await prisma.idea.findMany({
      where,
      orderBy,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        _count: {
          select: {
            comments: true,
            sparks: true,
            ideaSkills: true,
            ideaIndustries: true,
            contributionRequests: true,
            activities: true,
            reports: true,
            bookmarks: true,
          },
        },
        ideaSkills: {
          include: {
            skill: true,
          },
          take: 5,
        },
        ideaIndustries: {
          include: {
            industry: true,
          },
          take: 3,
        },
        bookmarks: session?.user?.id ? {
          where: {
            userId: session.user.id,
          },
          select: {
            id: true,
          },
        } : false,
      },
      take: 50,
    })

    // Transform the response to include isBookmarked flag
    const transformedIdeas = ideas.map(idea => ({
      ...idea,
      isBookmarked: idea.bookmarks?.length > 0,
      bookmarks: undefined, // Remove the bookmarks array from the response
    }))

    return NextResponse.json(transformedIdeas)
  } catch (error) {
    console.error("Error fetching ideas:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { title, description, content, category, visibility, tags, skills, industries, mediaFiles } = data

    // Create the idea
    const idea = await prisma.idea.create({
      data: {
        title,
        description,
        content,
        category,
        visibility,
        status: "PUBLISHED",
        tags,
        authorId: session.user.id,
        publishedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        _count: {
          select: {
            comments: true,
            sparks: true,
            ideaSkills: true,
            ideaIndustries: true,
            contributionRequests: true,
            activities: true,
            reports: true,
            bookmarks: true,
          },
        },
      },
    })

    // Add skills
    if (skills && skills.length > 0) {
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

        await prisma.ideaSkill.create({
          data: {
            ideaId: idea.id,
            skillId: skillRecord.id,
          },
        })
      }
    }

    // Add industries
    if (industries && industries.length > 0) {
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

        await prisma.ideaIndustry.create({
          data: {
            ideaId: idea.id,
            industryId: industryRecord.id,
          },
        })
      }
    }

    // Add attachments
    if (mediaFiles && mediaFiles.length > 0) {
      for (const file of mediaFiles) {
        await prisma.ideaAttachment.create({
          data: {
            ideaId: idea.id,
            filename: file.name,
            fileUrl: file.url,
            fileType: file.type.toUpperCase(),
            fileSize: file.size,
          },
        })
      }
    }

    // Create activity
    await prisma.activity.create({
      data: {
        type: "IDEA_CREATED",
        description: `Created a new idea: ${title}`,
        userId: session.user.id,
        ideaId: idea.id,
      },
    })

    return NextResponse.json(idea, { status: 201 })
  } catch (error) {
    console.error("Error creating idea:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
