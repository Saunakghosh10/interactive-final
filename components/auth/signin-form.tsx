"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AuthLoading } from "@/components/ui/auth-loading"
import { Mail, Lock, Eye, EyeOff, XCircle } from "lucide-react"
import { signInSchema, type SignInInput } from "@/lib/validation"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function SignInForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: searchParams.get("email") || "",
      password: "",
      rememberMe: false,
    },
  })

  const onSubmit = async (data: SignInInput) => {
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          toast({
            title: "Invalid Credentials",
            description: "Please check your email and password and try again.",
            variant: "destructive",
          })
        } else if (result.error.includes("verify your email")) {
          toast({
            title: "Email Not Verified",
            description: "Please check your email and verify your account before signing in.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Sign In Failed",
            description: result.error || "Something went wrong. Please try again.",
            variant: "destructive",
          })
        }
      } else if (result?.ok) {
        toast({
          title: "Welcome back! 👋",
          description: "You have been successfully signed in.",
        })

        // Handle remember me functionality
        if (data.rememberMe) {
          localStorage.setItem("rememberMe", "true")
        }

        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      console.error("Sign in error:", error)
      toast({
        title: "Network Error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            className={cn(
              "h-12 pl-10 transition-all duration-200",
              errors.email
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-violet-500 focus:ring-violet-500",
            )}
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-600 flex items-center mt-1">
            <XCircle className="w-4 h-4 mr-1" />
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
            Password
          </Label>
          <Link
            href="/auth/forgot-password"
            className="text-sm text-violet-600 hover:text-violet-700 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className={cn(
              "h-12 pl-10 pr-10 transition-all duration-200",
              errors.password
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-violet-500 focus:ring-violet-500",
            )}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-600 flex items-center mt-1">
            <XCircle className="w-4 h-4 mr-1" />
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Remember Me */}
      <div className="flex items-center space-x-2">
        <Checkbox id="rememberMe" {...register("rememberMe")} />
        <Label htmlFor="rememberMe" className="text-sm text-gray-600 dark:text-gray-400">
          Remember me for 30 days
        </Label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-12 bg-gradient-to-r from-violet-500 to-amber-500 hover:from-violet-600 hover:to-amber-600 text-white font-semibold transition-all duration-200 transform hover:scale-[1.02]"
        disabled={isLoading}
      >
        {isLoading ? <AuthLoading size="sm" /> : "Sign In"}
      </Button>
    </form>
  )
}
