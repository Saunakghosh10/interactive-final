"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { AuthLoading } from "@/components/ui/auth-loading"
import { Github } from "lucide-react"
import { useSearchParams } from "next/navigation"

function OAuthButtonsContent({ callbackUrl, disabled = false }: OAuthButtonsProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGitHubLoading, setIsGitHubLoading] = useState(false)
  const searchParams = useSearchParams()
  
  // Get the callback URL from the URL params or use the provided one
  const finalCallbackUrl = searchParams?.get("callbackUrl") || callbackUrl || "/dashboard"

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      await signIn("google", { 
        callbackUrl: finalCallbackUrl,
        redirect: true,
      })
    } catch (error) {
      console.error("Google sign in error:", error)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleGitHubSignIn = async () => {
    setIsGitHubLoading(true)
    try {
      await signIn("github", { 
        callbackUrl: finalCallbackUrl,
        redirect: true,
      })
    } catch (error) {
      console.error("GitHub sign in error:", error)
    } finally {
      setIsGitHubLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className="w-full h-12 border-2 hover:bg-violet-50 dark:hover:bg-violet-950 hover:border-violet-300 dark:hover:border-violet-700 bg-transparent transition-all duration-200"
        onClick={handleGoogleSignIn}
        disabled={disabled || isGoogleLoading || isGitHubLoading}
      >
        {isGoogleLoading ? (
          <AuthLoading size="sm" />
        ) : (
          <>
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </>
        )}
      </Button>

      <Button
        variant="outline"
        className="w-full h-12 border-2 hover:bg-violet-50 dark:hover:bg-violet-950 hover:border-violet-300 dark:hover:border-violet-700 bg-transparent transition-all duration-200"
        onClick={handleGitHubSignIn}
        disabled={disabled || isGoogleLoading || isGitHubLoading}
      >
        {isGitHubLoading ? (
          <AuthLoading size="sm" />
        ) : (
          <>
            <Github className="w-5 h-5 mr-3" />
            Continue with GitHub
          </>
        )}
      </Button>
    </div>
  )
}

interface OAuthButtonsProps {
  callbackUrl?: string
  disabled?: boolean
}

export function OAuthButtons(props: OAuthButtonsProps) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <OAuthButtonsContent {...props} />
    </Suspense>
  )
}
