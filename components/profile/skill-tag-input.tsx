"use client"

import { useState, useRef, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Plus, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface Skill {
  id: string
  name: string
  category: string
}

interface SkillTagInputProps {
  selectedSkills: Skill[]
  onSkillsChange: (skills: Skill[]) => void
  placeholder?: string
  className?: string
}

export function SkillTagInput({ selectedSkills, onSkillsChange, placeholder, className }: SkillTagInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [suggestions, setSuggestions] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Mock skills data - in real app, fetch from API
  const mockSkills: Skill[] = [
    { id: "1", name: "React", category: "Frontend" },
    { id: "2", name: "Node.js", category: "Backend" },
    { id: "3", name: "TypeScript", category: "Programming" },
    { id: "4", name: "Python", category: "Programming" },
    { id: "5", name: "UI/UX Design", category: "Design" },
    { id: "6", name: "Product Management", category: "Management" },
    { id: "7", name: "Data Science", category: "Analytics" },
    { id: "8", name: "Machine Learning", category: "AI" },
    { id: "9", name: "DevOps", category: "Infrastructure" },
    { id: "10", name: "Marketing", category: "Business" },
  ]

  useEffect(() => {
    if (inputValue.length > 1) {
      setIsLoading(true)
      // Simulate API call
      setTimeout(() => {
        const filtered = mockSkills.filter(
          (skill) =>
            skill.name.toLowerCase().includes(inputValue.toLowerCase()) &&
            !selectedSkills.some((selected) => selected.id === skill.id),
        )
        setSuggestions(filtered)
        setShowSuggestions(true)
        setIsLoading(false)
      }, 300)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [inputValue, selectedSkills])

  const addSkill = (skill: Skill) => {
    if (!selectedSkills.some((s) => s.id === skill.id)) {
      onSkillsChange([...selectedSkills, skill])
    }
    setInputValue("")
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const removeSkill = (skillId: string) => {
    onSkillsChange(selectedSkills.filter((skill) => skill.id !== skillId))
  }

  const createCustomSkill = () => {
    if (inputValue.trim() && !selectedSkills.some((s) => s.name.toLowerCase() === inputValue.toLowerCase())) {
      const newSkill: Skill = {
        id: `custom-${Date.now()}`,
        name: inputValue.trim(),
        category: "Custom",
      }
      addSkill(newSkill)
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  if (suggestions.length > 0) {
                    addSkill(suggestions[0])
                  } else {
                    createCustomSkill()
                  }
                }
              }}
              placeholder={placeholder || "Search skills..."}
              className="pl-10 border-violet-200 focus:border-violet-500 focus:ring-violet-500"
            />
          </div>
          {inputValue && (
            <Button
              size="sm"
              onClick={createCustomSkill}
              className="bg-gradient-to-r from-violet-500 to-amber-500 hover:from-violet-600 hover:to-amber-600"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-violet-200 dark:border-violet-800 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((skill) => (
              <button
                key={skill.id}
                onClick={() => addSkill(skill)}
                className="w-full px-4 py-2 text-left hover:bg-violet-50 dark:hover:bg-violet-950 flex items-center justify-between group"
              >
                <span className="font-medium text-gray-900 dark:text-gray-100">{skill.name}</span>
                <Badge
                  variant="secondary"
                  className="text-xs bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300"
                >
                  {skill.category}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSkills.map((skill) => (
            <Badge
              key={skill.id}
              variant="secondary"
              className="bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 transition-all duration-200 pr-1"
            >
              <span className="mr-2">{skill.name}</span>
              <button
                onClick={() => removeSkill(skill.id)}
                className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
