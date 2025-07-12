"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { MediaUpload } from "./media-upload"

// Define MediaFile type to match the one in media-upload.tsx
interface MediaFile {
  id?: string
  name: string
  url: string
  type: "image" | "pdf" | "document"
  size: number
}

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.enum([
    "TECHNOLOGY",
    "BUSINESS",
    "DESIGN",
    "HEALTHCARE",
    "EDUCATION",
    "ENTERTAINMENT",
    "ENVIRONMENT",
    "SOCIAL_IMPACT",
    "FINANCE",
    "LIFESTYLE",
    "OTHER"
  ]),
  visibility: z.enum(["PUBLIC", "PRIVATE"]),
  tags: z.array(z.string()).optional(),
  media: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    url: z.string(),
    type: z.enum(["image", "pdf", "document"]),
    size: z.number()
  })).optional(),
})

type FormData = z.infer<typeof formSchema>

interface CreateIdeaFormProps {
  onSubmit: (data: FormData) => Promise<void>
  onSaveDraft: (data: FormData) => Promise<void>
  isEditing?: boolean
  initialData?: {
    id: string
    title: string
    description: string
    category: "TECHNOLOGY" | "BUSINESS" | "DESIGN" | "HEALTHCARE" | "EDUCATION" | "ENTERTAINMENT" | "ENVIRONMENT" | "SOCIAL_IMPACT" | "FINANCE" | "LIFESTYLE" | "OTHER"
    tags: string[]
    media: MediaFile[]
  }
}

export function CreateIdeaForm({ onSubmit, onSaveDraft, isEditing = false, initialData }: CreateIdeaFormProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      category: "OTHER",
      visibility: "PUBLIC",
      tags: [],
      media: [],
    },
  })

  // Don't render the form if we don't have a session
  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session?.user) {
    router.push("/auth/signin?callbackUrl=/ideas/create")
    return null
  }

  const handleFormSubmit = async (values: FormData) => {
    try {
      setIsSubmitting(true)
      await onSubmit(values)
    } catch (error) {
      console.error("Form submission error:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDraftSave = async () => {
    try {
      const values = form.getValues()
      await onSaveDraft(values)
    } catch (error) {
      console.error("Draft save error:", error)
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter your idea title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your idea in detail"
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="TECHNOLOGY">Technology</SelectItem>
                  <SelectItem value="BUSINESS">Business</SelectItem>
                  <SelectItem value="DESIGN">Design</SelectItem>
                  <SelectItem value="HEALTHCARE">Healthcare</SelectItem>
                  <SelectItem value="EDUCATION">Education</SelectItem>
                  <SelectItem value="ENTERTAINMENT">Entertainment</SelectItem>
                  <SelectItem value="ENVIRONMENT">Environment</SelectItem>
                  <SelectItem value="SOCIAL_IMPACT">Social Impact</SelectItem>
                  <SelectItem value="FINANCE">Finance</SelectItem>
                  <SelectItem value="LIFESTYLE">Lifestyle</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visibility</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PUBLIC">Public - Visible to everyone</SelectItem>
                  <SelectItem value="PRIVATE">Private - Only visible to you</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="media"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Media</FormLabel>
              <FormControl>
                <MediaUpload
                  value={field.value || []}
                  onChange={(media) => field.onChange(media)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              "Submitting..."
            ) : isEditing ? (
              "Update Idea"
            ) : (
              "Create Idea"
            )}
          </Button>
          <Button type="button" variant="outline" onClick={handleDraftSave} disabled={isSubmitting}>
            Save as Draft
          </Button>
        </div>
      </form>
    </Form>
  )
}
