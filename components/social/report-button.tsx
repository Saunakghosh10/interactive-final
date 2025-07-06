"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { Flag, AlertTriangle, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReportButtonProps {
  targetId: string
  targetType: "user" | "idea" | "comment"
  trigger?: React.ReactNode
  className?: string
}

const reportReasons = [
  { value: "SPAM", label: "Spam or unwanted content" },
  { value: "INAPPROPRIATE_CONTENT", label: "Inappropriate or offensive content" },
  { value: "HARASSMENT", label: "Harassment or bullying" },
  { value: "COPYRIGHT_VIOLATION", label: "Copyright violation" },
  { value: "MISINFORMATION", label: "False or misleading information" },
  { value: "OTHER", label: "Other (please specify)" },
]

export function ReportButton({ targetId, targetType, trigger, className }: ReportButtonProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedReason, setSelectedReason] = useState("")
  const [description, setDescription] = useState("")
  const [showWarning, setShowWarning] = useState(false)

  const handleSubmit = async () => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to report content",
        variant: "destructive",
      })
      return
    }

    if (!selectedReason) {
      setShowWarning(true)
      return
    }

    if (selectedReason === "OTHER" && !description.trim()) {
      setShowWarning(true)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetId,
          targetType,
          reason: selectedReason,
          description: description.trim() || undefined,
        }),
      })

      if (response.ok) {
        toast({
          title: "Report submitted",
          description: "Thank you for helping keep our community safe. We'll review your report.",
        })
        setIsOpen(false)
        setSelectedReason("")
        setDescription("")
        setShowWarning(false)
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to submit report")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit report",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const defaultTrigger = (
    <Button
      size="sm"
      variant="ghost"
      className={cn(
        "text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors",
        className,
      )}
    >
      <Flag className="w-4 h-4 mr-1" />
      Report
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md border-violet-200 dark:border-violet-800">
        <DialogHeader>
          <DialogTitle className="text-violet-900 dark:text-violet-100 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-amber-500" />
            Report Content
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">Help us maintain a safe and respectful community</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Alert */}
          {showWarning && (
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                {selectedReason === "OTHER" && !description.trim()
                  ? "Please provide a description for 'Other' reports."
                  : "Please select a reason for reporting."}
              </AlertDescription>
            </Alert>
          )}

          {/* Report Reasons */}
          <div className="space-y-3">
            <Label className="text-violet-900 dark:text-violet-100">Why are you reporting this {targetType}?</Label>
            <RadioGroup
              value={selectedReason}
              onValueChange={(value) => {
                setSelectedReason(value)
                setShowWarning(false)
              }}
              className="space-y-2"
            >
              {reportReasons.map((reason) => (
                <div key={reason.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={reason.value}
                    id={reason.value}
                    className="border-violet-300 text-violet-600"
                  />
                  <Label htmlFor={reason.value} className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    {reason.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Additional Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-violet-900 dark:text-violet-100">
              Additional details {selectedReason === "OTHER" && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="description"
              placeholder="Please provide more context about your report..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                setShowWarning(false)
              }}
              className="border-violet-200 dark:border-violet-800 focus:border-violet-500 focus:ring-violet-500"
              rows={3}
            />
          </div>

          {/* Privacy Notice */}
          <div className="p-3 bg-violet-50 dark:bg-violet-950 rounded-lg border border-violet-200 dark:border-violet-800">
            <p className="text-xs text-violet-700 dark:text-violet-300">
              <Shield className="w-3 h-3 inline mr-1" />
              Your report will be reviewed by our moderation team. Reports are kept confidential and help us improve the
              platform.
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false)
                setSelectedReason("")
                setDescription("")
                setShowWarning(false)
              }}
              className="bg-transparent border-violet-200 hover:bg-violet-50 dark:hover:bg-violet-950"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
