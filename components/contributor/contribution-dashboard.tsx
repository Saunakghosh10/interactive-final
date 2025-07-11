"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ContributionInvite {
  id: string
  message: string
  skills: string[]
  status: string
  createdAt: string
  idea: {
    id: string
    title: string
    author: {
      id: string
      name: string | null
      image: string | null
    }
  }
}

export function ContributionDashboard() {
  const [invites, setInvites] = useState<ContributionInvite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchInvites()
  }, [])

  const fetchInvites = async () => {
    try {
      const response = await fetch("/api/users/me/contributions")
      if (response.ok) {
        const data = await response.json()
        setInvites(data)
      }
    } catch (error) {
      console.error("Error fetching invites:", error)
      toast({
        title: "Error",
        description: "Failed to load contribution invites",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async (inviteId: string, ideaId: string) => {
    try {
      const response = await fetch(`/api/ideas/${ideaId}/invite/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "ACCEPTED",
          requestId: inviteId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to accept invitation")
      }

      const data = await response.json()
      toast({
        title: "Success",
        description: data.message || "Contribution invite accepted",
      })
      fetchInvites() // Refresh the list
    } catch (error) {
      console.error("Error accepting invite:", error)
      toast({
        title: "Error",
        description: "Failed to accept invitation",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (inviteId: string, ideaId: string) => {
    try {
      const response = await fetch(`/api/ideas/${ideaId}/invite/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "REJECTED",
          requestId: inviteId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to reject invitation")
      }

      const data = await response.json()
      toast({
        title: "Success",
        description: data.message || "Contribution invite rejected",
      })
      fetchInvites() // Refresh the list
    } catch (error) {
      console.error("Error rejecting invite:", error)
      toast({
        title: "Error",
        description: "Failed to reject invitation",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (invites.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contribution Invites</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invites.map((invite) => (
            <div
              key={invite.id}
              className="flex items-start justify-between p-4 border rounded-lg bg-white dark:bg-gray-800"
            >
              <div className="flex items-start space-x-4">
                <Avatar>
                  <AvatarImage
                    src={invite.idea.author.image || ""}
                    alt={invite.idea.author.name || ""}
                  />
                  <AvatarFallback>
                    {invite.idea.author.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{invite.idea.title}</h4>
                  <p className="text-sm text-gray-500">
                    Invited by {invite.idea.author.name}
                  </p>
                  <p className="text-sm mt-1">{invite.message}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {invite.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  className="bg-green-500 hover:bg-green-600"
                  onClick={() => handleAccept(invite.id, invite.idea.id)}
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleReject(invite.id, invite.idea.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 