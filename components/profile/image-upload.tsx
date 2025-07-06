"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Upload, RotateCcw, ZoomIn, ZoomOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  currentImage?: string | null
  onImageChange: (imageUrl: string) => void
  className?: string
}

export function ImageUpload({ currentImage, onImageChange, className }: ImageUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setIsOpen(true)
      }
      reader.readAsDataURL(file)
    },
    [toast],
  )

  const handleUpload = async () => {
    if (!selectedImage) return

    setIsUploading(true)
    try {
      // Convert base64 to blob
      const response = await fetch(selectedImage)
      const blob = await response.blob()

      // Create form data
      const formData = new FormData()
      formData.append("file", blob, "profile-image.jpg")

      // Upload to your image service (implement based on your needs)
      const uploadResponse = await fetch("/api/upload/profile-image", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Upload failed")
      }

      const { url } = await uploadResponse.json()
      onImageChange(url)
      setIsOpen(false)
      setSelectedImage(null)

      toast({
        title: "Profile photo updated! 📸",
        description: "Your new profile photo has been saved.",
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <div className={cn("relative group", className)}>
        <Avatar className="w-32 h-32 border-4 border-violet-200 dark:border-violet-800 shadow-lg">
          <AvatarImage src={currentImage || ""} alt="Profile" className="object-cover" />
          <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-2xl font-bold">
            <Camera className="w-8 h-8" />
          </AvatarFallback>
        </Avatar>

        <div className="absolute inset-0 bg-violet-600/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>

        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-violet-500 to-amber-500 rounded-full p-2 shadow-lg">
          <Camera className="w-4 h-4 text-white" />
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-violet-900 dark:text-violet-100">Crop Profile Photo</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedImage && (
              <div className="relative">
                <div className="aspect-square bg-violet-50 dark:bg-violet-950 rounded-lg overflow-hidden border-2 border-violet-200 dark:border-violet-800">
                  <img src={selectedImage || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-violet-600/20 border-2 border-dashed border-violet-400 rounded-lg" />
                </div>
              </div>
            )}

            <div className="flex justify-center space-x-2">
              <Button size="sm" variant="outline" className="bg-transparent">
                <RotateCcw className="w-4 h-4 mr-2" />
                Rotate
              </Button>
              <Button size="sm" variant="outline" className="bg-transparent">
                <ZoomIn className="w-4 h-4 mr-2" />
                Zoom In
              </Button>
              <Button size="sm" variant="outline" className="bg-transparent">
                <ZoomOut className="w-4 h-4 mr-2" />
                Zoom Out
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false)
                setSelectedImage(null)
              }}
              className="bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="bg-gradient-to-r from-violet-500 to-amber-500 hover:from-violet-600 hover:to-amber-600"
            >
              {isUploading ? "Uploading..." : "Save Photo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
