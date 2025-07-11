"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SkillTagInput } from "@/components/profile/skill-tag-input"
import { useToast } from "@/hooks/use-toast"
import { Plus, UserPlus, X } from "lucide-react"

interface ContributionInvite {
  id: string
  message: string
  skills: string[]
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN"
  createdAt: string
  respondedAt: string | null
  user: {
    id: string
    name: string | null
    image: string | null
    skills: {
      skill: {
        id: string
        name: string
        category: string
      }
    }[]
  }
}

interface ContributionInvitesProps {
  ideaId: string
}

export function ContributionInvites({ ideaId }: ContributionInvitesProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [invites, setInvites] = useState<ContributionInvite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInviting, setIsInviting] = useState(false)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [message, setMessage] = useState("")
  const [requiredSkills, setRequiredSkills] = useState<{ id: string; name: string; category: string }[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<{
    id: string
    name: string | null
    image: string | null
    skills: { skill: { name: string } }[]
  }[]>([])

  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const response = await fetch(`/api/ideas/${ideaId}/invite`)
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

    if (session?.user?.id) {
      fetchInvites()
      // Poll for updates every 10 seconds
      const interval = setInterval(fetchInvites, 10000)
      return () => clearInterval(interval)
    }
  }, [session, ideaId])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data)
      }
    } catch (error) {
      console.error("Error searching users:", error)
    }
  }

  const handleInvite = async () => {
    if (!selectedUserId || !message.trim() || requiredSkills.length === 0) return

    setIsInviting(true)
    try {
      const response = await fetch(`/api/ideas/${ideaId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          message: message.trim(),
          requiredSkills: requiredSkills.map(skill => skill.name),
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Make sure we have all the required data before updating the UI
        if (data.data && data.data.user) {
          setInvites([data.data, ...invites])
          setSelectedUserId("")
          setMessage("")
          setRequiredSkills([])
          setIsInviteDialogOpen(false)
          toast({
            title: "Success",
            description: data.message || "Contribution invitation sent successfully",
          })
        } else {
          throw new Error("Invalid response data")
        }
      } else {
        throw new Error(data.error || "Failed to send invitation")
      }
    } catch (error) {
      console.error("Error sending invite:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send contribution invitation",
        variant: "destructive",
      })
    } finally {
      setIsInviting(false)
    }
  }

  const handleCancelInvite = async (inviteId: string) => {
    try {
      const response = await fetch(
        `/api/ideas/${ideaId}/invite?requestId=${inviteId}`,
        { method: "DELETE" }
      )

      if (response.ok) {
        setInvites(invites.filter((invite) => invite.id !== inviteId))
        toast({
          title: "Success",
          description: "Contribution invitation cancelled successfully",
        })
      } else {
        throw new Error("Failed to cancel invitation")
      }
    } catch (error) {
      console.error("Error cancelling invite:", error)
      toast({
        title: "Error",
        description: "Failed to cancel contribution invitation",
        variant: "destructive",
      })
    }
  }

  if (!session) {
    return null
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <UserPlus className="w-5 h-5 mr-2 text-violet-600" />
            Contribution Invites
          </CardTitle>
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Invite Contributor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Contributor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Users</label>
                  <Input
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by name or username"
                  />
                  {searchResults.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                            selectedUserId === user.id
                              ? "bg-violet-100 dark:bg-violet-900"
                              : ""
                          }`}
                          onClick={() => setSelectedUserId(user.id)}
                        >
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.image || ""} />
                              <AvatarFallback>
                                {user.name?.[0]?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-xs text-gray-500">
                                {user.skills.length} skills
                              </div>
                            </div>
                          </div>
                          {selectedUserId === user.id && (
                            <Badge variant="secondary">Selected</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Required Skills</label>
                  <SkillTagInput
                    selectedSkills={requiredSkills}
                    onSkillsChange={setRequiredSkills}
                    placeholder="Search for required skills..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write a message to the contributor..."
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleInvite}
                  disabled={
                    isInviting ||
                    !selectedUserId ||
                    !message.trim() ||
                    requiredSkills.length === 0
                  }
                >
                  {isInviting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    "Send Invitation"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {invites.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No contribution invites yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invites.map((invite) => (
              <Card key={invite.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarImage src={invite.user?.image || ""} alt={invite.user?.name || "User"} />
                        <AvatarFallback>
                          {invite.user?.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{invite.user?.name || "Unknown User"}</div>
                          <Badge variant={
                            invite.status === "ACCEPTED" ? "success" :
                            invite.status === "REJECTED" ? "destructive" :
                            invite.status === "WITHDRAWN" ? "secondary" :
                            "default"
                          }>
                            {invite.status.charAt(0) + invite.status.slice(1).toLowerCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          Invited {new Date(invite.createdAt).toLocaleDateString()}
                          {invite.respondedAt && (
                            <> · Responded {new Date(invite.respondedAt).toLocaleDateString()}</>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(invite.skills || []).map((skill) => (
                            <Badge key={skill} variant="secondary" className="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <p className="mt-2 text-sm">{invite.message}</p>
                      </div>
                    </div>
                    {invite.status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                        onClick={() => handleCancelInvite(invite.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 