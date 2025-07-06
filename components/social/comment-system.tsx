"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ReportButton } from "./report-button"
import { MessageCircle, Reply, Edit, Trash2, MoreHorizontal, Calendar, Flag } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface Comment {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  isEdited: boolean
  author: {
    id: string
    name?: string | null
    username?: string | null
    image?: string | null
  }
  replies?: Comment[]
  _count: {
    replies: number
  }
}

interface CommentSystemProps {
  targetId: string
  targetType: "idea" | "project"
  comments: Comment[]
  onCommentsUpdate?: (comments: Comment[]) => void
}

interface CommentItemProps {
  comment: Comment
  targetId: string
  targetType: "idea" | "project"
  depth?: number
  onReply?: (parentId: string, content: string) => void
  onEdit?: (commentId: string, content: string) => void
  onDelete?: (commentId: string) => void
}

function CommentItem({ comment, targetId, targetType, depth = 0, onReply, onEdit, onDelete }: CommentItemProps) {
  const { data: session } = useSession()
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [editContent, setEditContent] = useState(comment.content)
  const [showReplies, setShowReplies] = useState(depth < 2)

  const isOwnComment = session?.user?.id === comment.author.id
  const maxDepth = 3

  const handleReply = async () => {
    if (!replyContent.trim()) return

    try {
      await onReply?.(comment.id, replyContent)
      setReplyContent("")
      setIsReplying(false)
      toast({
        title: "Reply posted!",
        description: "Your reply has been added to the conversation.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive",
      })
    }
  }

  const handleEdit = async () => {
    if (!editContent.trim()) return

    try {
      await onEdit?.(comment.id, editContent)
      setIsEditing(false)
      toast({
        title: "Comment updated!",
        description: "Your comment has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await onDelete?.(comment.id)
        toast({
          title: "Comment deleted",
          description: "Your comment has been removed.",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete comment",
          variant: "destructive",
        })
      }
    }
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  return (
    <div className={cn("space-y-3", depth > 0 && "ml-8 border-l-2 border-violet-200 dark:border-violet-800 pl-4")}>
      <Card className="border-violet-200 dark:border-violet-800 bg-white dark:bg-gray-900">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.author.image || ""} alt={comment.author.name || ""} />
                <AvatarFallback className="bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-400 text-sm">
                  {comment.author.name?.[0]?.toUpperCase() || comment.author.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {comment.author.name || comment.author.username || "Anonymous"}
                </p>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(comment.createdAt)}</span>
                  {comment.isEdited && (
                    <Badge variant="secondary" className="text-xs">
                      Edited
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOwnComment && (
                    <>
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem>
                    <ReportButton
                      targetId={comment.id}
                      targetType="comment"
                      trigger={
                        <div className="flex items-center">
                          <Flag className="w-4 h-4 mr-2" />
                          Report
                        </div>
                      }
                    />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleEdit}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
          )}

              <div className="flex items-center space-x-4 pt-2">
                {depth < maxDepth && (
                  <Button
                variant="ghost"
                    size="sm"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => setIsReplying(!isReplying)}
                  >
                <Reply className="w-4 h-4 mr-1" />
                    Reply
                  </Button>
                )}
                {comment._count.replies > 0 && (
                  <Button
                variant="ghost"
                    size="sm"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => setShowReplies(!showReplies)}
                  >
                <MessageCircle className="w-4 h-4 mr-1" />
                {showReplies ? "Hide" : "Show"} {comment._count.replies} {comment._count.replies === 1 ? "reply" : "replies"}
                  </Button>
                )}
              </div>

          {isReplying && (
            <div className="space-y-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => setIsReplying(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleReply}>
                  Post Reply
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              targetId={targetId}
              targetType={targetType}
              depth={depth + 1}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CommentSystem({ targetId, targetType, comments: initialComments, onCommentsUpdate }: CommentSystemProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitComment = async () => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment",
        variant: "destructive",
      })
      return
    }

    if (!newComment.trim()) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/ideas/${targetId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to post comment")
      }

        const comment = await response.json()
      const updatedComments = [comment, ...comments]
      setComments(updatedComments)
      onCommentsUpdate?.(updatedComments)
        setNewComment("")
        toast({
          title: "Comment posted!",
          description: "Your comment has been added to the conversation.",
        })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReply = async (parentId: string, content: string) => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to reply",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/ideas/${targetId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
        body: JSON.stringify({
          content: content.trim(),
          parentId,
        }),
    })

      if (!response.ok) {
        throw new Error("Failed to post reply")
      }

      const reply = await response.json()
      const updatedComments = updateCommentsWithReply(comments, parentId, reply)
      setComments(updatedComments)
      onCommentsUpdate?.(updatedComments)
    } catch (error) {
      throw error
    }
  }

  const handleEdit = async (commentId: string, content: string) => {
    try {
      const response = await fetch(`/api/ideas/${targetId}/comments/${commentId}`, {
        method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
        body: JSON.stringify({
          content: content.trim(),
        }),
    })

      if (!response.ok) {
        throw new Error("Failed to update comment")
      }

      const updatedComment = await response.json()
      const updatedComments = updateCommentsWithEdit(comments, commentId, updatedComment)
      setComments(updatedComments)
      onCommentsUpdate?.(updatedComments)
    } catch (error) {
      throw error
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      const response = await fetch(`/api/ideas/${targetId}/comments/${commentId}`, {
      method: "DELETE",
    })

      if (!response.ok) {
        throw new Error("Failed to delete comment")
      }

      const updatedComments = removeCommentFromTree(comments, commentId)
        setComments(updatedComments)
        onCommentsUpdate?.(updatedComments)
    } catch (error) {
      throw error
    }
  }

  // Helper function to update comments tree with a new reply
  const updateCommentsWithReply = (comments: Comment[], parentId: string, newReply: Comment): Comment[] => {
    return comments.map((comment) => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [newReply, ...(comment.replies || [])],
          _count: {
            ...comment._count,
            replies: (comment._count.replies || 0) + 1,
          },
        }
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: updateCommentsWithReply(comment.replies, parentId, newReply),
        }
      }
      return comment
    })
  }

  // Helper function to update comments tree with edited comment
  const updateCommentsWithEdit = (comments: Comment[], commentId: string, updatedComment: Comment): Comment[] => {
    return comments.map((comment) => {
      if (comment.id === commentId) {
        return { ...comment, ...updatedComment }
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: updateCommentsWithEdit(comment.replies, commentId, updatedComment),
        }
      }
      return comment
    })
  }

  // Helper function to remove a comment from the tree
  const removeCommentFromTree = (comments: Comment[], commentId: string): Comment[] => {
    return comments.filter((comment) => {
      if (comment.id === commentId) {
        return false
      }
      if (comment.replies) {
        comment.replies = removeCommentFromTree(comment.replies, commentId)
      }
      return true
    })
  }

  return (
    <div className="space-y-6">
          {session ? (
        <div className="space-y-2">
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
                  />
              <div className="flex justify-end">
            <Button onClick={handleSubmitComment} disabled={isSubmitting}>
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </div>
          ) : (
        <Card>
          <CardContent className="p-4">
            <p className="text-center text-gray-500">
              Please{" "}
              <Button variant="link" className="px-1" asChild>
                <a href="/auth/signin">sign in</a>
              </Button>{" "}
              to join the conversation.
            </p>
        </CardContent>
      </Card>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            targetId={targetId}
            targetType={targetType}
            onReply={handleReply}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        {comments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  )
}
