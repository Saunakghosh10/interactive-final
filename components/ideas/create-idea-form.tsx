"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

export function CreateIdeaForm({ isEditing = false, initialData }: CreateIdeaFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      category: "OTHER",
      tags: [],
      media: [],
    },
  })

  async function onSubmit(values: FormData) {
    try {
      setIsSubmitting(true)
      const endpoint = isEditing ? `/api/ideas/${initialData?.id}` : "/api/ideas"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Failed to submit idea")
      }

      const data = await response.json()
      toast({
        title: isEditing ? "Idea Updated" : "Idea Created",
        description: isEditing ? "Your idea has been updated successfully." : "Your idea has been created successfully.",
      })
      router.push(`/ideas/${data.id}`)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

        <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
            "Submitting..."
          ) : isEditing ? (
            "Update Idea"
                  ) : (
            "Create Idea"
                  )}
                </Button>
      </form>
    </Form>
  )
}
