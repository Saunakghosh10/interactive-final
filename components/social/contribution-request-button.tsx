"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { HandshakeIcon, Loader2 } from "lucide-react"

interface ContributionRequestButtonProps {
  ideaId: string
  authorId: string
  disabled?: boolean
}

export function ContributionRequestButton({
  ideaId,
  authorId,
  disabled = false,
}: ContributionRequestButtonProps) {
  const { data: session, status: sessionStatus } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [hasRequested, setHasRequested] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [isCheckingStatus, setIsCheckingStatus] = useState(true)

  useEffect(() => {
    if (session?.user?.id && ideaId) {
      checkExistingRequest()
    } else {
      setIsCheckingStatus(false)
    }
  }, [session, ideaId])

  const checkExistingRequest = async () => {
    try {
      const response = await fetch(`/api/ideas/${ideaId}/contribute/check`)
      if (response.ok) {
        const { hasRequested: existingRequest } = await response.json()
        setHasRequested(existingRequest)
    }
    } catch (error) {
      console.error("Error checking contribution request:", error)
      toast({
        title: "Error",
        description: "Failed to check contribution status",
        variant: "destructive",
      })
    } finally {
      setIsCheckingStatus(false)
    }
  }

  const handleContributionRequest = async () => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to request contribution",
        variant: "destructive",
      })
      return
    }

    if (session.user?.id === authorId) {
      toast({
        title: "Cannot contribute to own idea",
        description: "You cannot request to contribute to your own idea",
        variant: "destructive",
      })
      return
    }

    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please provide a message explaining how you'd like to contribute",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/ideas/${ideaId}/contribute`, {
        method: hasRequested ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: hasRequested ? undefined : JSON.stringify({ message }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || "Failed to process request")
      }

      setHasRequested(!hasRequested)
      setIsDialogOpen(false)
        setMessage("")

      toast({
        title: hasRequested ? "Request withdrawn" : "Request sent!",
        description: hasRequested
          ? "Your contribution request has been withdrawn"
          : "Your request to contribute has been sent to the author",
      })
    } catch (error) {
      console.error("Contribution request error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process contribution request",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Don't show the button if:
  // 1. It's the author's own idea
  // 2. We're still checking the session status
  // 3. We're still checking the request status
  if (
    session?.user?.id === authorId ||
    sessionStatus === "loading" ||
    isCheckingStatus
  ) {
    return null
  }

  return (
    <>
        <Button
        variant={hasRequested ? "outline" : "default"}
        onClick={() => {
          if (!session) {
            toast({
              title: "Sign in required",
              description: "Please sign in to request contribution",
              variant: "destructive",
            })
            return
          }
          setIsDialogOpen(true)
        }}
        disabled={disabled || isLoading}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <HandshakeIcon className="h-4 w-4" />
        )}
        {hasRequested ? "Cancel Request" : "Request to Contribute"}
        </Button>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setMessage("")
        }
        setIsDialogOpen(open)
      }}>
        <DialogContent>
        <DialogHeader>
            <DialogTitle>Request to Contribute</DialogTitle>
            <DialogDescription>
              Send a message to the author explaining how you'd like to contribute to this idea.
            </DialogDescription>
        </DialogHeader>

          <div className="py-4">
            <Textarea
              placeholder="Share your thoughts, skills, and how you can help bring this idea to life..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
              <Button
                variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                setMessage("")
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleContributionRequest}
              disabled={isLoading || !message.trim()}
            >
              {isLoading ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
