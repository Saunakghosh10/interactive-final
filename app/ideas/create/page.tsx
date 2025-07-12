"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { CreateIdeaForm } from "@/components/ideas/create-idea-form"
import { Loading } from "@/components/ui/loading"
import { useToast } from "@/hooks/use-toast"

export default function CreateIdeaPage() {
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin?callbackUrl=/ideas/create')
    },
  })
  const { toast } = useToast()

  // Handle loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" variant="pulse" />
      </div>
    )
  }

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          authorId: session?.user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create idea")
      }

      const idea = await response.json()
      toast({
        title: "Success",
        description: "Your idea has been created successfully!",
      })
      router.push(`/ideas/${idea.id}`)
    } catch (error) {
      console.error("Error creating idea:", error)
      toast({
        title: "Error",
        description: "Failed to create idea. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSaveDraft = async (data: any) => {
    if (!session?.user?.id) return

    try {
      const response = await fetch("/api/ideas/drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          authorId: session.user.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save draft")
      }

      toast({
        title: "Draft Saved",
        description: "Your idea draft has been saved.",
      })
    } catch (error) {
      console.error("Error saving draft:", error)
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Only render the form if we have a valid session
  if (!session?.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CreateIdeaForm onSubmit={handleSubmit} onSaveDraft={handleSaveDraft} />
      </div>
    </div>
  )
}
