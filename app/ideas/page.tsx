"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { IdeaCard } from "@/components/ideas/idea-card"
import { IdeaFilters } from "@/components/ideas/idea-filters"
import { Loading } from "@/components/ui/loading"
import { Lightbulb, Plus, TrendingUp, Star } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function IdeasPage() {
  const { data: session } = useSession()
  const [ideas, setIdeas] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({})
  const [stats, setStats] = useState({
    total: 0,
    featured: 0,
    thisWeek: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchIdeas()
    fetchStats()
  }, [filters])

  const fetchIdeas = async () => {
    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams()

      if (filters.search) queryParams.append("search", filters.search)
      if (filters.category) queryParams.append("category", filters.category)
      if (filters.sort) queryParams.append("sort", filters.sort)
      if (filters.skills?.length) queryParams.append("skills", filters.skills.join(","))
      if (filters.industries?.length) queryParams.append("industries", filters.industries.join(","))
      if (filters.bookmarked) queryParams.append("bookmarked", "true")

      const response = await fetch(`/api/ideas?${queryParams.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setIdeas(data)
      } else {
        const error = await response.json()
        throw new Error(error.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to load ideas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/ideas/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      // Silent fail for stats
    }
  }

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                <Lightbulb className="w-8 h-8 mr-3 text-amber-500" />
                Innovative Ideas
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Discover groundbreaking ideas from creative minds around the world
              </p>
            </div>

            {session && (
              <Button
                asChild
                className="bg-gradient-to-r from-violet-500 to-amber-500 hover:from-violet-600 hover:to-amber-600 text-white mt-4 md:mt-0"
              >
                <Link href="/ideas/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Share Your Idea
                </Link>
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-violet-200 dark:border-violet-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Ideas</p>
                    <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-violet-200 dark:border-violet-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Featured Ideas</p>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.featured}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-violet-200 dark:border-violet-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.thisWeek}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <IdeaFilters 
              onFiltersChange={handleFiltersChange} 
              showBookmarkFilter={!!session} 
            />
          </div>

          {/* Ideas Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loading size="lg" variant="pulse" />
              </div>
            ) : ideas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ideas.map((idea: any) => (
                  <IdeaCard 
                    key={idea.id} 
                    idea={idea} 
                    isOwnIdea={session?.user?.id === idea.authorId} 
                  />
                ))}
              </div>
            ) : (
              <Card className="border-violet-200 dark:border-violet-800">
                <CardContent className="text-center py-12">
                  <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {filters.bookmarked ? "No bookmarked ideas found" : "No ideas found"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {filters.bookmarked 
                      ? "You haven't bookmarked any ideas yet. Browse ideas and bookmark the ones you like."
                      : "Try adjusting your filters or be the first to share an idea in this category."}
                  </p>
                  {session && !filters.bookmarked && (
                    <Button
                      asChild
                      className="bg-gradient-to-r from-violet-500 to-amber-500 hover:from-violet-600 hover:to-amber-600 text-white"
                    >
                      <Link href="/ideas/create">
                        <Plus className="w-4 h-4 mr-2" />
                        Share Your Idea
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
