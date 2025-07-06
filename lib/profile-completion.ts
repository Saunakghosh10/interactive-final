interface User {
  name?: string | null
  username?: string | null
  bio?: string | null
  image?: string | null
  location?: string | null
  website?: string | null
  skills?: { skill: { name: string } }[]
  industries?: { industry: { name: string } }[]
}

export function calculateProfileCompleteness(user: User): number {
  const fields = [
    { field: user.name, weight: 15 },
    { field: user.username, weight: 10 },
    { field: user.bio, weight: 20 },
    { field: user.image, weight: 15 },
    { field: user.location, weight: 10 },
    { field: user.website, weight: 10 },
    { field: user.skills && user.skills.length > 0, weight: 15 },
    { field: user.industries && user.industries.length > 0, weight: 5 },
  ]

  const completedWeight = fields.reduce((total, { field, weight }) => {
    return total + (field ? weight : 0)
  }, 0)

  return Math.round(completedWeight)
}

export function getProfileCompletionTips(user: User): string[] {
  const tips: string[] = []

  if (!user.name) tips.push("Add your full name")
  if (!user.username) tips.push("Choose a unique username")
  if (!user.bio) tips.push("Write a compelling bio")
  if (!user.image) tips.push("Upload a profile photo")
  if (!user.location) tips.push("Add your location")
  if (!user.website) tips.push("Add your website or portfolio")
  if (!user.skills || user.skills.length === 0) tips.push("Add your skills")
  if (!user.industries || user.industries.length === 0) tips.push("Add your industry")

  return tips
}
