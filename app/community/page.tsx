"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loading } from "@/components/ui/loading"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Users, MapPin, Briefcase, Link as LinkIcon } from "lucide-react"
import Link from "next/link"
import { FollowButton } from "@/components/social/follow-button"

interface User {
  id: string
  name: string
  username: string
  image: string | null
  bio: string | null
  location: string | null
  skills: { skill: { name: string } }[]
  industries: { industry: { name: string } }[]
  _count: {
    followers: number
    following: number
    ideas: number
    projects: number
  }
}

export default function CommunityPage() {
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`/api/users?search=${searchQuery}&filter=${filter}`)
        if (response.ok) {
          const data = await response.json()
          setUsers(data)
        }
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [searchQuery, filter])

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" variant="pulse" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Community</h1>
          <p className="text-gray-600 dark:text-gray-400">Connect with innovators and creators</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search users by name, skills, or location..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "active" ? "default" : "outline"}
              onClick={() => setFilter("active")}
            >
              Most Active
            </Button>
            <Button
              variant={filter === "new" ? "default" : "outline"}
              onClick={() => setFilter("new")}
            >
              New Members
            </Button>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.image || ""} alt={user.name} />
                      <AvatarFallback>
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link href={`/profile/${user.username}`} className="hover:underline">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                    </div>
                  </div>
                  {session?.user?.id !== user.id && (
                    <FollowButton userId={user.id} />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.bio && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.bio}</p>
                )}
                
                {user.location && (
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <MapPin size={16} className="mr-2" />
                    {user.location}
                  </div>
                )}

                {user.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {user.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-100 rounded-full"
                      >
                        {skill.skill.name}
                      </span>
                    ))}
                    {user.skills.length > 3 && (
                      <span className="text-xs text-gray-500">+{user.skills.length - 3} more</span>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ideas</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{user._count.ideas}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Projects</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{user._count.projects}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No users found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery
                ? "Try adjusting your search criteria"
                : "Be the first to join the community!"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 