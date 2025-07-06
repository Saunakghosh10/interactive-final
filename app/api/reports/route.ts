import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { targetId, targetType, reason, description } = await request.json()

    if (!targetId || !targetType || !reason) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const validTargetTypes = ["user", "idea", "comment"]
    const validReasons = [
      "SPAM",
      "INAPPROPRIATE_CONTENT",
      "HARASSMENT",
      "COPYRIGHT_VIOLATION",
      "MISINFORMATION",
      "OTHER",
    ]

    if (!validTargetTypes.includes(targetType) || !validReasons.includes(reason)) {
      return NextResponse.json({ message: "Invalid target type or reason" }, { status: 400 })
    }

    // Check if already reported by this user
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: session.user.id,
        [`${targetType}Id`]: targetId,
      },
    })

    if (existingReport) {
      return NextResponse.json({ message: "Already reported" }, { status: 400 })
    }

    const reportData: any = {
      reason,
      description: description?.trim() || null,
      reporterId: session.user.id,
    }

    // Set the appropriate target field
    if (targetType === "user") {
      reportData.userId = targetId
    } else if (targetType === "idea") {
      reportData.ideaId = targetId
    } else if (targetType === "comment") {
      reportData.commentId = targetId
    }

    const report = await prisma.report.create({
      data: reportData,
    })

    return NextResponse.json({ success: true, reportId: report.id })
  } catch (error) {
    console.error("Error creating report:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
