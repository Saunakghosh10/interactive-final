"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, MessageCircle, Bookmark, UserPlus, History, Calendar, Eye } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface InteractionHistoryProps {
  userId: string
  className?: string
}

interface InteractionItem {
  id: string
  type: "spark" | "comment" | "bookmark" | "follow"
  createdAt: string
  target?: {
    id: string
    title: string
    type: "idea" | "project" | "user"
    author?: {
      id: string
      name?: string | null
      username?: string | null
      image?: string | null
    }
  }
  content?: string
}

export function InteractionHistory({ userId, className }: InteractionHistoryProps) {
  const { toast } = useToast()
  const [interactions, setInteractions] = useState<{
    sparks: InteractionItem[]
    comments: InteractionItem[]
    bookmarks: InteractionItem[]
    follows: InteractionItem[]
  }>({
    sparks: [],
    comments: [],
    bookmarks: [],
    follows: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("sparks")

  useEffect(() => {
    fetchInteractions()
  }, [userId])

  const fetchInteractions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}/interactions`)
      if (response.ok) {
        const data = await response.json()
        setInteractions(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load interaction history",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const renderInteractionItem = (item: InteractionItem) => {
    const getIcon = () => {
      switch (item.type) {
        case "spark":
          return <Heart className="w-4 h-4 text-red-500" />
        case "comment":
          return <MessageCircle className="w-4 h-4 text-blue-500" />
        case "bookmark":
          return <Bookmark className="w-4 h-4 text-amber-500" />
        case "follow":
          return <UserPlus className="w-4 h-4 text-violet-500" />
        default:
          return <Eye className="w-4 h-4 text-gray-500" />
      }
    }

    const getActionText = () => {
      switch (item.type) {
        case "spark":
          return "sparked"
        case "comment":
          return "commented on"
        case "bookmark":
          return "bookmarked"
        case "follow":
          return "followed"
        default:
          return "interacted with"
      }
    }

    return (
      <Card key={item.id} className="border-violet-200 dark:border-violet-800 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-violet-50 dark:bg-violet-950 rounded-lg">{getIcon()}</div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  You {getActionText()} {item.target?.type === "user" ? "" : "this"}{" "}
                  <span className="font-medium text-violet-600 dark:text-violet-400">{item.target?.type}</span>
                </p>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(item.createdAt)}
                </div>
              </div>

              {item.target && (
                <div className="space-y-2">
                  <Link
                    href={
                      item.target.type === "user"
                        ? `/profile/${item.target.id}`
                        : `/${item.target.type}s/${item.target.id}`
                    }
                    className="block"
                  >
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center space-x-3">
                        {item.target.author && (
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={item.target.author.image || ""} alt={item.target.author.name || ""} />
                            <AvatarFallback className="bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-400 text-xs">
                              {item.target.author.name?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{item.target.title}</p>
                          {item.target.author && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              by {item.target.author.name || item.target.author.username}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300"
                        >
                          {item.target.type}
                        </Badge>
                      </div>
                    </div>
                  </Link>

                  {item.content && item.type === "comment" && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{item.content}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className={cn("border-violet-200 dark:border-violet-800", className)}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-violet-100 dark:bg-violet-900 rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("border-2 border-violet-200 dark:border-violet-800", className)}>
      <CardHeader>
        <CardTitle className="text-violet-900 dark:text-violet-100 flex items-center">
          <History className="w-5 h-5 mr-2 text-violet-600" />
          Interaction History
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-violet-100 dark:bg-violet-900">
            <TabsTrigger value="sparks" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
              <Heart className="w-4 h-4 mr-1" />
              Sparks ({interactions.sparks.length})
            </TabsTrigger>
            <TabsTrigger value="comments" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
              <MessageCircle className="w-4 h-4 mr-1" />
              Comments ({interactions.comments.length})
            </TabsTrigger>
            <TabsTrigger
              value="bookmarks"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
            >
              <Bookmark className="w-4 h-4 mr-1" />
              Bookmarks ({interactions.bookmarks.length})
            </TabsTrigger>
            <TabsTrigger value="follows" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
              <UserPlus className="w-4 h-4 mr-1" />
              Follows ({interactions.follows.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sparks" className="space-y-4 mt-6">
            {interactions.sparks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No sparks yet</p>
              </div>
            ) : (
              interactions.sparks.map(renderInteractionItem)
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4 mt-6">
            {interactions.comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No comments yet</p>
              </div>
            ) : (
              interactions.comments.map(renderInteractionItem)
            )}
          </TabsContent>

          <TabsContent value="bookmarks" className="space-y-4 mt-6">
            {interactions.bookmarks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No bookmarks yet</p>
              </div>
            ) : (
              interactions.bookmarks.map(renderInteractionItem)
            )}
          </TabsContent>

          <TabsContent value="follows" className="space-y-4 mt-6">
            {interactions.follows.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No follows yet</p>
              </div>
            ) : (
              interactions.follows.map(renderInteractionItem)
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
