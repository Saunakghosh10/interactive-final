"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthLoading } from "@/components/ui/auth-loading"
import { Mail, CheckCircle, XCircle, RefreshCw, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "success" | "error">("pending")
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const email = searchParams.get("email")
  const token = searchParams.get("token")

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    }
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: verificationToken }),
      })

      const result = await response.json()

      if (response.ok) {
        setVerificationStatus("success")
        toast({
          title: "Email Verified! ✅",
          description: "Your account has been successfully verified.",
        })
        setTimeout(() => {
          router.push("/auth/signin")
        }, 3000)
      } else {
        setVerificationStatus("error")
        toast({
          title: "Verification Failed",
          description: result.message || "Invalid or expired verification link.",
          variant: "destructive",
        })
      }
    } catch (error) {
      setVerificationStatus("error")
      toast({
        title: "Network Error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resendVerification = async () => {
    if (!email) return

    setIsResending(true)
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Verification Email Sent! 📧",
          description: "Please check your email for the new verification link.",
        })
      } else {
        toast({
          title: "Failed to Resend",
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
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-amber-50 dark:from-violet-950 dark:via-gray-900 dark:to-amber-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/auth/signin"
            className="inline-flex items-center space-x-2 mb-6 text-violet-600 hover:text-violet-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to sign in</span>
          </Link>
        </div>

        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-amber-500">
              {isLoading ? (
                <AuthLoading size="md" />
              ) : verificationStatus === "success" ? (
                <CheckCircle className="w-8 h-8 text-white" />
              ) : verificationStatus === "error" ? (
                <XCircle className="w-8 h-8 text-white" />
              ) : (
                <Mail className="w-8 h-8 text-white" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {isLoading
                ? "Verifying Email..."
                : verificationStatus === "success"
                  ? "Email Verified!"
                  : verificationStatus === "error"
                    ? "Verification Failed"
                    : "Check Your Email"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {isLoading ? (
              <p className="text-gray-600 dark:text-gray-400">Please wait while we verify your email address...</p>
            ) : verificationStatus === "success" ? (
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Your email has been successfully verified! You can now sign in to your account.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Redirecting to sign in page in a few seconds...
                </p>
                <Button
                  asChild
                  className="bg-gradient-to-r from-violet-500 to-amber-500 hover:from-violet-600 hover:to-amber-600"
                >
                  <Link href="/auth/signin">Sign In Now</Link>
                </Button>
              </div>
            ) : verificationStatus === "error" ? (
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  The verification link is invalid or has expired. Please request a new verification email.
                </p>
                {email && (
                  <Button
                    onClick={resendVerification}
                    disabled={isResending}
                    variant="outline"
                    className="w-full bg-transparent"
                  >
                    {isResending ? (
                      <AuthLoading size="sm" />
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  We've sent a verification link to <span className="font-medium text-violet-600">{email}</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Click the link in the email to verify your account. The link will expire in 24 hours.
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Didn't receive the email?</p>
                  <Button
                    onClick={resendVerification}
                    disabled={isResending}
                    variant="outline"
                    className="w-full bg-transparent"
                  >
                    {isResending ? (
                      <AuthLoading size="sm" />
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
