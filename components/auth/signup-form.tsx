"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AuthLoading } from "@/components/ui/auth-loading"
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"
import { signUpSchema, type SignUpInput } from "@/lib/validation"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
  })

  const password = watch("password")
  const confirmPassword = watch("confirmPassword")

  const passwordRequirements = [
    { label: "At least 8 characters", met: password?.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password || "") },
    { label: "One lowercase letter", met: /[a-z]/.test(password || "") },
    { label: "One number", met: /\d/.test(password || "") },
  ]

  const onSubmit = async (data: SignUpInput) => {
    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the Terms of Service and Privacy Policy",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Account Created! 🎉",
          description: "Please check your email to verify your account before signing in.",
        })
        router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`)
      } else {
        toast({
          title: "Registration Failed",
          description: result.message || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
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
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
          Full Name
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            className={cn(
              "h-12 pl-10 transition-all duration-200",
              errors.name
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-violet-500 focus:ring-violet-500",
            )}
            {...register("name")}
          />
        </div>
        {errors.name && (
          <p className="text-sm text-red-600 flex items-center mt-1">
            <XCircle className="w-4 h-4 mr-1" />
            {errors.name.message}
          </p>
        )}
      </div>

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
        <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
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
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Password Requirements */}
        {password && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password Requirements:</p>
            <div className="space-y-1">
              {passwordRequirements.map((req, index) => (
                <div key={index} className="flex items-center text-sm">
                  {req.met ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400 mr-2" />
                  )}
                  <span className={req.met ? "text-green-600" : "text-gray-500"}>{req.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {errors.password && (
          <p className="text-sm text-red-600 flex items-center mt-1">
            <XCircle className="w-4 h-4 mr-1" />
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">
          Confirm Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            className={cn(
              "h-12 pl-10 pr-10 transition-all duration-200",
              errors.confirmPassword
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : confirmPassword && password === confirmPassword
                  ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                  : "border-gray-300 focus:border-violet-500 focus:ring-violet-500",
            )}
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {confirmPassword && password === confirmPassword && (
          <p className="text-sm text-green-600 flex items-center mt-1">
            <CheckCircle className="w-4 h-4 mr-1" />
            Passwords match
          </p>
        )}
        {errors.confirmPassword && (
          <p className="text-sm text-red-600 flex items-center mt-1">
            <XCircle className="w-4 h-4 mr-1" />
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Terms Agreement */}
      <div className="flex items-start space-x-3">
        <Checkbox
          id="terms"
          checked={agreedToTerms}
          onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
          className="mt-1"
        />
        <Label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          I agree to the{" "}
          <a href="/terms" className="text-violet-600 hover:text-violet-700 underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-violet-600 hover:text-violet-700 underline">
            Privacy Policy
          </a>
        </Label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-12 bg-gradient-to-r from-violet-500 to-amber-500 hover:from-violet-600 hover:to-amber-600 text-white font-semibold transition-all duration-200 transform hover:scale-[1.02]"
        disabled={isLoading || !isValid || !agreedToTerms}
      >
        {isLoading ? <AuthLoading size="sm" /> : "Create Account"}
      </Button>
    </form>
  )
}
