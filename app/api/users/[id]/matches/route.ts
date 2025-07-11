import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { findIdeasForUser } from "@/lib/skill-matching"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Users can only view their own matches
    if (session.user.id !== params.id) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const matches = await findIdeasForUser(params.id)
    return NextResponse.json(matches)
  } catch (error) {
    console.error("[USER_MATCHES_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 