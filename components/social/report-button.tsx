"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Flag } from "lucide-react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface ReportButtonProps {
  targetId: string
  targetType: "IDEA" | "PROJECT" | "COMMENT" | "USER"
  authorId: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const REPORT_REASONS = [
  { value: "INAPPROPRIATE", label: "Inappropriate Content" },
  { value: "SPAM", label: "Spam" },
  { value: "HARASSMENT", label: "Harassment" },
  { value: "MISINFORMATION", label: "Misinformation" },
  { value: "COPYRIGHT", label: "Copyright Violation" },
  { value: "OTHER", label: "Other" },
]

export function ReportButton({
  targetId,
  targetType,
  authorId,
  size = "md",
  className,
}: ReportButtonProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [reason, setReason] = useState<string>("")
  const [details, setDetails] = useState("")

  const handleReport = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to report content",
        variant: "destructive",
      })
      return
    }

    if (session.user?.id === authorId) {
      toast({
        title: "Cannot report own content",
        description: "You cannot report your own content",
        variant: "destructive",
      })
      return
    }

    setIsDialogOpen(true)
  }

  const submitReport = async () => {
    if (!reason) {
      toast({
        title: "Reason required",
        description: "Please select a reason for reporting",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetId,
          targetType,
          reason,
          details,
        }),
      })

      if (response.ok) {
        toast({
          title: "Report submitted",
          description: "Thank you for helping keep our community safe",
        })
        setIsDialogOpen(false)
        setReason("")
        setDetails("")
      } else {
        throw new Error("Failed to submit report")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report",
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
    <>
      <Button
        size="sm"
        variant="ghost"
        className={cn(
          sizeClasses[size],
          "transition-all duration-200 hover:scale-105",
          "text-gray-500 hover:text-red-500 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-950",
          className,
        )}
        onClick={handleReport}
        disabled={isLoading}
      >
        <Flag className="w-4 h-4" />
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Content</DialogTitle>
            <DialogDescription>
              Help us understand why you're reporting this content. Your report will be reviewed by our team.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_REASONS.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Additional Details</Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Please provide any additional context that will help us understand the issue"
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitReport} disabled={isLoading}>
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
