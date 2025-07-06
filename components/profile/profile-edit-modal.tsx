"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ImageUpload } from "./image-upload"
import { SkillTagInput } from "./skill-tag-input"
import { IndustryTagInput } from "./industry-tag-input"
import { AuthLoading } from "@/components/ui/auth-loading"
import { User, MapPin, Globe, Linkedin, Github, Twitter, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  location: z.string().max(100, "Location must be less than 100 characters").optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Please enter a valid LinkedIn URL").optional().or(z.literal("")),
  githubUrl: z.string().url("Please enter a valid GitHub URL").optional().or(z.literal("")),
  twitterUrl: z.string().url("Please enter a valid Twitter URL").optional().or(z.literal("")),
  profileVisibility: z.enum(["PUBLIC", "PRIVATE"]),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface Skill {
  id: string
  name: string
  category: string
}

interface Industry {
  id: string
  name: string
}

interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    id: string
    name?: string | null
    username?: string | null
    email: string
    image?: string | null
    bio?: string | null
    location?: string | null
    website?: string | null
    linkedinUrl?: string | null
    githubUrl?: string | null
    twitterUrl?: string | null
    profileVisibility: "PUBLIC" | "PRIVATE"
    skills?: { skill: { id: string; name: string; category: string } }[]
    industries?: { industry: { id: string; name: string } }[]
  }
  onSave: (data: any) => Promise<void>
}

export function ProfileEditModal({ isOpen, onClose, user, onSave }: ProfileEditModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [profileImage, setProfileImage] = useState(user.image)
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>(user.skills?.map((s) => s.skill) || [])
  const [selectedIndustries, setSelectedIndustries] = useState<Industry[]>(
    user.industries?.map((i) => i.industry) || [],
  )
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      username: user.username || "",
      bio: user.bio || "",
      location: user.location || "",
      website: user.website || "",
      linkedinUrl: user.linkedinUrl || "",
      githubUrl: user.githubUrl || "",
      twitterUrl: user.twitterUrl || "",
      profileVisibility: user.profileVisibility,
    },
    mode: "onChange",
  })

  const profileVisibility = watch("profileVisibility")
  const bio = watch("bio")

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    try {
      await onSave({
        ...data,
        image: profileImage,
        skills: selectedSkills,
        industries: selectedIndustries,
      })
      onClose()
      toast({
        title: "Profile Updated! ✨",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-violet-200 dark:border-violet-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-violet-900 dark:text-violet-100">Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Image */}
          <div className="flex justify-center">
            <ImageUpload currentImage={profileImage} onImageChange={setProfileImage} />
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-violet-900 dark:text-violet-100">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                  Full Name *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    className={cn(
                      "pl-10",
                      errors.name ? "border-red-500" : "border-violet-200 focus:border-violet-500",
                    )}
                    {...register("name")}
                  />
                </div>
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">
                  Username *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">@</span>
                  <Input
                    id="username"
                    placeholder="your_username"
                    className={cn(
                      "pl-8",
                      errors.username ? "border-red-500" : "border-violet-200 focus:border-violet-500",
                    )}
                    {...register("username")}
                  />
                </div>
                {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-gray-700 dark:text-gray-300">
                Bio
              </Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                rows={4}
                className={cn(
                  "resize-none",
                  errors.bio ? "border-red-500" : "border-violet-200 focus:border-violet-500",
                )}
                {...register("bio")}
              />
              <div className="flex justify-between text-sm">
                {errors.bio && <p className="text-red-600">{errors.bio.message}</p>}
                <p className="text-gray-500 ml-auto">{bio?.length || 0}/500 characters</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-gray-700 dark:text-gray-300">
                Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="location"
                  placeholder="City, Country"
                  className="pl-10 border-violet-200 focus:border-violet-500"
                  {...register("location")}
                />
              </div>
            </div>
          </div>

          <Separator className="bg-violet-200 dark:bg-violet-800" />

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-violet-900 dark:text-violet-100">Social Links</h3>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="website" className="text-gray-700 dark:text-gray-300">
                  Website
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="website"
                    placeholder="https://yourwebsite.com"
                    className={cn(
                      "pl-10",
                      errors.website ? "border-red-500" : "border-violet-200 focus:border-violet-500",
                    )}
                    {...register("website")}
                  />
                </div>
                {errors.website && <p className="text-sm text-red-600">{errors.website.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl" className="text-gray-700 dark:text-gray-300">
                    LinkedIn
                  </Label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="linkedinUrl"
                      placeholder="LinkedIn URL"
                      className="pl-10 border-violet-200 focus:border-violet-500"
                      {...register("linkedinUrl")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="githubUrl" className="text-gray-700 dark:text-gray-300">
                    GitHub
                  </Label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="githubUrl"
                      placeholder="GitHub URL"
                      className="pl-10 border-violet-200 focus:border-violet-500"
                      {...register("githubUrl")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitterUrl" className="text-gray-700 dark:text-gray-300">
                    Twitter
                  </Label>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="twitterUrl"
                      placeholder="Twitter URL"
                      className="pl-10 border-violet-200 focus:border-violet-500"
                      {...register("twitterUrl")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-violet-200 dark:bg-violet-800" />

          {/* Skills */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-violet-900 dark:text-violet-100">Skills</h3>
            <SkillTagInput
              selectedSkills={selectedSkills}
              onSkillsChange={setSelectedSkills}
              placeholder="Add your skills..."
            />
          </div>

          {/* Industries */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-violet-900 dark:text-violet-100">Industries</h3>
            <IndustryTagInput
              selectedIndustries={selectedIndustries}
              onIndustriesChange={setSelectedIndustries}
              placeholder="Add your industries..."
            />
          </div>

          <Separator className="bg-violet-200 dark:bg-violet-800" />

          {/* Privacy Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-violet-900 dark:text-violet-100">Privacy Settings</h3>

            <div className="flex items-center justify-between p-4 bg-violet-50 dark:bg-violet-950 rounded-lg border border-violet-200 dark:border-violet-800">
              <div className="flex items-center space-x-3">
                {profileVisibility === "PUBLIC" ? (
                  <Eye className="w-5 h-5 text-violet-600" />
                ) : (
                  <EyeOff className="w-5 h-5 text-violet-600" />
                )}
                <div>
                  <p className="font-medium text-violet-900 dark:text-violet-100">Profile Visibility</p>
                  <p className="text-sm text-violet-600 dark:text-violet-400">
                    {profileVisibility === "PUBLIC"
                      ? "Your profile is visible to everyone"
                      : "Your profile is only visible to you"}
                  </p>
                </div>
              </div>
              <Switch
                checked={profileVisibility === "PUBLIC"}
                onCheckedChange={(checked) => setValue("profileVisibility", checked ? "PUBLIC" : "PRIVATE")}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-violet-500 data-[state=checked]:to-amber-500"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="bg-transparent border-violet-200 hover:bg-violet-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !isValid}
              className="bg-gradient-to-r from-violet-500 to-amber-500 hover:from-violet-600 hover:to-amber-600 text-white min-w-[120px]"
            >
              {isLoading ? <AuthLoading size="sm" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
