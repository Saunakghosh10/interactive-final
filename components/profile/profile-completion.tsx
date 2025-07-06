"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, ChevronDown, ChevronUp, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfileCompletionProps {
  completeness: number
  tips: string[]
  onEditProfile: () => void
}

export function ProfileCompletion({ completeness, tips, onEditProfile }: ProfileCompletionProps) {
  const [isExpanded, setIsExpanded] = useState(completeness < 100)

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return "from-green-500 to-emerald-500"
    if (percentage >= 60) return "from-amber-500 to-yellow-500"
    return "from-violet-500 to-purple-500"
  }

  const getCompletionMessage = (percentage: number) => {
    if (percentage >= 100) return "Your profile is complete! 🎉"
    if (percentage >= 80) return "Almost there! Just a few more details."
    if (percentage >= 60) return "Good progress! Keep building your profile."
    return "Let's build an amazing profile together!"
  }

  return (
    <Card className="border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-violet-900 dark:text-violet-100 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-amber-500" />
            Profile Completion
          </CardTitle>
          <Badge
            variant="secondary"
            className={cn("bg-gradient-to-r text-white font-semibold", getCompletionColor(completeness))}
          >
            {completeness}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-violet-700 dark:text-violet-300">{getCompletionMessage(completeness)}</span>
          </div>
          <Progress
            value={completeness}
            className="h-3 bg-violet-200 dark:bg-violet-800"
            style={{
              background: `linear-gradient(to right, rgb(139, 92, 246) 0%, rgb(245, 158, 11) ${completeness}%, rgb(226, 232, 240) ${completeness}%)`,
            }}
          />
        </div>

        {completeness < 100 && (
          <div className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full justify-between text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900"
            >
              <span>
                {tips.length} improvement{tips.length !== 1 ? "s" : ""} available
              </span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            {isExpanded && (
              <div className="space-y-2">
                {tips.slice(0, 5).map((tip, index) => (
                  <div key={index} className="flex items-center text-sm text-violet-600 dark:text-violet-400">
                    <Circle className="w-3 h-3 mr-2 flex-shrink-0" />
                    <span>{tip}</span>
                  </div>
                ))}
                <Button
                  onClick={onEditProfile}
                  size="sm"
                  className="w-full mt-3 bg-gradient-to-r from-violet-500 to-amber-500 hover:from-violet-600 hover:to-amber-600 text-white"
                >
                  Complete Profile
                </Button>
              </div>
            )}
          </div>
        )}

        {completeness >= 100 && (
          <div className="flex items-center justify-center text-green-600 dark:text-green-400">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Profile Complete!</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
