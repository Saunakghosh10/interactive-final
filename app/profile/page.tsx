"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { ProfileView } from "@/components/profile/profile-view"
import { Loading } from "@/components/ui/loading"
import { useToast } from "@/hooks/use-toast"
import { calculateProfileCompleteness } from "@/lib/profile-completion"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin')
    },
  })
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadProfile = async () => {
      if (status === "authenticated" && session?.user?.id) {
        try {
          const response = await fetch(`/api/users/${session.user.id}`)
          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
          } else {
            throw new Error("Failed to load profile")
          }
        } catch (error) {
          console.error("Profile load error:", error)
          toast({
            title: "Error",
            description: "Failed to load profile",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadProfile()
  }, [status, session?.user?.id, toast])

  const handleProfileUpdate = async (data: any) => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/users/${session.user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const updatedUser = await response.json()
      setUser(updatedUser)

      // Update profile completeness
      const completeness = calculateProfileCompleteness(updatedUser)
      await fetch(`/api/users/${session.user.id}/completeness`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completeness }),
      })

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    }
  }

  // Show loading state while session is loading
  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" variant="pulse" />
      </div>
    )
  }

  // Show error state if no user data
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">
            We couldn't load your profile information.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileView user={user} isOwnProfile={true} onProfileUpdate={handleProfileUpdate} />
      </div>
    </div>
  )
}
