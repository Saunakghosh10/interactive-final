"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { UserPlus, UserMinus, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface FollowButtonProps {
  userId: string
  initialIsFollowing?: boolean
  initialFollowerCount?: number
  size?: "sm" | "md" | "lg"
  showCount?: boolean
  className?: string
}

export function FollowButton({
  userId,
  initialIsFollowing = false,
  initialFollowerCount = 0,
  size = "md",
  showCount = false,
  className,
}: FollowButtonProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [followerCount, setFollowerCount] = useState(initialFollowerCount)
  const [isLoading, setIsLoading] = useState(false)

  const isOwnProfile = session?.user?.id === userId

  const handleFollow = async () => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow users",
        variant: "destructive",
      })
      return
    }

    if (isLoading) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
      })

      if (response.ok) {
        const newIsFollowing = !isFollowing
        setIsFollowing(newIsFollowing)
        setFollowerCount(newIsFollowing ? followerCount + 1 : followerCount - 1)

        toast({
          title: newIsFollowing ? "Following!" : "Unfollowed",
          description: newIsFollowing ? "You are now following this user" : "You have unfollowed this user",
        })
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to update follow status")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update follow status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isOwnProfile) {
    return null
  }

  const sizeClasses = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-base",
    lg: "h-12 px-6 text-lg",
  }

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }

  return (
    <Button
      onClick={handleFollow}
      disabled={isLoading}
      className={cn(
        sizeClasses[size],
        "transition-all duration-200 hover:scale-105",
        isFollowing
          ? "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
          : "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white",
        className,
      )}
    >
      {isFollowing ? (
        <UserMinus className={cn(iconSizes[size], "mr-2")} />
      ) : (
        <UserPlus className={cn(iconSizes[size], "mr-2")} />
      )}
      {isLoading ? "..." : isFollowing ? "Following" : "Follow"}
      {showCount && (
        <span className="ml-2 flex items-center">
          <Users className="w-4 h-4 mr-1" />
          {followerCount}
        </span>
      )}
    </Button>
  )
}
