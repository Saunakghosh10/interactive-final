"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { ProfileView } from "@/components/profile/profile-view"
import { Loading } from "@/components/ui/loading"
import { useToast } from "@/hooks/use-toast"
import { calculateProfileCompleteness } from "@/lib/profile-completion"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserProfile()
    }
  }, [session])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/${session?.user?.id}`)
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileUpdate = async (data: any) => {
    try {
      const response = await fetch(`/api/users/${session?.user?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)

        // Update profile completeness
        const completeness = calculateProfileCompleteness(updatedUser)
        await fetch(`/api/users/${session?.user?.id}/completeness`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ completeness }),
        })
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      throw error
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" variant="pulse" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please sign in to view your profile.</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Profile not found.</p>
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
