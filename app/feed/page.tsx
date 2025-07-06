"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loading } from "@/components/ui/loading"
import { useToast } from "@/hooks/use-toast"
import {
  Lightbulb,
  MessageCircle,
  Share2,
  Eye,
  Calendar,
  Building,
  Star,
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Idea {
  id: string
  title: string
  description: string
  category: string
  featured: boolean
  createdAt: string
  viewCount: number
  author: {
    id: string
    name: string
    image: string | null
  }
  _count: {
    comments: number
    sparks: number
  }
}

export default function FeedPage() {
  const { data: session } = useSession()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userSparks, setUserSparks] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    fetchIdeas()
    if (session?.user?.id) {
      fetchUserSparks()
    }
  }, [session?.user?.id])

  const fetchIdeas = async () => {
    try {
      const response = await fetch("/api/ideas?sort=latest")
      if (response.ok) {
        const data = await response.json()
        setIdeas(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load ideas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserSparks = async () => {
    try {
      const response = await fetch("/api/ideas/sparks/user")
      if (response.ok) {
        const { sparkedIdeas } = await response.json()
        setUserSparks(new Set(sparkedIdeas))
      }
    } catch (error) {
      console.error("Failed to fetch user sparks:", error)
    }
  }

  const handleSpark = async (ideaId: string) => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to spark ideas",
        variant: "destructive",
      })
      return
    }

    try {
      const hasSparked = userSparks.has(ideaId)
      const response = await fetch(`/api/ideas/${ideaId}/spark`, {
        method: hasSparked ? "DELETE" : "POST",
      })

      if (response.ok) {
        setIdeas(ideas.map(idea => {
          if (idea.id === ideaId) {
            return {
              ...idea,
              _count: {
                ...idea._count,
                sparks: hasSparked ? idea._count.sparks - 1 : idea._count.sparks + 1
              }
            }
          }
          return idea
        }))

        setUserSparks(prev => {
          const next = new Set(prev)
          if (hasSparked) {
            next.delete(ideaId)
          } else {
            next.add(ideaId)
          }
          return next
        })

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

  const handleShare = async (idea: Idea) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: idea.title,
          text: idea.description,
          url: window.location.origin + "/ideas/" + idea.id,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      await navigator.clipboard.writeText(window.location.origin + "/ideas/" + idea.id)
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
    }).format(new Date(date))
  }

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" variant="pulse" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Latest Ideas</h1>
          <Button asChild>
            <Link href="/ideas/create">Share Your Idea</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {ideas.map((idea) => {
            const categoryGradient = categoryColors[idea.category as keyof typeof categoryColors] || categoryColors.OTHER
            const hasSparked = userSparks.has(idea.id)

            return (
              <Card key={idea.id} className="overflow-hidden border-2 border-violet-200 dark:border-violet-800">
                <div className={cn("bg-gradient-to-r p-6", categoryGradient, "text-white")}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-4">
                        <Badge className="bg-white/20 text-white border-white/30">
                          {idea.category.replace("_", " ")}
                        </Badge>
                        {idea.featured && (
                          <Badge className="bg-amber-500 text-white">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>

                      <Link href={`/ideas/${idea.id}`} className="block group">
                        <h2 className="text-2xl font-bold mb-3 group-hover:underline">{idea.title}</h2>
                        <p className="text-lg opacity-90 mb-4">{idea.description}</p>
                      </Link>

                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10 border-2 border-white/30">
                          <AvatarImage src={idea.author.image || ""} alt={idea.author.name || ""} />
                          <AvatarFallback className="bg-white/20 text-white">
                            {idea.author.name?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link href={`/profile/${idea.author.id}`} className="font-semibold hover:underline">
                            {idea.author.name || "Anonymous"}
                          </Link>
                          <div className="flex items-center text-sm opacity-80">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(idea.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 mt-6 pt-6 border-t border-white/20">
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "bg-white/10 border-white/30 text-white hover:bg-white/20",
                        hasSparked && "bg-white/20 border-white"
                      )}
                      onClick={() => handleSpark(idea.id)}
                    >
                      <Lightbulb className={cn("w-4 h-4 mr-2", hasSparked && "fill-current")} />
                      {idea._count.sparks} Sparks
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                      asChild
                    >
                      <Link href={`/ideas/${idea.id}#comments`}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {idea._count.comments} Comments
                      </Link>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                      onClick={() => handleShare(idea)}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>

                    <div className="flex items-center ml-auto">
                      <Eye className="w-4 h-4 mr-2 opacity-80" />
                      <span>{idea.viewCount} views</span>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
} 