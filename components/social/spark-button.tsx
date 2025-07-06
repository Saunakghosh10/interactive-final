"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Zap } from "lucide-react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface SparkButtonProps {
  targetId: string
  targetType: "idea" | "project" | "comment"
  initialSparked?: boolean
  initialCount?: number
  size?: "sm" | "md" | "lg"
  showCount?: boolean
  className?: string
}

export function SparkButton({
  targetId,
  targetType,
  initialSparked = false,
  initialCount = 0,
  size = "md",
  showCount = true,
  className,
}: SparkButtonProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isSparked, setIsSparked] = useState(initialSparked)
  const [sparkCount, setSparkCount] = useState(initialCount)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSpark = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to spark ideas",
        variant: "destructive",
      })
      return
    }

    if (isLoading) return

    setIsLoading(true)
    setIsAnimating(true)

    try {
      const response = await fetch(`/api/${targetType}s/${targetId}/spark`, {
        method: isSparked ? "DELETE" : "POST",
      })

      if (response.ok) {
        const newSparked = !isSparked
        setIsSparked(newSparked)
        setSparkCount(newSparked ? sparkCount + 1 : sparkCount - 1)

        // Create spark animation effect
        if (newSparked) {
          createSparkEffect(e.currentTarget as HTMLElement)
        }
      } else {
        throw new Error("Failed to update spark")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update spark status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  const createSparkEffect = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    const sparkles = 6

    for (let i = 0; i < sparkles; i++) {
      const sparkle = document.createElement("div")
      sparkle.className = "fixed pointer-events-none z-50"
      sparkle.innerHTML = "✨"
      sparkle.style.left = `${rect.left + rect.width / 2}px`
      sparkle.style.top = `${rect.top + rect.height / 2}px`
      sparkle.style.fontSize = "12px"
      sparkle.style.color = "#F59E0B"

      document.body.appendChild(sparkle)

      const angle = (i / sparkles) * 2 * Math.PI
      const distance = 30 + Math.random() * 20
      const duration = 800 + Math.random() * 400

      sparkle.animate(
        [
          {
            transform: "translate(-50%, -50%) scale(0)",
            opacity: 1,
          },
          {
            transform: `translate(${Math.cos(angle) * distance - 50}%, ${Math.sin(angle) * distance - 50}%) scale(1)`,
            opacity: 0.8,
          },
          {
            transform: `translate(${Math.cos(angle) * distance * 1.5 - 50}%, ${Math.sin(angle) * distance * 1.5 - 50}%) scale(0)`,
            opacity: 0,
          },
        ],
        {
          duration,
          easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        },
      ).onfinish = () => {
        document.body.removeChild(sparkle)
      }
    }
  }

  const sizeClasses = {
    sm: "h-7 px-2 text-xs",
    md: "h-8 px-3 text-sm",
    lg: "h-10 px-4 text-base",
  }

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      className={cn(
        sizeClasses[size],
        "transition-all duration-200 hover:scale-105",
        isSparked
          ? "text-amber-500 hover:text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 dark:hover:bg-amber-900"
          : "text-gray-500 hover:text-amber-500 hover:bg-amber-50 dark:text-gray-400 dark:hover:text-amber-400 dark:hover:bg-amber-950",
        isAnimating && "animate-pulse",
        className,
      )}
      onClick={handleSpark}
      disabled={isLoading}
    >
      <div className="relative">
        <Heart
          className={cn(
            iconSizes[size],
            "transition-all duration-200",
            isSparked && "fill-current scale-110",
            isAnimating && "animate-bounce",
          )}
        />
        {isAnimating && isSparked && (
          <Zap className={cn(iconSizes[size], "absolute inset-0 text-yellow-400 animate-ping")} />
        )}
      </div>
      {showCount && (
        <span className={cn("ml-1 font-medium", sparkCount > 0 && isSparked && "text-violet-600 dark:text-violet-400")}>
          {sparkCount}
        </span>
      )}
    </Button>
  )
}
