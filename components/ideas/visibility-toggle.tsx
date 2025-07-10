"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface VisibilityToggleProps {
  ideaId: string
  initialVisibility: "PUBLIC" | "PRIVATE"
  onVisibilityChange?: (newVisibility: "PUBLIC" | "PRIVATE") => void
}

export function VisibilityToggle({ ideaId, initialVisibility, onVisibilityChange }: VisibilityToggleProps) {
  const [visibility, setVisibility] = useState(initialVisibility)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const toggleVisibility = async () => {
    const newVisibility = visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC"
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/ideas/${ideaId}/visibility`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ visibility: newVisibility }),
      })

      if (!response.ok) {
        throw new Error("Failed to update visibility")
      }

      setVisibility(newVisibility)
      onVisibilityChange?.(newVisibility)

      toast({
        title: `Idea is now ${newVisibility.toLowerCase()}`,
        description: newVisibility === "PUBLIC" 
          ? "Everyone can now see your idea" 
          : "Only you can see your idea now",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update visibility. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={visibility === "PUBLIC" ? "default" : "secondary"}
        className="cursor-default"
      >
        {visibility === "PUBLIC" ? (
          <>
            <Eye className="w-3 h-3 mr-1" />
            Public
          </>
        ) : (
          <>
            <EyeOff className="w-3 h-3 mr-1" />
            Private
          </>
        )}
      </Badge>
      <Button
        variant="outline"
        size="sm"
        onClick={toggleVisibility}
        disabled={isUpdating}
      >
        Make {visibility === "PUBLIC" ? "Private" : "Public"}
      </Button>
    </div>
  )
} 