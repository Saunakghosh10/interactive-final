"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HandshakeIcon, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Loading } from "@/components/ui/loading"

interface ContributionRequest {
  id: string
  message: string
  skills: string[]
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN"
  createdAt: string
  respondedAt: string | null
  idea: {
    id: string
    title: string
    author: {
      id: string
      name: string | null
      image: string | null
    }
    ideaSkills: {
      skill: {
        id: string
        name: string
        category: string
      }
    }[]
  }
}

interface GroupedRequests {
  pending: ContributionRequest[]
  accepted: ContributionRequest[]
  rejected: ContributionRequest[]
  withdrawn: ContributionRequest[]
}

export function ContributionDashboard() {
  const [requests, setRequests] = useState<GroupedRequests>({
    pending: [],
    accepted: [],
    rejected: [],
    withdrawn: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/users/me/contributions")
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      }
    } catch (error) {
      console.error("Error fetching contribution requests:", error)
      toast({
        title: "Error",
        description: "Failed to load contribution requests",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResponse = async (requestId: string, ideaId: string, status: "ACCEPTED" | "REJECTED") => {
    try {
      const response = await fetch(`/api/ideas/${ideaId}/invite/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          requestId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${status.toLowerCase()} request`)
      }

      const data = await response.json()
      toast({
        title: "Success",
        description: data.message || `Contribution request ${status.toLowerCase()}`,
      })
      fetchRequests() // Refresh the list
    } catch (error) {
      console.error(`Error ${status.toLowerCase()}ing request:`, error)
      toast({
        title: "Error",
        description: `Failed to ${status.toLowerCase()} request`,
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "ACCEPTED":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "REJECTED":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "WITHDRAWN":
        return <AlertCircle className="w-4 h-4 text-gray-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "ACCEPTED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "WITHDRAWN":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return ""
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" />
      </div>
    )
  }

  const totalRequests = 
    requests.pending.length + 
    requests.accepted.length + 
    requests.rejected.length + 
    requests.withdrawn.length

  if (totalRequests === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-gray-500">
            <HandshakeIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No contribution requests yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{requests.pending.length}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Accepted</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{requests.accepted.length}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{requests.rejected.length}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Withdrawn</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{requests.withdrawn.length}</p>
              </div>
              <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-900">
                <AlertCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contribution Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HandshakeIcon className="w-5 h-5 mr-2 text-violet-600" />
            Contribution Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">
                Pending ({requests.pending.length})
              </TabsTrigger>
              <TabsTrigger value="accepted">
                Accepted ({requests.accepted.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({requests.rejected.length})
              </TabsTrigger>
              <TabsTrigger value="withdrawn">
                Withdrawn ({requests.withdrawn.length})
              </TabsTrigger>
            </TabsList>

            {(["pending", "accepted", "rejected", "withdrawn"] as const).map((status) => (
              <TabsContent key={status} value={status} className="space-y-4">
                {requests[status].length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <HandshakeIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No {status.toLowerCase()} contribution requests</p>
                  </div>
                ) : (
                  requests[status].map((request) => (
                    <div
                      key={request.id}
                      className="flex items-start justify-between p-4 border rounded-lg bg-white dark:bg-gray-800"
                    >
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarImage
                            src={request.idea.author.image || ""}
                            alt={request.idea.author.name || ""}
                          />
                          <AvatarFallback>
                            {request.idea.author.name?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{request.idea.title}</h4>
                          <p className="text-sm text-gray-500">
                            From {request.idea.author.name}
                          </p>
                          <p className="text-sm mt-1">{request.message}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {request.skills.map((skill) => (
                              <Badge key={skill} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          <div className="mt-2">
                            <Badge className={getStatusColor(request.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(request.status)}
                                {request.status}
                              </span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {status === "pending" && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => handleResponse(request.id, request.idea.id, "ACCEPTED")}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleResponse(request.id, request.idea.id, "REJECTED")}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 