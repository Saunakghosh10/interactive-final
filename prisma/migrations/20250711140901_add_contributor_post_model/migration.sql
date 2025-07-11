-- CreateEnum
CREATE TYPE "ContributorPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContributorPostVisibility" AS ENUM ('GROUP', 'IDEA', 'PUBLIC');

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "contributorPostId" TEXT;

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "contributorPostId" TEXT;

-- AlterTable
ALTER TABLE "Spark" ADD COLUMN     "contributorPostId" TEXT;

-- CreateTable
CREATE TABLE "ContributorPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "ContributorPostStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "ContributorPostVisibility" NOT NULL DEFAULT 'GROUP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "groupId" TEXT,

    CONSTRAINT "ContributorPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContributorPost_userId_idx" ON "ContributorPost"("userId");

-- CreateIndex
CREATE INDEX "ContributorPost_ideaId_idx" ON "ContributorPost"("ideaId");

-- CreateIndex
CREATE INDEX "ContributorPost_groupId_idx" ON "ContributorPost"("groupId");

-- CreateIndex
CREATE INDEX "ContributorPost_createdAt_idx" ON "ContributorPost"("createdAt");

-- AddForeignKey
ALTER TABLE "Spark" ADD CONSTRAINT "Spark_contributorPostId_fkey" FOREIGN KEY ("contributorPostId") REFERENCES "ContributorPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_contributorPostId_fkey" FOREIGN KEY ("contributorPostId") REFERENCES "ContributorPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_contributorPostId_fkey" FOREIGN KEY ("contributorPostId") REFERENCES "ContributorPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributorPost" ADD CONSTRAINT "ContributorPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributorPost" ADD CONSTRAINT "ContributorPost_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributorPost" ADD CONSTRAINT "ContributorPost_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "IdeaGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
