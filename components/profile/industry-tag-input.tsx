"use client"

import { useState, useRef, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Plus, Building } from "lucide-react"
import { cn } from "@/lib/utils"

interface Industry {
  id: string
  name: string
}

interface IndustryTagInputProps {
  selectedIndustries: Industry[]
  onIndustriesChange: (industries: Industry[]) => void
  placeholder?: string
  className?: string
}

export function IndustryTagInput({
  selectedIndustries,
  onIndustriesChange,
  placeholder,
  className,
}: IndustryTagInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [suggestions, setSuggestions] = useState<Industry[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Mock industries data
  const mockIndustries: Industry[] = [
    { id: "1", name: "Technology" },
    { id: "2", name: "Healthcare" },
    { id: "3", name: "Finance" },
    { id: "4", name: "Education" },
    { id: "5", name: "E-commerce" },
    { id: "6", name: "Entertainment" },
    { id: "7", name: "Manufacturing" },
    { id: "8", name: "Consulting" },
    { id: "9", name: "Real Estate" },
    { id: "10", name: "Non-profit" },
  ]

  useEffect(() => {
    if (inputValue.length > 1) {
      const filtered = mockIndustries.filter(
        (industry) =>
          industry.name.toLowerCase().includes(inputValue.toLowerCase()) &&
          !selectedIndustries.some((selected) => selected.id === industry.id),
      )
      setSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [inputValue, selectedIndustries])

  const addIndustry = (industry: Industry) => {
    if (!selectedIndustries.some((i) => i.id === industry.id)) {
      onIndustriesChange([...selectedIndustries, industry])
    }
    setInputValue("")
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const removeIndustry = (industryId: string) => {
    onIndustriesChange(selectedIndustries.filter((industry) => industry.id !== industryId))
  }

  const createCustomIndustry = () => {
    if (inputValue.trim() && !selectedIndustries.some((i) => i.name.toLowerCase() === inputValue.toLowerCase())) {
      const newIndustry: Industry = {
        id: `custom-${Date.now()}`,
        name: inputValue.trim(),
      }
      addIndustry(newIndustry)
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  if (suggestions.length > 0) {
                    addIndustry(suggestions[0])
                  } else {
                    createCustomIndustry()
                  }
                }
              }}
              placeholder={placeholder || "Search industries..."}
              className="pl-10 border-violet-200 focus:border-violet-500 focus:ring-violet-500"
            />
          </div>
          {inputValue && (
            <Button
              size="sm"
              onClick={createCustomIndustry}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-violet-200 dark:border-violet-800 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((industry) => (
              <button
                key={industry.id}
                onClick={() => addIndustry(industry)}
                className="w-full px-4 py-2 text-left hover:bg-violet-50 dark:hover:bg-violet-950 flex items-center"
              >
                <Building className="w-4 h-4 mr-3 text-violet-500" />
                <span className="font-medium text-gray-900 dark:text-gray-100">{industry.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedIndustries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedIndustries.map((industry) => (
            <Badge
              key={industry.id}
              variant="secondary"
              className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 pr-1"
            >
              <Building className="w-3 h-3 mr-1" />
              <span className="mr-2">{industry.name}</span>
              <button
                onClick={() => removeIndustry(industry.id)}
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
