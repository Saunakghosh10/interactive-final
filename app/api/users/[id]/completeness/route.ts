import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const userId = params.id

    if (!session || session.user?.id !== userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { completeness } = await request.json()

    await prisma.user.update({
      where: { id: userId },
      data: { profileCompleteness: completeness },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating completeness:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
