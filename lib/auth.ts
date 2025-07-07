import type { NextAuthOptions, Session, Account } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./db"
import bcrypt from "bcryptjs"

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Please provide process.env.NEXTAUTH_SECRET")
}

// Function to generate a unique username
async function generateUniqueUsername(baseUsername: string): Promise<string> {
  let username = baseUsername.toLowerCase().replace(/[^a-z0-9]/g, '')
  let counter = 1
  let finalUsername = username

  while (true) {
    const exists = await prisma.user.findUnique({
      where: { username: finalUsername },
    })
    if (!exists) break
    finalUsername = `${username}${counter}`
    counter++
  }

  return finalUsername
}

// Extend the Session type to include our custom properties
interface ExtendedSession extends Session {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    username?: string
    emailVerified?: Date | null
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              password: true,
              emailVerified: true,
              username: true,
            },
          })

          if (!user || !user.password) {
            throw new Error("User not found")
          }

          // Check if email is verified for manual registrations
          if (!user.emailVerified && user.password) {
            throw new Error("Please verify your email before signing in.")
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            throw new Error("Invalid password")
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            username: user.username,
            emailVerified: user.emailVerified,
          }
        } catch (error) {
          console.error("Auth error:", error)
          throw error
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists by email
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { accounts: true },
          })

          if (!existingUser) {
            // Create new user with Google account
            const username = await generateUniqueUsername(user.email!.split("@")[0])
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                username: username,
                image: user.image,
                emailVerified: new Date(),
                accounts: {
                  create: {
                    type: account.type,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    access_token: account.access_token,
                    token_type: account.token_type,
                    scope: account.scope,
                    id_token: account.id_token,
                  },
                },
              },
            })
            return true
          }

          // If user exists but doesn't have a Google account linked
          if (!existingUser.accounts.some((acc: Account) => acc.provider === "google")) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              },
            })
          }

          return true
        } catch (error) {
          console.error("Error in signIn callback:", error)
          return false
        }
      }
      return true
    },
    async session({ session, token }): Promise<ExtendedSession> {
      const extendedSession = session as ExtendedSession
      if (extendedSession?.user && token?.sub) {
        extendedSession.user.id = token.sub
        
        // Get user data from database to ensure we have the most up-to-date information
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { 
            username: true, 
            emailVerified: true,
            name: true,
            email: true,
            image: true,
          },
        })

        if (dbUser) {
          extendedSession.user.username = dbUser.username
          extendedSession.user.emailVerified = dbUser.emailVerified
          extendedSession.user.name = dbUser.name
          extendedSession.user.email = dbUser.email
          extendedSession.user.image = dbUser.image
        }
      }
      return extendedSession
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.uid = user.id
      }
      return token
    },
    redirect({ url, baseUrl }) {
      // Always redirect to dashboard after OAuth sign-in
      if (url.includes("signin") || url.includes("callback")) {
        return `${baseUrl}/dashboard`
      }
      
      // Allow relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      
      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) {
        return url
      }
      
      return `${baseUrl}/dashboard`
    },
  },
  debug: process.env.NODE_ENV === "development",
}
