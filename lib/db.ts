import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma

export async function generateUniqueUsername(baseUsername: string): Promise<string> {
  let username = baseUsername
  let counter = 1

  while (true) {
    const exists = await prisma.user.findUnique({
      where: { username },
    })
    if (!exists) break
    username = `${baseUsername}${counter}`
    counter++
  }

  return username
}

export async function createUser(data: any) {
  // Generate username from email if not provided
  if (!data.username) {
    const baseUsername = data.email.split("@")[0]
    data.username = await generateUniqueUsername(baseUsername)
  }

  return prisma.user.create({
    data,
  })
}

export async function updateUser(id: string, data: any) {
  return prisma.user.update({
    where: { id },
    data,
  })
}

// Add other database functions as needed...

// Error handling middleware
prisma.$use(async (params: any, next: (arg0: any) => any) => {
  try {
    const result = await next(params)
    return result
  } catch (error: any) {
    console.error(`Prisma Error: ${error.message}`)
    console.error(`Query Params:`, params)
    throw error
  }
})
