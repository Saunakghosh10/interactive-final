"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { CreateIdeaForm } from "@/components/ideas/create-idea-form"
import { Loading } from "@/components/ui/loading"
import { useToast } from "@/hooks/use-toast"

export default function CreateIdeaPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" variant="pulse" />
      </div>
    )
  }

  if (!session) {
    router.push("/auth/signin?callbackUrl=/ideas/create")
    return null
  }

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const idea = await response.json()
        router.push(`/ideas/${idea.id}`)
      } else {
        throw new Error("Failed to create idea")
      }
    } catch (error) {
      throw error
    }
  }

  const handleSaveDraft = async (data: any) => {
    try {
      await fetch("/api/ideas/drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
    } catch (error) {
      // Silent fail for draft saving
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CreateIdeaForm onSubmit={handleSubmit} onSaveDraft={handleSaveDraft} />
      </div>
    </div>
  )
}
