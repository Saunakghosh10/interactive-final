"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RichTextEditor } from "@/components/ideas/rich-text-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Globe, Lock, Users } from "lucide-react"

interface ContributorPostFormProps {
  ideaId: string
  groupId?: string
  post?: {
    id: string
    title: string
    content: string
    visibility: string
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export function ContributorPostForm({
  ideaId,
  groupId,
  post,
  onSuccess,
  onCancel,
}: ContributorPostFormProps) {
  const { toast } = useToast()
  const [title, setTitle] = useState(post?.title || "")
  const [content, setContent] = useState(post?.content || "")
  const [visibility, setVisibility] = useState(post?.visibility || (groupId ? "GROUP" : "IDEA"))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(
        post
          ? `/api/ideas/${ideaId}/posts/${post.id}`
          : `/api/ideas/${ideaId}/posts`,
        {
          method: post ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            visibility,
            groupId,
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to save post")
      }

      toast({
        title: "Success",
        description: post ? "Post updated successfully" : "Post created successfully",
      })

      onSuccess?.()
    } catch (error) {
      console.error("Error saving post:", error)
      toast({
        title: "Error",
        description: post ? "Failed to update post" : "Failed to create post",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{post ? "Edit Post" : "Create Post"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Content</label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write your post content..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Visibility</label>
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {groupId && (
                <SelectItem value="GROUP">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Group Members Only
                  </div>
                </SelectItem>
              )}
              <SelectItem value="IDEA">
                <div className="flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  Contributors Only
                </div>
              </SelectItem>
              <SelectItem value="PUBLIC">
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  Public
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : post ? (
              "Update Post"
            ) : (
              "Create Post"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 