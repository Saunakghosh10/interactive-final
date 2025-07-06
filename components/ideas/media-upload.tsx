"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
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
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(
    async (selectedFiles: FileList | null) => {
      if (!selectedFiles) return

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

          // Validate file size (10MB limit)
          if (file.size > 10 * 1024 * 1024) {
            toast({
              title: "File too large",
              description: `${file.name} is larger than 10MB`,
              variant: "destructive",
            })
            continue
          }

          // Upload file (mock implementation)
          const formData = new FormData()
          formData.append("file", file)

          const response = await fetch("/api/upload/media", {
            method: "POST",
            body: formData,
          })

          if (response.ok) {
            const { url } = await response.json()
            newFiles.push({
              id: `file-${Date.now()}-${i}`,
              name: file.name,
              url,
              type: file.type.startsWith("image/") ? "image" : file.type === "application/pdf" ? "pdf" : "document",
              size: file.size,
            })
          }
        }

        onChange([...value, ...newFiles])

        if (newFiles.length > 0) {
          toast({
            title: "Files uploaded! 📎",
            description: `${newFiles.length} file(s) uploaded successfully`,
          })
        }
      } catch (error) {
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
    [value, maxFiles, onChange, toast],
  )

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (value.length + acceptedFiles.length > maxFiles) {
        toast({
          title: "Maximum files exceeded",
          description: `You can only upload up to ${maxFiles} files`,
          variant: "destructive",
        })
        return
      }

      try {
        const uploadPromises = acceptedFiles.map(async (file) => {
          const formData = new FormData()
          formData.append("file", file)

          const response = await fetch("/api/upload/media", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error("Upload failed")
          }

          const data = await response.json()
          return {
            url: data.url,
            type: file.type.startsWith("image/") ? "image" : "document",
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
      }
    },
    [value, maxFiles, onChange]
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

  const removeFile = (fileId: string) => {
    onChange(value.filter((file) => file.id !== fileId))
  }

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
    disabled: value.length >= maxFiles,
  })

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Zone */}
      <Card
        className={cn(
          "border-2 border-dashed transition-all duration-200 cursor-pointer",
          isDragging
            ? "border-violet-500 bg-violet-50 dark:bg-violet-950"
            : "border-violet-300 dark:border-violet-700 hover:border-violet-400 dark:hover:border-violet-600",
          isUploading && "opacity-50 cursor-not-allowed",
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-white" />
          </div>

          <h3 className="text-lg font-semibold text-violet-900 dark:text-violet-100 mb-2">
            {isUploading ? "Uploading..." : "Upload Media Files"}
          </h3>

          <p className="text-gray-600 dark:text-gray-400 mb-4">Drag and drop files here, or click to browse</p>

          <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Badge
              variant="secondary"
              className="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300"
            >
              Images
            </Badge>
            <Badge
              variant="secondary"
              className="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300"
            >
              PDFs
            </Badge>
            <Badge
              variant="secondary"
              className="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300"
            >
              Documents
            </Badge>
          </div>

          <p className="text-xs text-gray-400 mt-2">Max {maxFiles} files, {maxSize / (1024 * 1024)}MB each</p>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFileTypes.join(",")}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Uploaded Files */}
      {value.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploaded Files</h4>
          <div className="space-y-2">
            {value.map((file) => {
              const FileIcon = getFileIcon(file.type)
              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-violet-50 dark:bg-violet-950 rounded-lg border border-violet-200 dark:border-violet-800"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <FileIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {file.type === "image" && (
                      <img
                        src={file.url || "/placeholder.svg"}
                        alt={file.name}
                        className="w-10 h-10 object-cover rounded border border-violet-200 dark:border-violet-800"
                      />
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-violet-600 hover:text-violet-700 hover:bg-violet-100 dark:hover:bg-violet-900"
                      onClick={() => window.open(file.url, "_blank")}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900"
                      onClick={() => removeFile(file.id || "")}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} />
          <p className="text-sm text-center text-gray-500">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}
    </div>
  )
}
