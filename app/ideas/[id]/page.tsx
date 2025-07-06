"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loading } from "@/components/ui/loading"
import {
  Lightbulb,
  MessageCircle,
  Share2,
  Eye,
  Calendar,
  Edit,
  Bookmark,
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

interface IdeaData {
  id: string
  title: string
  description: string
  content: string
  category: string
  visibility: string
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
}

export default function IdeaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [idea, setIdea] = useState<IdeaData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasSparked, setHasSparked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [sparkCount, setSparkCount] = useState(0)
  const [comments, setComments] = useState([])
  const { toast } = useToast()

  useEffect(() => {
    if (params.id) {
      fetchIdea()
      fetchComments()
    }
  }, [params.id])

  const fetchIdea = async () => {
    try {
      const response = await fetch(`/api/ideas/${params.id}`)
      if (response.ok) {
        const ideaData = await response.json()
        setIdea(ideaData)
        setSparkCount(ideaData._count.sparks)
        // Check if user has sparked/bookmarked this idea
        if (session?.user?.id) {
          checkUserInteractions(ideaData.id)
        }
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

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/ideas/${params.id}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      })
    }
  }

  const checkUserInteractions = async (ideaId: string) => {
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

  const handleSpark = async () => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to spark ideas",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/ideas/${params.id}/spark`, {
        method: hasSparked ? "DELETE" : "POST",
      })

      if (response.ok) {
        setHasSparked(!hasSparked)
        setSparkCount(hasSparked ? sparkCount - 1 : sparkCount + 1)
        toast({
          title: hasSparked ? "Spark removed" : "Idea sparked! ⚡",
          description: hasSparked ? "You've removed your spark" : "Thanks for supporting this idea!",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update spark status",
        variant: "destructive",
      })
    }
  }

  const handleBookmark = async () => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to bookmark ideas",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/ideas/${params.id}/bookmark`, {
        method: isBookmarked ? "DELETE" : "POST",
      })

      if (response.ok) {
    setIsBookmarked(!isBookmarked)
    toast({
      title: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
      description: isBookmarked ? "Idea removed from your bookmarks" : "Idea saved to your bookmarks",
    })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bookmark status",
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: idea?.title,
          text: idea?.description,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied!",
        description: "Idea link has been copied to your clipboard",
      })
    }
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" variant="pulse" />
      </div>
    )
  }

  if (!idea) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Idea not found</p>
      </div>
    )
  }

  const isOwnIdea = session?.user?.id === idea.authorId
  const categoryColors = {
    TECHNOLOGY: "from-blue-500 to-cyan-500",
    BUSINESS: "from-green-500 to-emerald-500",
    DESIGN: "from-pink-500 to-rose-500",
    HEALTHCARE: "from-red-500 to-orange-500",
    EDUCATION: "from-indigo-500 to-purple-500",
    ENTERTAINMENT: "from-purple-500 to-violet-500",
    ENVIRONMENT: "from-green-600 to-teal-500",
    SOCIAL_IMPACT: "from-amber-500 to-yellow-500",
    FINANCE: "from-emerald-500 to-green-600",
    LIFESTYLE: "from-violet-500 to-purple-600",
    OTHER: "from-gray-500 to-slate-500",
  }

  const categoryGradient = categoryColors[idea.category as keyof typeof categoryColors] || categoryColors.OTHER

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loading />
                  </div>
        ) : idea ? (
          <div className="space-y-8">
            <Card className="overflow-hidden border-gray-200 dark:border-gray-800">
              <CardHeader className="bg-white dark:bg-gray-900 px-6 py-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {idea.title}
                    </CardTitle>
                    <div className="flex items-center flex-wrap gap-3 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(idea.createdAt)}
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {idea.viewCount} views
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {idea.category.toLowerCase().replace(/_/g, ' ')}
                      </Badge>
                  </div>
                </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant={hasSparked ? "default" : "outline"}
                      size="sm"
                      onClick={handleSpark}
                      className="gap-1"
                    >
                      <Lightbulb
                        className={cn("w-4 h-4", hasSparked && "fill-current")}
                      />
                      {sparkCount}
                    </Button>

                  <Button
                      variant={isBookmarked ? "default" : "outline"}
                    size="sm"
                      onClick={handleBookmark}
                      className="gap-1"
                    >
                      <Bookmark
                        className={cn("w-4 h-4", isBookmarked && "fill-current")}
                      />
                    </Button>

                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                  </Button>

                    {session?.user?.id === idea.authorId && (
                  <Button
                        variant="outline"
                    size="sm"
                        asChild
                  >
                        <Link href={`/ideas/${idea.id}/edit`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                  </Button>
                    )}
                  </div>
                </div>
                </CardHeader>

              <CardContent className="px-6 py-6 space-y-8">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={idea.author.image || ""} alt={idea.author.name} />
                    <AvatarFallback>
                      {idea.author.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                            <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {idea.author.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {idea.author.bio || "No bio"}
                              </p>
                            </div>
                          </div>

                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    {idea.description}
                  </p>
                  {idea.content && (
                    <div className="mt-4 text-gray-700 dark:text-gray-300">
                      {idea.content}
                    </div>
              )}
            </div>

                {(idea.ideaSkills.length > 0 || idea.ideaIndustries.length > 0) && (
                  <div className="space-y-6 pt-4">
                    {idea.ideaSkills.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center text-gray-900 dark:text-gray-100">
                          <Star className="w-4 h-4 mr-2" />
                      Required Skills
                        </h3>
                    <div className="flex flex-wrap gap-2">
                          {idea.ideaSkills.map((skill) => (
                            <Badge key={skill.skill.id} variant="secondary">
                          {skill.skill.name}
                        </Badge>
                      ))}
                    </div>
                      </div>
              )}

                    {idea.ideaIndustries.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center text-gray-900 dark:text-gray-100">
                          <Building className="w-4 h-4 mr-2" />
                          Industries
                        </h3>
                    <div className="flex flex-wrap gap-2">
                          {idea.ideaIndustries.map((industry) => (
                            <Badge key={industry.industry.id} variant="secondary">
                          {industry.industry.name}
                        </Badge>
                      ))}
                    </div>
                      </div>
                    )}
                  </div>
                )}

                {idea.attachments.length > 0 && (
                  <div className="pt-4">
                    <h3 className="font-semibold mb-4 flex items-center text-gray-900 dark:text-gray-100">
                      <Download className="w-4 h-4 mr-2" />
                      Attachments
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {idea.attachments.map((attachment) => (
                        <Card key={attachment.id} className="bg-gray-50 dark:bg-gray-800">
                          <CardContent className="p-4">
                            <a
                              href={attachment.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Download className="w-4 h-4" />
                              <span>{attachment.filename}</span>
                            </a>
                  </CardContent>
                </Card>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center text-sm text-gray-500">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {idea._count.comments} comments
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="w-4 h-4 mr-1" />
                      {idea._count.contributionRequests} contributors
                    </div>
                  </div>

                  <ContributionRequestButton
                    ideaId={idea.id}
                    initialCount={idea._count.contributionRequests}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card className="overflow-hidden border-gray-200 dark:border-gray-800">
              <CardHeader className="bg-white dark:bg-gray-900 px-6 py-6">
                <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
                  Comments ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <CommentSystem
                  targetId={idea.id}
                  targetType="idea"
                  comments={comments}
                  onCommentsUpdate={setComments}
                />
                </CardContent>
              </Card>
            </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Idea not found
            </h2>
            <p className="text-gray-500 mt-2">
              This idea may have been removed or is no longer available.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
