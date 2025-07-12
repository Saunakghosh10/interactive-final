"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface VisibilityToggleProps {
  ideaId: string
  initialVisibility: "PUBLIC" | "PRIVATE"
  onVisibilityChange?: (newVisibility: "PUBLIC" | "PRIVATE") => void
}

export function VisibilityToggle({ ideaId, initialVisibility, onVisibilityChange }: VisibilityToggleProps) {
  const [visibility, setVisibility] = useState(initialVisibility)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const { toast } = useToast()

  const updateVisibility = async (newVisibility: "PUBLIC" | "PRIVATE") => {
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
          : "Only you and your contributors can see your idea now",
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

  const getConfirmationContent = () => {
    const newVisibility = visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC"
    
    if (newVisibility === "PUBLIC") {
      return {
        title: "Make idea public?",
        description: "Ideas made public can be seen by everyone for as long as the idea stays public. This can help you get more visibility and potential contributors.",
        confirmText: "Make Public",
      }
    } else {
      return {
        title: "Make idea private?",
        description: "A public idea increases the likelihood you might get assistance on your work! Only you and your contributors will be able to see the idea.",
        confirmText: "Make Private",
      }
    }
  }

  const confirmationContent = getConfirmationContent()

  return (
    <>
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
              Only visible to you and your contributors
            </>
          )}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfirmDialog(true)}
          disabled={isUpdating}
        >
          Make {visibility === "PUBLIC" ? "Private" : "Public"}
        </Button>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmationContent.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const newVisibility = visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC"
                updateVisibility(newVisibility)
              }}
            >
              {confirmationContent.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 