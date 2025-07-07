"use client"

import type React from "react"
import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Lightbulb, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SignUpForm } from "@/components/auth/signup-form"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import { AuthLoading } from "@/components/ui/auth-loading"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-amber-50 dark:from-violet-950 dark:via-gray-900 dark:to-amber-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 mb-6 text-violet-600 hover:text-violet-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>

          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Interactive Ideas</span>
          </div>
        </div>

        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Join thousands of innovators and start your journey today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* OAuth Buttons */}
            <Suspense fallback={<AuthLoading />}>
              <OAuthButtons />
            </Suspense>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">Or create account manually</span>
              </div>
            </div>

            {/* Sign Up Form */}
            <SignUpForm />

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-violet-600 hover:text-violet-700 font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
