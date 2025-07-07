import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}

// Error handling middleware
prisma.$use(async (params, next) => {
  try {
    const result = await next(params)
    return result
  } catch (error: any) {
    console.error(`Prisma Error: ${error.message}`)
    console.error(`Query Params:`, params)
    throw error
  }
})
