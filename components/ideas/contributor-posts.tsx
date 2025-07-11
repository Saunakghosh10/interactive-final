"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ContributorPostForm } from "@/components/ideas/contributor-post-form"
import { useToast } from "@/hooks/use-toast"
import { Edit2, Globe, Lock, MoreVertical, Plus, Trash2, Users } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ContributorPost {
  id: string
  title: string
  content: string
  visibility: string
  createdAt: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
  _count: {
    comments: number
    sparks: number
  }
}

interface ContributorPostsProps {
  ideaId: string
  groupId?: string
  isContributor: boolean
}

export function ContributorPosts({ ideaId, groupId, isContributor }: ContributorPostsProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [posts, setPosts] = useState<ContributorPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<ContributorPost | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const fetchPosts = async (cursor?: string) => {
    try {
      const url = new URL(`/api/ideas/${ideaId}/posts`, window.location.origin)
      if (groupId) url.searchParams.set("groupId", groupId)
      if (cursor) url.searchParams.set("cursor", cursor)

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        if (cursor) {
          setPosts([...posts, ...data.posts])
        } else {
          setPosts(data.posts)
        }
        setNextCursor(data.nextCursor)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchPosts()
    }
  }, [session, ideaId, groupId])

  const handleLoadMore = () => {
    if (nextCursor && !isLoadingMore) {
      setIsLoadingMore(true)
      fetchPosts(nextCursor)
    }
  }

  const handleDelete = async (postId: string) => {
    try {
      const response = await fetch(`/api/ideas/${ideaId}/posts/${postId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPosts(posts.filter((p) => p.id !== postId))
        toast({
          title: "Success",
          description: "Post deleted successfully",
        })
      } else {
        throw new Error("Failed to delete post")
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      })
    }
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "GROUP":
        return <Users className="w-4 h-4" />
      case "IDEA":
        return <Lock className="w-4 h-4" />
      case "PUBLIC":
        return <Globe className="w-4 h-4" />
      default:
        return null
    }
  }

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case "GROUP":
        return "Group Members Only"
      case "IDEA":
        return "Contributors Only"
      case "PUBLIC":
        return "Public"
      default:
        return visibility
    }
  }

  if (!session || (!isContributor && !posts.some((p) => p.visibility === "PUBLIC"))) {
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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contributor Posts</CardTitle>
            {isContributor && (
              <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                New Post
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {posts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No posts yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarImage src={post.user.image || ""} />
                          <AvatarFallback>
                            {post.user.name?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{post.user.name}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                            <Badge variant="secondary" className="flex items-center gap-1">
                              {getVisibilityIcon(post.visibility)}
                              {getVisibilityLabel(post.visibility)}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold mt-2">{post.title}</h3>
                          <div
                            className="mt-2 prose prose-sm dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                          />
                          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                            <span>{post._count.comments} comments</span>
                            <span>{post._count.sparks} sparks</span>
                          </div>
                        </div>
                      </div>
                      {post.user.id === session?.user?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingPost(post)}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-500"
                              onClick={() => handleDelete(post.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {nextCursor && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <ContributorPostForm
            ideaId={ideaId}
            groupId={groupId}
            onSuccess={() => {
              setIsCreateDialogOpen(false)
              fetchPosts()
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
        <DialogContent className="max-w-3xl">
          {editingPost && (
            <ContributorPostForm
              ideaId={ideaId}
              groupId={groupId}
              post={editingPost}
              onSuccess={() => {
                setEditingPost(null)
                fetchPosts()
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
} 