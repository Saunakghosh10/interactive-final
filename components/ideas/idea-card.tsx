"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  EyeOff,
  Calendar,
  Building,
  Star,
  Edit,
  MoreHorizontal,
  Bookmark,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface IdeaCardProps {
  idea: {
    id: string
    title: string
    description: string
    category: string
    imageUrl?: string | null
    viewCount: number
    featured: boolean
    createdAt: Date
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
    visibility: "PUBLIC" | "PRIVATE"
    author: {
      id: string
      name?: string | null
      username?: string | null
      image?: string | null
    }
    _count: {
      likes: number
      comments: number
    }
    ideaSkills?: { skill: { name: string } }[]
    ideaIndustries?: { industry: { name: string } }[]
  }
  isOwnIdea?: boolean
  onEdit?: () => void
  onDelete?: () => void
  className?: string
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

const categoryEmojis = {
  TECHNOLOGY: "💻",
  BUSINESS: "💼",
  DESIGN: "🎨",
  HEALTHCARE: "🏥",
  EDUCATION: "📚",
  ENTERTAINMENT: "🎬",
  ENVIRONMENT: "🌱",
  SOCIAL_IMPACT: "🤝",
  FINANCE: "💰",
  LIFESTYLE: "🌟",
  OTHER: "📝",
}

export function IdeaCard({ idea, isOwnIdea = false, onEdit, onDelete, className }: IdeaCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [likeCount, setLikeCount] = useState(idea._count.likes)
  const { toast } = useToast()

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const response = await fetch(`/api/ideas/${idea.id}/like`, {
        method: isLiked ? "DELETE" : "POST",
      })

      if (response.ok) {
        setIsLiked(!isLiked)
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      })
    }
  }

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const response = await fetch(`/api/ideas/${idea.id}/bookmark`, {
        method: isBookmarked ? "DELETE" : "POST",
      })

      if (response.ok) {
    setIsBookmarked(!isBookmarked)
    toast({
      title: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
      description: isBookmarked ? "Idea removed from your bookmarks" : "Idea saved to your bookmarks",
    })
      } else {
        const data = await response.json()
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update bookmark status",
        variant: "destructive",
      })
    }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (navigator.share) {
      try {
        await navigator.share({
          title: idea.title,
          text: idea.description,
          url: `/ideas/${idea.id}`,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      await navigator.clipboard.writeText(`${window.location.origin}/ideas/${idea.id}`)
      toast({
        title: "Link copied!",
        description: "Idea link has been copied to your clipboard",
      })
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date))
  }

  const categoryGradient = categoryColors[idea.category as keyof typeof categoryColors] || categoryColors.OTHER
  const categoryEmoji = categoryEmojis[idea.category as keyof typeof categoryEmojis] || categoryEmojis.OTHER

  return (
    <Card
      className={cn(
        "group hover:shadow-xl transition-all duration-300 border-2 border-violet-200 dark:border-violet-800 hover:border-violet-300 dark:hover:border-violet-600 bg-white dark:bg-gray-900 overflow-hidden",
        className,
      )}
    >
      <Link href={`/ideas/${idea.id}`}>
        {/* Header with Image/Category */}
        <div className="relative">
          {idea.imageUrl ? (
            <div className="aspect-video overflow-hidden">
              <img
                src={idea.imageUrl || "/placeholder.svg"}
                alt={idea.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className={cn("aspect-video bg-gradient-to-br", categoryGradient, "flex items-center justify-center")}>
              <div className="text-center text-white">
                <div className="text-4xl mb-2">{categoryEmoji}</div>
                <div className="text-lg font-semibold">{idea.category.replace("_", " ")}</div>
              </div>
            </div>
          )}

          {/* Status Badges */}
          <div className="absolute top-3 left-3 flex space-x-2">
            {idea.featured && (
              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
            {idea.status === "DRAFT" && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                Draft
              </Badge>
            )}
            {idea.visibility === "PRIVATE" && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <EyeOff className="w-3 h-3 mr-1" />
                Private
              </Badge>
            )}
          </div>

          {/* Actions Menu */}
          <div className="absolute top-3 right-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900"
                  onClick={(e) => e.preventDefault()}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleBookmark}>
                  <Bookmark className="w-4 h-4 mr-2" />
                  {isBookmarked ? "Remove bookmark" : "Bookmark"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
                {isOwnIdea && (
                  <>
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDelete} className="text-red-600">
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <CardHeader className="pb-3">
          {/* Author Info */}
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={idea.author.image || ""} alt={idea.author.name || ""} />
              <AvatarFallback className="bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-400 text-sm">
                {idea.author.name?.[0]?.toUpperCase() || idea.author.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {idea.author.name || idea.author.username || "Anonymous"}
              </p>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(idea.createdAt)}
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
            {idea.title}
          </h3>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 line-clamp-3 text-sm leading-relaxed">{idea.description}</p>

          {/* Skills and Industries */}
          {(idea.ideaSkills?.length || idea.ideaIndustries?.length) && (
            <div className="space-y-2">
              {idea.ideaSkills && idea.ideaSkills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {idea.ideaSkills.slice(0, 3).map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300"
                    >
                      {skill.skill.name}
                    </Badge>
                  ))}
                  {idea.ideaSkills.length > 3 && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    >
                      +{idea.ideaSkills.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              {idea.ideaIndustries && idea.ideaIndustries.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {idea.ideaIndustries.slice(0, 2).map((industry, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                    >
                      <Building className="w-3 h-3 mr-1" />
                      {industry.industry.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stats and Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-violet-100 dark:border-violet-800">
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {idea.viewCount}
              </div>
              <div className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-1" />
                {idea._count.comments}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                className={cn(
                  "h-8 px-2 transition-colors",
                  isLiked
                    ? "text-red-500 hover:text-red-600"
                    : "text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400",
                )}
                onClick={handleLike}
              >
                <Heart className={cn("w-4 h-4 mr-1", isLiked && "fill-current")} />
                {likeCount}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 transition-colors"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
