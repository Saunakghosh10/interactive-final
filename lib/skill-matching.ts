import { prisma } from "@/lib/db"

interface SkillMatch {
  userId: string
  userName: string | null
  userImage: string | null
  matchScore: number
  matchedSkills: {
    name: string
    level: string
  }[]
  additionalSkills: {
    name: string
    level: string
  }[]
}

export async function findSkillMatches(
  ideaId: string,
  requiredSkills: string[],
  limit: number = 10
): Promise<SkillMatch[]> {
  // Get all users with their skills
  const users = await prisma.user.findMany({
    where: {
      skills: {
        some: {
          skill: {
            name: {
              in: requiredSkills,
            },
          },
        },
      },
      NOT: {
        OR: [
          // Exclude users who already have a contribution request
          {
            contributionRequests: {
              some: {
                ideaId,
                status: { in: ["PENDING", "ACCEPTED"] },
              },
            },
          },
          // Exclude the idea owner
          {
            ideas: {
              some: {
                id: ideaId,
              },
            },
          },
        ],
      },
    },
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
  })

  // Calculate match scores
  const matches: SkillMatch[] = users.map((user) => {
    const userSkills = user.skills.map((s) => ({
      name: s.skill.name,
      level: s.level,
    }))

    const matchedSkills = userSkills.filter((s) =>
      requiredSkills.includes(s.name)
    )

    const additionalSkills = userSkills.filter(
      (s) => !requiredSkills.includes(s.name)
    )

    // Calculate match score based on:
    // 1. Number of matched skills
    // 2. Skill levels
    // 3. Additional relevant skills
    const matchScore =
      (matchedSkills.length / requiredSkills.length) * 0.7 + // 70% weight for required skills
      (matchedSkills.reduce(
        (sum, skill) => sum + getSkillLevelScore(skill.level),
        0
      ) /
        (matchedSkills.length || 1)) *
        0.2 + // 20% weight for skill levels
      Math.min(additionalSkills.length / 5, 1) * 0.1 // 10% weight for additional skills (max 5)

    return {
      userId: user.id,
      userName: user.name,
      userImage: user.image,
      matchScore,
      matchedSkills,
      additionalSkills,
    }
  })

  // Sort by match score and limit results
  return matches
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit)
}

function getSkillLevelScore(level: string): number {
  switch (level) {
    case "EXPERT":
      return 1.0
    case "ADVANCED":
      return 0.8
    case "INTERMEDIATE":
      return 0.6
    case "BEGINNER":
      return 0.4
    default:
      return 0.2
  }
}

export async function findIdeasForUser(
  userId: string,
  limit: number = 10
): Promise<{
  id: string
  title: string
  matchScore: number
  requiredSkills: string[]
  matchedSkills: string[]
}[]> {
  // Get user's skills
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      skills: {
        include: {
          skill: true,
        },
      },
    },
  })

  if (!user) return []

  const userSkills = user.skills.map((s) => s.skill.name)

  // Find ideas that match user's skills
  const ideas = await prisma.idea.findMany({
    where: {
      status: "PUBLISHED",
      visibility: "PUBLIC",
      NOT: {
        OR: [
          // Exclude user's own ideas
          { authorId: userId },
          // Exclude ideas where user already has a contribution request
          {
            contributionRequests: {
              some: {
                userId,
                status: { in: ["PENDING", "ACCEPTED"] },
              },
            },
          },
        ],
      },
      ideaSkills: {
        some: {
          skill: {
            name: {
              in: userSkills,
            },
          },
        },
      },
    },
    select: {
      id: true,
      title: true,
      ideaSkills: {
        include: {
          skill: true,
        },
      },
    },
  })

  // Calculate match scores
  const matches = ideas.map((idea) => {
    const requiredSkills = idea.ideaSkills.map((s) => s.skill.name)
    const matchedSkills = userSkills.filter((s) =>
      requiredSkills.includes(s)
    )

    const matchScore =
      matchedSkills.length / requiredSkills.length * 0.7 + // 70% weight for skill match ratio
      Math.min(matchedSkills.length / 5, 1) * 0.3 // 30% weight for absolute number of matched skills (max 5)

    return {
      id: idea.id,
      title: idea.title,
      matchScore,
      requiredSkills,
      matchedSkills,
    }
  })

  // Sort by match score and limit results
  return matches
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit)
} 