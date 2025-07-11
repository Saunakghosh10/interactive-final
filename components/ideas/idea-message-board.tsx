"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, Send, Users } from "lucide-react"

interface Group {
  id: string
  name: string
  description: string | null
  members: {
    user: {
      id: string
      name: string | null
      image: string | null
    }
    role: string
  }[]
  _count: {
    messages: number
  }
}

interface Message {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

interface IdeaMessageBoardProps {
  ideaId: string
  isContributor: boolean
  isOwner: boolean
}

export function IdeaMessageBoard({ ideaId, isContributor, isOwner }: IdeaMessageBoardProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupDescription, setNewGroupDescription] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(`/api/ideas/${ideaId}/groups`)
        if (response.ok) {
          const data = await response.json()
          setGroups(data)
          if (data.length > 0 && !selectedGroup) {
            setSelectedGroup(data[0].id)
          }
        }
      } catch (error) {
        console.error("Error fetching groups:", error)
        toast({
          title: "Error",
          description: "Failed to load message groups",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.id && (isContributor || isOwner)) {
      fetchGroups()
    }
  }, [session, ideaId, isContributor, isOwner])

  // Fetch messages for selected group
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedGroup) return

      setIsLoadingMessages(true)
      try {
        const response = await fetch(`/api/ideas/${ideaId}/groups/${selectedGroup}/messages`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages)
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        })
      } finally {
        setIsLoadingMessages(false)
      }
    }

    fetchMessages()
  }, [selectedGroup])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return

    setIsCreatingGroup(true)
    try {
      const response = await fetch(`/api/ideas/${ideaId}/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDescription,
        }),
      })

      if (response.ok) {
        const newGroup = await response.json()
        setGroups([...groups, newGroup])
        setSelectedGroup(newGroup.id)
        setNewGroupName("")
        setNewGroupDescription("")
        setIsCreateGroupOpen(false)
        toast({
          title: "Success",
          description: "Group created successfully",
        })
      } else {
        throw new Error("Failed to create group")
      }
    } catch (error) {
      console.error("Error creating group:", error)
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      })
    } finally {
      setIsCreatingGroup(false)
    }
  }

  const handleSendMessage = async () => {
    if (!selectedGroup || !newMessage.trim()) return

    try {
      const response = await fetch(`/api/ideas/${ideaId}/groups/${selectedGroup}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      })

      if (response.ok) {
        const message = await response.json()
        setMessages([message, ...messages])
        setNewMessage("")
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    }
  }

  if (!session || (!isContributor && !isOwner)) {
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
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-none">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-violet-600" />
            Message Board
          </CardTitle>
          <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                New Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Group Name</label>
                  <Input
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Enter group name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="Enter group description"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleCreateGroup}
                  disabled={isCreatingGroup || !newGroupName.trim()}
                >
                  {isCreatingGroup ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    "Create Group"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex gap-4 p-6 min-h-0">
        {/* Groups List */}
        <div className="w-1/4 flex flex-col gap-2">
          {groups.map((group) => (
            <Button
              key={group.id}
              variant={selectedGroup === group.id ? "default" : "outline"}
              className="justify-start"
              onClick={() => setSelectedGroup(group.id)}
            >
              <div className="truncate">
                <div className="font-medium">{group.name}</div>
                <div className="text-xs text-gray-500">
                  {group._count.messages} messages • {group.members.length} members
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col gap-4">
          {selectedGroup ? (
            <>
              <ScrollArea className="flex-1">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.user.id === session?.user?.id ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.user.image || ""} />
                        <AvatarFallback>
                          {message.user.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`flex flex-col ${
                          message.user.id === session?.user?.id ? "items-end" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{message.user.name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <div
                          className={`mt-1 px-4 py-2 rounded-lg ${
                            message.user.id === session?.user?.id
                              ? "bg-violet-600 text-white"
                              : "bg-gray-100 dark:bg-gray-800"
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a group to view messages
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 