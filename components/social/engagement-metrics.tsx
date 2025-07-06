"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, MessageCircle, Users, Eye, TrendingUp, Award, Calendar, Target } from "lucide-react"
import { cn } from "@/lib/utils"

interface EngagementMetricsProps {
  metrics: {
    totalSparks: number
    totalComments: number
    totalViews: number
    totalFollowers: number
    totalIdeas: number
    totalContributions: number
    engagementRate: number
    topCategory?: string
    joinedDate: string
    streak?: number
  }
  className?: string
}

export function EngagementMetrics({ metrics, className }: EngagementMetricsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const getEngagementLevel = (rate: number) => {
    if (rate >= 80) return { level: "Exceptional", color: "from-green-500 to-emerald-500" }
    if (rate >= 60) return { level: "High", color: "from-blue-500 to-cyan-500" }
    if (rate >= 40) return { level: "Good", color: "from-violet-500 to-purple-500" }
    if (rate >= 20) return { level: "Fair", color: "from-amber-500 to-yellow-500" }
    return { level: "Growing", color: "from-gray-500 to-slate-500" }
  }

  const engagement = getEngagementLevel(metrics.engagementRate)

  const statCards = [
    {
      title: "Total Sparks",
      value: metrics.totalSparks,
      icon: Heart,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
    {
      title: "Comments",
      value: metrics.totalComments,
      icon: MessageCircle,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Profile Views",
      value: metrics.totalViews,
      icon: Eye,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Followers",
      value: metrics.totalFollowers,
      icon: Users,
      color: "text-violet-500",
      bgColor: "bg-violet-50 dark:bg-violet-950",
    },
  ]

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-violet-200 dark:border-violet-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-violet-900 dark:text-violet-100">{formatNumber(stat.value)}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Engagement Overview */}
      <Card className="border-2 border-violet-200 dark:border-violet-800">
        <CardHeader>
          <CardTitle className="text-violet-900 dark:text-violet-100 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-amber-500" />
            Engagement Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Engagement Rate */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Engagement Rate</span>
              <div className="flex items-center space-x-2">
                <Badge className={cn("bg-gradient-to-r text-white", engagement.color)}>{engagement.level}</Badge>
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{metrics.engagementRate}%</span>
              </div>
            </div>
            <Progress value={metrics.engagementRate} className="h-2 bg-violet-100 dark:bg-violet-900" />
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-violet-50 dark:bg-violet-950 rounded-lg">
              <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">{metrics.totalIdeas}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Ideas Shared</div>
            </div>

            <div className="text-center p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{metrics.totalContributions}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Contributions</div>
            </div>

            {metrics.streak && (
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center justify-center">
                  <Award className="w-6 h-6 mr-1" />
                  {metrics.streak}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
              </div>
            )}
          </div>

          {/* Top Category */}
          {metrics.topCategory && (
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 rounded-lg border border-violet-200 dark:border-violet-800">
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <div>
                  <p className="font-medium text-violet-900 dark:text-violet-100">Top Category</p>
                  <p className="text-sm text-violet-600 dark:text-violet-400">{metrics.topCategory}</p>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">Most Active</Badge>
            </div>
          )}

          {/* Member Since */}
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-violet-100 dark:border-violet-800">
            <Calendar className="w-4 h-4" />
            <span>
              Member since{" "}
              {new Date(metrics.joinedDate).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
