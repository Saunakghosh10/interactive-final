import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const bookmark = await prisma.bookmark.findFirst({
      where: {
        ideaId: params.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ hasBookmarked: !!bookmark })
  } catch (error) {
    console.error("[BOOKMARK_CHECK_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 