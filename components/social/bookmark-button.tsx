"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface BookmarkButtonProps {
  ideaId: string
  isBookmarked?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function BookmarkButton({
  ideaId,
  isBookmarked = false,
  size = "md",
  className,
}: BookmarkButtonProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isMarked, setIsMarked] = useState(isBookmarked)
  const [isLoading, setIsLoading] = useState(false)

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to bookmark ideas",
        variant: "destructive",
      })
      return
    }

    if (isLoading) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/ideas/${ideaId}/bookmark`, {
        method: isMarked ? "DELETE" : "POST",
      })

      if (response.ok) {
        setIsMarked(!isMarked)
        toast({
          title: isMarked ? "Removed from bookmarks" : "Added to bookmarks",
          description: isMarked ? "Idea removed from your bookmarks" : "Idea saved to your bookmarks",
        })
      } else {
        throw new Error("Failed to update bookmark")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bookmark status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: "h-8 px-2",
    md: "h-9 px-3",
    lg: "h-10 px-4",
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      className={cn(
        sizeClasses[size],
        "transition-all duration-200 hover:scale-105",
        isMarked
          ? "text-violet-500 hover:text-violet-600 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950 dark:hover:bg-violet-900"
          : "text-gray-500 hover:text-violet-500 hover:bg-violet-50 dark:text-gray-400 dark:hover:text-violet-400 dark:hover:bg-violet-950",
        className,
      )}
      onClick={handleBookmark}
      disabled={isLoading}
    >
      <Bookmark
        className={cn(
          "w-4 h-4",
          "transition-all duration-200",
          isMarked && "fill-current scale-110"
        )}
      />
    </Button>
  )
} 