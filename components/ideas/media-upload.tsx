"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, ImageIcon, FileText, X, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useDropzone } from "react-dropzone"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { FileIcon, XIcon } from "lucide-react"

export interface MediaFile {
  id?: string
  name: string
  url: string
  type: "image" | "pdf" | "document"
  size: number
}

interface MediaUploadProps {
  value?: MediaFile[]
  onChange: (files: MediaFile[]) => void
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedFileTypes?: string[]
  className?: string
}

export function MediaUpload({
  value = [],
  onChange,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedFileTypes = ["image/*", "application/pdf"],
  className,
}: MediaUploadProps) {
  const { data: session, status } = useSession()
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(
    async (selectedFiles: FileList | null) => {
      if (!selectedFiles || !session?.user?.id) return

      if (value.length + selectedFiles.length > maxFiles) {
        toast({
          title: "Too many files",
          description: `You can only upload up to ${maxFiles} files`,
          variant: "destructive",
        })
        return
      }

      setIsUploading(true)
      setUploadProgress(0)

      try {
        const newFiles: MediaFile[] = []

        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i]
          setUploadProgress(((i + 1) / selectedFiles.length) * 100)

          // Validate file size
          if (file.size > maxSize) {
            toast({
              title: "File too large",
              description: `${file.name} is larger than ${formatFileSize(maxSize)}`,
              variant: "destructive",
            })
            continue
          }

          // Upload file
          const formData = new FormData()
          formData.append("file", file)
          formData.append("userId", session.user.id)

          try {
            const response = await fetch("/api/upload/media", {
              method: "POST",
              body: formData,
            })

            if (!response.ok) {
              throw new Error(`Failed to upload ${file.name}`)
            }

            const { url } = await response.json()
            newFiles.push({
              id: `file-${Date.now()}-${i}`,
              name: file.name,
              url,
              type: file.type.startsWith("image/") ? "image" : file.type === "application/pdf" ? "pdf" : "document",
              size: file.size,
            })
          } catch (error) {
            console.error(`Error uploading ${file.name}:`, error)
            toast({
              title: `Failed to upload ${file.name}`,
              description: "Please try again",
              variant: "destructive",
            })
          }
        }

        if (newFiles.length > 0) {
          onChange([...value, ...newFiles])
          toast({
            title: "Files uploaded! 📎",
            description: `${newFiles.length} file(s) uploaded successfully`,
          })
        }
      } catch (error) {
        console.error("Upload error:", error)
        toast({
          title: "Upload failed",
          description: "Failed to upload files. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    },
    [value, maxFiles, maxSize, onChange, session?.user?.id],
  )

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!session?.user?.id) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload files",
          variant: "destructive",
        })
        return
      }

      if (value.length + acceptedFiles.length > maxFiles) {
        toast({
          title: "Maximum files exceeded",
          description: `You can only upload up to ${maxFiles} files`,
          variant: "destructive",
        })
        return
      }

      setIsUploading(true)
      try {
        const uploadPromises = acceptedFiles.map(async (file, index) => {
          setUploadProgress(((index + 1) / acceptedFiles.length) * 100)

          const formData = new FormData()
          formData.append("file", file)
          formData.append("userId", session.user.id)

          const response = await fetch("/api/upload/media", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error(`Failed to upload ${file.name}`)
          }

          const data = await response.json()
          return {
            id: `file-${Date.now()}-${index}`,
            name: file.name,
            url: data.url,
            type: file.type.startsWith("image/") ? "image" : file.type === "application/pdf" ? "pdf" : "document",
            size: file.size,
          } as MediaFile
        })

        const uploadedFiles = await Promise.all(uploadPromises)
        onChange([...value, ...uploadedFiles])
        toast({
          title: "Success",
          description: "Files uploaded successfully!",
        })
      } catch (error) {
        console.error("Upload error:", error)
        toast({
          title: "Error",
          description: "Failed to upload files. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    },
    [value, maxFiles, onChange, session?.user?.id],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const removeFile = useCallback((fileId: string) => {
    onChange(value.filter((file) => file.id !== fileId))
  }, [value, onChange])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return ImageIcon
      case "pdf":
        return FileText
      default:
        return FileText
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'application/pdf': []
    },
    maxSize,
    disabled: value.length >= maxFiles || isUploading || status !== "authenticated",
  })

  // Show loading state while session is loading
  if (status === "loading") {
    return <div>Loading...</div>
  }

  // Don't allow uploads without authentication
  if (!session?.user) {
    return (
      <Card className="p-4 text-center">
        <p>Please sign in to upload files</p>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Zone */}
      <Card
        className={cn(
          "border-2 border-dashed transition-all duration-200",
          isDragging
            ? "border-violet-500 bg-violet-50 dark:bg-violet-950"
            : "border-violet-300 dark:border-violet-700 hover:border-violet-400 dark:hover:border-violet-600",
          (isUploading || value.length >= maxFiles) && "opacity-50 cursor-not-allowed",
          !isUploading && value.length < maxFiles && "cursor-pointer"
        )}
        {...getRootProps()}
      >
        <CardContent className="p-8 text-center">
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-white" />
          </div>

          <h3 className="text-lg font-semibold text-violet-900 dark:text-violet-100 mb-2">
            {isUploading ? "Uploading..." : "Upload Media Files"}
          </h3>

          {isUploading ? (
            <Progress value={uploadProgress} className="w-full mt-2" />
          ) : (
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {value.length >= maxFiles
                ? "Maximum files reached"
                : "Drag and drop files here, or click to browse"}
            </p>
          )}

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Maximum file size: {formatFileSize(maxSize)}</p>
            <p>Accepted files: Images, PDFs</p>
            <p>
              {value.length} of {maxFiles} files uploaded
            </p>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {value.length > 0 && (
        <div className="grid gap-2">
          {value.map((file) => {
            const FileIcon = getFileIcon(file.type)
            return (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <FileIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(file.url, "_blank")}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => file.id && removeFile(file.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
