"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Plus, Lightbulb, Users, MessageCircle, TrendingUp, Star, Calendar } from "lucide-react"
import Link from "next/link"
import { Loading } from "@/components/ui/loading"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ContributionDashboard } from "@/components/contributor/contribution-dashboard"

interface DashboardStats {
  projectCount: number
  collaborationCount: number
  ideasCount: number
  networkGrowth: string
}

interface RecentProject {
  id: string
  title: string
  description: string
  createdAt: string
}

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

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    projectCount: 0,
    collaborationCount: 0,
    ideasCount: 0,
    networkGrowth: "0%"
  })
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([])
  const [latestIdeas, setLatestIdeas] = useState<Idea[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (session?.user?.id) {
        try {
          // Fetch user stats
          const statsResponse = await fetch("/api/users/" + session.user.id + "/stats")
          if (statsResponse.ok) {
            const statsData = await statsResponse.json()
            setStats({
              projectCount: statsData.projectCount || 0,
              collaborationCount: statsData.collaborationCount || 0,
              ideasCount: statsData.ideasCount || 0,
              networkGrowth: statsData.networkGrowth || "0%"
            })
          }

          // Fetch recent projects
          const projectsResponse = await fetch("/api/users/" + session.user.id + "/projects?limit=5")
          if (projectsResponse.ok) {
            const projectsData = await projectsResponse.json()
            setRecentProjects(projectsData)
          }

          // Fetch latest ideas
          const ideasResponse = await fetch("/api/ideas?sort=latest&limit=3")
          if (ideasResponse.ok) {
            const ideasData = await ideasResponse.json()
            setLatestIdeas(ideasData)
          }
        } catch (error) {
          console.error("Error fetching dashboard data:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    if (session?.user?.id) {
      fetchDashboardData()
    }
  }, [session])

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" variant="pulse" />
      </div>
    )
  }

  const statsCards = [
    { title: "Your Projects", value: stats.projectCount.toString(), icon: Lightbulb, color: "text-violet-600" },
    { title: "Collaborations", value: stats.collaborationCount.toString(), icon: Users, color: "text-amber-600" },
    { title: "Ideas Shared", value: stats.ideasCount.toString(), icon: MessageCircle, color: "text-violet-600" },
    { title: "Network Growth", value: stats.networkGrowth, icon: TrendingUp, color: "text-amber-600" },
  ]

  const handleCreate = () => {
    router.push("/ideas/create")
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

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-amber-500 text-white text-xl">
                {session?.user?.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {session?.user?.name?.split(" ")[0] || "Innovator"}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Ready to turn your ideas into reality?</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleCreate}
              className="bg-gradient-to-r from-violet-500 to-amber-500 hover:from-violet-600 hover:to-amber-600 text-white"
            >
                <Plus className="w-4 h-4 mr-2" />
              Create New Idea
            </Button>
            <Button variant="outline" asChild>
              <Link href="/feed">View Feed</Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-800 ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contribution Invites */}
        <div className="mb-8">
          <ContributionDashboard />
        </div>

        {/* Latest Ideas and Recent Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Latest Ideas from Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-violet-600" />
                  Latest Ideas
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/feed">View All</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestIdeas.length > 0 ? (
                latestIdeas.map((idea) => {
                  const categoryGradient = categoryColors[idea.category as keyof typeof categoryColors] || categoryColors.OTHER

                  return (
                    <Link key={idea.id} href={`/ideas/${idea.id}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <div className={cn("bg-gradient-to-r p-4", categoryGradient, "text-white rounded-t-lg")}>
                          <div className="flex items-center space-x-2 mb-2">
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
                          <h3 className="font-semibold text-lg mb-2">{idea.title}</h3>
                          <p className="text-sm opacity-90">{idea.description}</p>
                          <div className="flex items-center justify-between mt-4 text-sm">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <Lightbulb className="w-4 h-4 mr-1" />
                                <span>{idea._count.sparks} sparks</span>
                              </div>
                              <div className="flex items-center">
                                <MessageCircle className="w-4 h-4 mr-1" />
                                <span>{idea._count.comments} comments</span>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{formatDate(idea.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  )
                })
              ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No ideas yet. Be the first to share an idea!</p>
                  <Button asChild className="mt-4" variant="outline">
                    <Link href="/ideas/create">Create Idea</Link>
                </Button>
              </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-amber-600" />
                  Recent Projects
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/projects">View All</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <div key={project.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{project.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{project.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      Created on {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No projects yet. Create your first project to get started!</p>
                  <Button asChild className="mt-4" variant="outline">
                    <Link href="/create">Create Project</Link>
                </Button>
              </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
