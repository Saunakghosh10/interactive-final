"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Heart, MessageCircle, UserPlus, Lightbulb, Edit, Award, Calendar, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface ActivityItem {
  id: string
  type: string
  description: string
  createdAt: string
  user: {
    id: string
    name?: string | null
    username?: string | null
    image?: string | null
  }
  metadata?: {
    ideaId?: string
    ideaTitle?: string
    userId?: string
    userName?: string
  }
}

interface ActivityFeedProps {
  userId?: string
  limit?: number
  showHeader?: boolean
  className?: string
}

const activityIcons = {
  IDEA_CREATED: { icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950" },
  IDEA_UPDATED: { icon: Edit, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950" },
  IDEA_SPARKED: { icon: Heart, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950" },
  IDEA_COMMENTED: { icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950" },
  USER_FOLLOWED: { icon: UserPlus, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950" },
  CONTRIBUTION_REQUESTED: { icon: UserPlus, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950" },
  CONTRIBUTION_ACCEPTED: { icon: Award, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950" },
  PROJECT_CREATED: { icon: Lightbulb, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950" },
  PROJECT_UPDATED: { icon: Edit, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950" },
}

export function ActivityFeed({ userId, limit = 20, showHeader = true, className }: ActivityFeedProps) {
  const { toast } = useToast()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchActivities()
  }, [userId])

  const fetchActivities = async (refresh = false) => {
    if (refresh) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      const url = userId ? `/api/users/${userId}/activities` : `/api/activities`
      const response = await fetch(`${url}?limit=${limit}`)

      if (response.ok) {
        const data = await response.json()
        setActivities(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load activity feed",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const formatDate = (date: string) => {
    const now = new Date()
    const activityDate = new Date(date)
    const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return activityDate.toLocaleDateString()
  }

  const getActivityConfig = (type: string) => {
    return activityIcons[type as keyof typeof activityIcons] || activityIcons.IDEA_CREATED
  }

  if (isLoading) {
    return (
      <Card className={cn("border-violet-200 dark:border-violet-800", className)}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-10 h-10 bg-violet-200 dark:bg-violet-800 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-violet-200 dark:bg-violet-800 rounded w-3/4" />
                  <div className="h-3 bg-violet-100 dark:bg-violet-900 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("border-2 border-violet-200 dark:border-violet-800", className)}>
      {showHeader && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-violet-900 dark:text-violet-100 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-violet-600" />
              Activity Feed
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => fetchActivities(true)}
              disabled={isRefreshing}
              className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950"
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </CardHeader>
      )}

      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500 to-purple-600" />

              {activities.map((activity, index) => {
                const config = getActivityConfig(activity.type)
                const IconComponent = config.icon

                return (
                  <div key={activity.id} className="relative flex items-start space-x-4 pb-6">
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        "relative z-10 p-2 rounded-full border-2 border-white dark:border-gray-900",
                        config.bg,
                      )}
                    >
                      <IconComponent className={cn("w-4 h-4", config.color)} />
                      {/* Yellow indicator for recent activity */}
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full animate-pulse" />
                      )}
                    </div>

                    {/* Activity content */}
                    <div className="flex-1 min-w-0 pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2 mb-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={activity.user.image || ""} alt={activity.user.name || ""} />
                            <AvatarFallback className="bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-400 text-xs">
                              {activity.user.name?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {activity.user.name || activity.user.username || "Anonymous"}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(activity.createdAt)}
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{activity.description}</p>

                      {/* Activity metadata */}
                      {activity.metadata && (
                        <div className="flex items-center space-x-2">
                          {activity.metadata.ideaId && activity.metadata.ideaTitle && (
                            <Link href={`/ideas/${activity.metadata.ideaId}`}>
                              <Badge
                                variant="secondary"
                                className="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-800 cursor-pointer"
                              >
                                {activity.metadata.ideaTitle}
                              </Badge>
                            </Link>
                          )}
                          {activity.metadata.userId && activity.metadata.userName && (
                            <Link href={`/profile/${activity.metadata.userId}`}>
                              <Badge
                                variant="secondary"
                                className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800 cursor-pointer"
                              >
                                @{activity.metadata.userName}
                              </Badge>
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
