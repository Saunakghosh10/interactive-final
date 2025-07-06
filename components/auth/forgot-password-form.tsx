"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLoading } from "@/components/ui/auth-loading"
import { Mail, XCircle, CheckCircle } from "lucide-react"
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validation"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  })

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      })

      const result = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        toast({
          title: "Reset Link Sent! 📧",
          description: "Check your email for password reset instructions.",
        })
      } else {
        toast({
          title: "Request Failed",
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

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Check Your Email</h3>
        <p className="text-gray-600 dark:text-gray-400">
          We've sent password reset instructions to{" "}
          <span className="font-medium text-violet-600">{getValues("email")}</span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Didn't receive the email? Check your spam folder or try again.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Reset Your Password</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Enter your email address and we'll send you a link to reset your password.
        </p>
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

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-12 bg-gradient-to-r from-violet-500 to-amber-500 hover:from-violet-600 hover:to-amber-600 text-white font-semibold transition-all duration-200 transform hover:scale-[1.02]"
        disabled={isLoading || !isValid}
      >
        {isLoading ? <AuthLoading size="sm" /> : "Send Reset Link"}
      </Button>
    </form>
  )
}
