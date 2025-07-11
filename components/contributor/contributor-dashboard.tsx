"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loading } from "@/components/ui/loading"
import { useToast } from "@/hooks/use-toast"
import { HandshakeIcon, Clock, CheckCircle, XCircle, AlertCircle, Calendar as CalendarIcon } from "lucide-react"
import Link from "next/link"

interface ContributionRequest {
  id: string
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN"
  message: string
  skills: string[]
  experience: string
  createdAt: string
  respondedAt: string | null
  idea: {
    id: string
    title: string
    description: string
    category: string
    author: {
      id: string
      name: string
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

export function ContributorDashboard() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [requests, setRequests] = useState<GroupedRequests>({
    pending: [],
    accepted: [],
    rejected: [],
    withdrawn: [],
  })
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const response = await fetch(`/api/users/me/contributions`)
        if (response.ok) {
          const data = await response.json()
          setRequests(data)
        } else {
          throw new Error("Failed to fetch contributions")
        }
      } catch (error) {
        console.error("Error fetching contributions:", error)
        toast({
          title: "Error",
          description: "Failed to load your contributions",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchContributions()
  }, [])

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

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" />
      </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-violet-600" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Contribution Requests */}
        <Card className="lg:col-span-2">
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
                      <Card key={request.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <Avatar>
                                <AvatarImage src={request.idea.author.image || ""} />
                                <AvatarFallback>
                                  {request.idea.author.name?.[0]?.toUpperCase() || "A"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <Link
                                  href={`/ideas/${request.idea.id}`}
                                  className="font-semibold hover:text-violet-600 transition-colors"
                                >
                                  {request.idea.title}
                                </Link>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  by {request.idea.author.name}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {request.skills.map((skill) => (
                                    <Badge key={skill} variant="secondary">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                                <p className="mt-2 text-sm">{request.message}</p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(status)}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(status)}
                                <span>{status}</span>
                              </div>
                            </Badge>
                          </div>
                          <div className="mt-4 text-sm text-gray-500">
                            Requested on {formatDate(request.createdAt)}
                            {request.respondedAt && (
                              <> • Responded on {formatDate(request.respondedAt)}</>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 