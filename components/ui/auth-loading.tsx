"use client"

import { cn } from "@/lib/utils"

interface AuthLoadingProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function AuthLoading({ size = "md", className }: AuthLoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-transparent bg-gradient-to-r from-violet-500 to-amber-500 bg-clip-border",
          sizeClasses[size],
        )}
        style={{
          background: "conic-gradient(from 0deg, #8B5CF6, #F59E0B, #8B5CF6)",
          WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 2px))",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 2px))",
        }}
      />
    </div>
  )
}

export function PulseLoading({ size = "md", className }: AuthLoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }

  return (
    <div className={cn("flex items-center justify-center space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-full bg-gradient-to-r from-violet-500 to-amber-500 animate-pulse",
            size === "sm" ? "w-1 h-1" : size === "md" ? "w-2 h-2" : "w-3 h-3",
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: "1s",
          }}
        />
      ))}
    </div>
  )
}
