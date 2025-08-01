"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loading } from "@/components/ui/loading"
import { VisibilityToggle } from "@/components/ideas/visibility-toggle"
import {
  MessageCircle,
  Share2,
  Eye,
  Calendar,
  Edit,
  Download,
  Building,
  Star,
  User,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { ContributionRequestButton } from "@/components/social/contribution-request-button"
import { CommentSystem } from "@/components/social/comment-system"
import { IdeaMessageBoard } from "@/components/ideas/idea-message-board"
import { ContributionInvites } from "@/components/ideas/contribution-invites"
import { ContributorPosts } from "@/components/ideas/contributor-posts"
import { SparkButton } from "@/components/social/spark-button"
import { BookmarkButton } from "@/components/social/bookmark-button"
import { ReportButton } from "@/components/social/report-button"

interface IdeaData {
  id: string
  title: string
  description: string
  content: string
  category: string
  visibility: "PUBLIC" | "PRIVATE"
  status: string
  viewCount: number
  sparkCount: number
  featured: boolean
  createdAt: string
  authorId: string
  author: {
    id: string
    name: string
    image: string | null
    bio: string | null
  }
  _count: {
    comments: number
    sparks: number
    ideaSkills: number
    ideaIndustries: number
    contributionRequests: number
    activities: number
    reports: number
    bookmarks: number
  }
  ideaSkills: Array<{
    skill: {
      id: string
      name: string
      category: string
    }
  }>
  ideaIndustries: Array<{
    industry: {
      id: string
      name: string
    }
  }>
  attachments: Array<{
    id: string
    filename: string
    fileUrl: string
    fileType: string
  }>
  contributionRequests: Array<{
    id: string
    userId: string
    status: "PENDING" | "ACCEPTED" | "REJECTED"
    createdAt: string
  }>
}

interface Comment {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  isEdited: boolean
  author: {
    id: string
    name?: string | null
    username?: string | null
    image?: string | null
  }
  replies?: Comment[]
  _count: {
    replies: number
  }
}

export default function IdeaDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [idea, setIdea] = useState<IdeaData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasSparked, setHasSparked] = useState(false)
  const [sparkCount, setSparkCount] = useState(0)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])

  const isOwner = Boolean(session?.user?.id && idea?.authorId && session.user.id === idea.authorId)
  const isContributor = Boolean(
    session?.user?.id && 
    idea?.contributionRequests && 
    idea.contributionRequests.some(req => req.userId === session.user?.id && req.status === "ACCEPTED")
  )

  const fetchIdea = async () => {
    try {
      const response = await fetch(`/api/ideas/${id}`)
      if (response.ok) {
        const ideaData = await response.json()
        setIdea(ideaData)
        setSparkCount(ideaData._count.sparks)
      } else {
        router.push("/ideas")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load idea",
        variant: "destructive",
      })
      router.push("/ideas")
    } finally {
      setIsLoading(false)
    }
  }

  const checkUserInteractions = async (ideaId: string) => {
    if (!session?.user?.id) return
    
    try {
      const [sparkResponse, bookmarkResponse] = await Promise.all([
        fetch(`/api/ideas/${ideaId}/spark/check`),
        fetch(`/api/ideas/${ideaId}/bookmark/check`),
      ])

      if (sparkResponse.ok) {
        const { hasSparked } = await sparkResponse.json()
        setHasSparked(hasSparked)
      }

      if (bookmarkResponse.ok) {
        const { isBookmarked } = await bookmarkResponse.json()
        setIsBookmarked(isBookmarked)
      }
    } catch (error) {
      console.error("Error checking user interactions:", error)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/ideas/${id}/comments`)
      if (!response.ok) throw new Error("Failed to fetch comments")
      const data = await response.json()
      setComments(data)
    } catch (error) {
      console.error("[FETCH_COMMENTS_ERROR]", error)
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (id) {
      fetchIdea()
      fetchComments()
    }
  }, [id])

  useEffect(() => {
    if (id && session?.user?.id && idea?.id) {
      checkUserInteractions(idea.id)
    }
  }, [id, session?.user?.id, idea?.id])

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date))
  }

  // Render loading states
  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loading />
          </div>
        </div>
      </div>
    )
  }

  // Render not found state
  if (!idea) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Idea not found
            </h2>
            <p className="text-gray-500 mt-2">
              This idea may have been removed or is no longer available.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="hidden md:flex"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              {idea.featured && (
                <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{idea.title}</h1>
            {isOwner && (
              <div className="flex items-center gap-4">
                <VisibilityToggle
                  ideaId={idea.id}
                  initialVisibility={idea.visibility}
                  onVisibilityChange={(newVisibility) => {
                    setIdea((prev) => prev ? { ...prev, visibility: newVisibility } : null)
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/ideas/${idea.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Idea
                </Button>
              </div>
            )}
          </div>

          <Card className="overflow-hidden border-gray-200 dark:border-gray-800">
            <CardHeader className="bg-white dark:bg-gray-900 px-6 py-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={idea.author.image || undefined} />
                  <AvatarFallback>
                    <User className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {idea.author.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(idea.createdAt)}
                    </span>
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {idea.viewCount} views
                    </span>
                    <Badge variant="secondary" className="capitalize">
                      {idea.category.toLowerCase().replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-6 py-6 space-y-8">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  {idea.description}
                </p>
                {idea.content && (
                  <div className="mt-6" dangerouslySetInnerHTML={{ __html: idea.content }} />
                )}
              </div>

              {/* Skills and Industries */}
              <div className="space-y-4">
                {idea.ideaSkills && idea.ideaSkills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {idea.ideaSkills.map((skill) => (
                        <Badge key={skill.skill.id} variant="secondary">
                          {skill.skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {idea.ideaIndustries && idea.ideaIndustries.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Industries</h4>
                    <div className="flex flex-wrap gap-2">
                      {idea.ideaIndustries.map((industry) => (
                        <Badge key={industry.industry.id} variant="secondary">
                          <Building className="w-3 h-3 mr-1" />
                          {industry.industry.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Attachments */}
              {idea.attachments && idea.attachments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Attachments</h4>
                  <div className="flex flex-wrap gap-2">
                    {idea.attachments.map((attachment) => (
                      <Button
                        key={attachment.id}
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={attachment.fileUrl} target="_blank">
                          <Download className="w-4 h-4 mr-2" />
                          {attachment.filename}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Interactions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center space-x-4">
                  <SparkButton
                    targetId={idea.id}
                    targetType="idea"
                    initialSparked={hasSparked}
                    initialCount={sparkCount}
                    showCount
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950"
                    onClick={() => {
                      const commentSection = document.getElementById("comments")
                      if (commentSection) {
                        commentSection.scrollIntoView({ behavior: "smooth" })
                      }
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {idea._count.comments}
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <ContributionRequestButton
                    ideaId={idea.id}
                    authorId={idea.author.id}
                    disabled={!idea.ideaSkills || idea.ideaSkills.length === 0}
                    requiredSkills={idea.ideaSkills?.map(({ skill }) => ({
                      id: skill.id,
                      name: skill.name,
                      category: skill.category || "Other"
                    }))}
                  />
                  <BookmarkButton
                    ideaId={idea.id}
                    isBookmarked={isBookmarked}
                  />
                  <ReportButton
                    targetId={idea.id}
                    targetType="IDEA"
                    authorId={idea.author.id}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <div id="comments" className="mt-8">
            <CommentSystem
              targetId={idea.id}
              targetType="idea"
              comments={comments}
              onCommentsUpdate={setComments}
            />
          </div>

          {(isContributor || isOwner) && (
            <div className="mt-8">
              <IdeaMessageBoard
                ideaId={idea.id}
                isContributor={isContributor}
                isOwner={isOwner}
              />
            </div>
          )}
          {isOwner && (
            <div className="mt-8">
              <ContributionInvites ideaId={idea.id} />
            </div>
          )}
          <div className="mt-8">
            <ContributorPosts
              ideaId={idea.id}
              isContributor={isContributor}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
