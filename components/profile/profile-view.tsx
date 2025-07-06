"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  MapPin,
  Globe,
  Linkedin,
  Github,
  Twitter,
  Calendar,
  Users,
  Edit,
  UserPlus,
  MessageCircle,
  Building,
  Star,
} from "lucide-react"
import { ProfileEditModal } from "./profile-edit-modal"
import { ProfileCompletion } from "./profile-completion"
import { calculateProfileCompleteness, getProfileCompletionTips } from "@/lib/profile-completion"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface ProfileViewProps {
  user: {
    id: string
    name?: string | null
    username?: string | null
    email: string
    image?: string | null
    bio?: string | null
    location?: string | null
    website?: string | null
    linkedinUrl?: string | null
    githubUrl?: string | null
    twitterUrl?: string | null
    profileVisibility: "PUBLIC" | "PRIVATE"
    createdAt: Date
    skills?: { skill: { id: string; name: string; category: string } }[]
    industries?: { industry: { id: string; name: string } }[]
    _count?: {
      projects: number
      followers: number
      following: number
    }
  }
  isOwnProfile?: boolean
  onProfileUpdate?: (data: any) => Promise<void>
}

export function ProfileView({ user, isOwnProfile = false, onProfileUpdate }: ProfileViewProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const { toast } = useToast()

  const completeness = calculateProfileCompleteness(user)
  const completionTips = getProfileCompletionTips(user)

  const handleFollow = async () => {
    try {
      const response = await fetch(`/api/users/${user.id}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
      })

      if (response.ok) {
        setIsFollowing(!isFollowing)
        toast({
          title: isFollowing ? "Unfollowed" : "Following!",
          description: isFollowing ? `You unfollowed ${user.name}` : `You are now following ${user.name}`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      })
    }
  }

  const handleProfileSave = async (data: any) => {
    if (onProfileUpdate) {
      await onProfileUpdate(data)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Completion - Only for own profile */}
      {isOwnProfile && completeness < 100 && (
        <ProfileCompletion
          completeness={completeness}
          tips={completionTips}
          onEditProfile={() => setIsEditModalOpen(true)}
        />
      )}

      {/* Main Profile Card */}
      <Card className="border-2 border-violet-200 dark:border-violet-800 bg-gradient-to-br from-white to-violet-50 dark:from-gray-900 dark:to-violet-950">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-violet-200 dark:border-violet-800 shadow-lg">
                <AvatarImage src={user.image || ""} alt={user.name || ""} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-2xl font-bold">
                  {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {completeness >= 100 && (
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-1.5 shadow-lg">
                  <Star className="w-4 h-4 text-white fill-current" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name || "Anonymous User"}</h1>
                  {user.username && (
                    <p className="text-violet-600 dark:text-violet-400 font-medium">@{user.username}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 mt-2 md:mt-0">
                  {isOwnProfile ? (
                    <Button
                      onClick={() => setIsEditModalOpen(true)}
                      className="bg-gradient-to-r from-violet-500 to-amber-500 hover:from-violet-600 hover:to-amber-600 text-white"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleFollow}
                        variant={isFollowing ? "outline" : "default"}
                        className={cn(
                          isFollowing
                            ? "border-violet-500 text-violet-600 hover:bg-violet-50"
                            : "bg-gradient-to-r from-violet-500 to-amber-500 hover:from-violet-600 hover:to-amber-600 text-white",
                        )}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {isFollowing ? "Following" : "Follow"}
                      </Button>
                      <Button variant="outline" className="bg-transparent">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Bio */}
              {user.bio && <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">{user.bio}</p>}

              {/* Location and Links */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                {user.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {user.location}
                  </div>
                )}
                {user.website && (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-violet-600 transition-colors"
                  >
                    <Globe className="w-4 h-4 mr-1" />
                    Website
                  </a>
                )}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Joined{" "}
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-3">
                {user.linkedinUrl && (
                  <a
                    href={user.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {user.githubUrl && (
                  <a
                    href={user.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                )}
                {user.twitterUrl && (
                  <a
                    href={user.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-violet-50 dark:bg-violet-950 rounded-lg">
              <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                {user._count?.projects || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Projects</div>
            </div>
            <div className="text-center p-4 bg-violet-50 dark:bg-violet-950 rounded-lg">
              <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                {user._count?.followers || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
            </div>
            <div className="text-center p-4 bg-violet-50 dark:bg-violet-950 rounded-lg">
              <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                {user._count?.following || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Following</div>
            </div>
          </div>

          <Separator className="bg-violet-200 dark:bg-violet-800" />

          {/* Skills */}
          {user.skills && user.skills.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-violet-900 dark:text-violet-100 flex items-center">
                <Star className="w-5 h-5 mr-2 text-amber-500" />
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((userSkill) => (
                  <Badge
                    key={userSkill.skill.id}
                    variant="secondary"
                    className="bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 transition-all duration-200"
                  >
                    {userSkill.skill.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Industries */}
          {user.industries && user.industries.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-violet-900 dark:text-violet-100 flex items-center">
                <Building className="w-5 h-5 mr-2 text-amber-500" />
                Industries
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.industries.map((userIndustry) => (
                  <Badge
                    key={userIndustry.industry.id}
                    variant="secondary"
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 transition-all duration-200"
                  >
                    <Building className="w-3 h-3 mr-1" />
                    {userIndustry.industry.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {(!user.skills || user.skills.length === 0) && (!user.industries || user.industries.length === 0) && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No skills or industries added yet.</p>
              {isOwnProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditModalOpen(true)}
                  className="mt-2 bg-transparent"
                >
                  Add Skills & Industries
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {isOwnProfile && (
        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          onSave={handleProfileSave}
        />
      )}
    </div>
  )
}
