"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X, TrendingUp, Clock, Star, Users, Building, Tag, Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"

interface IdeaFiltersProps {
  onFiltersChange: (filters: any) => void
  className?: string
  showBookmarkFilter?: boolean
}

const categories = [
  { value: "ALL", label: "All Categories", icon: "🌟" },
  { value: "TECHNOLOGY", label: "Technology", icon: "💻" },
  { value: "BUSINESS", label: "Business", icon: "💼" },
  { value: "DESIGN", label: "Design", icon: "🎨" },
  { value: "HEALTHCARE", label: "Healthcare", icon: "🏥" },
  { value: "EDUCATION", label: "Education", icon: "📚" },
  { value: "ENTERTAINMENT", label: "Entertainment", icon: "🎬" },
  { value: "ENVIRONMENT", label: "Environment", icon: "🌱" },
  { value: "SOCIAL_IMPACT", label: "Social Impact", icon: "🤝" },
  { value: "FINANCE", label: "Finance", icon: "💰" },
  { value: "LIFESTYLE", label: "Lifestyle", icon: "🌟" },
  { value: "OTHER", label: "Other", icon: "📝" },
]

const sortOptions = [
  { value: "newest", label: "Newest First", icon: Clock },
  { value: "oldest", label: "Oldest First", icon: Clock },
  { value: "popular", label: "Most Popular", icon: TrendingUp },
  { value: "featured", label: "Featured", icon: Star },
  { value: "most_liked", label: "Most Liked", icon: Users },
]

const popularSkills = [
  "React",
  "Node.js",
  "Python",
  "UI/UX Design",
  "Machine Learning",
  "Product Management",
  "Marketing",
  "Data Science",
  "DevOps",
  "Mobile Development",
]

const popularIndustries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "E-commerce",
  "Entertainment",
  "Manufacturing",
  "Consulting",
  "Real Estate",
  "Non-profit",
]

export function IdeaFilters({ onFiltersChange, className, showBookmarkFilter = false }: IdeaFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("ALL")
  const [selectedSort, setSelectedSort] = useState("newest")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [showBookmarked, setShowBookmarked] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFiltersUpdate()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Update filters when any selection changes
  useEffect(() => {
    handleFiltersUpdate()
  }, [selectedCategory, selectedSort, selectedSkills, selectedIndustries, showBookmarked])

  const handleFiltersUpdate = () => {
    onFiltersChange({
      search: searchQuery,
      category: selectedCategory === "ALL" ? null : selectedCategory,
      sort: selectedSort,
      skills: selectedSkills,
      industries: selectedIndustries,
      bookmarked: showBookmarked,
    })
  }

  const toggleSkill = (skill: string) => {
    const updated = selectedSkills.includes(skill)
      ? selectedSkills.filter((s) => s !== skill)
      : [...selectedSkills, skill]
    setSelectedSkills(updated)
  }

  const toggleIndustry = (industry: string) => {
    const updated = selectedIndustries.includes(industry)
      ? selectedIndustries.filter((i) => i !== industry)
      : [...selectedIndustries, industry]
    setSelectedIndustries(updated)
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedCategory("ALL")
    setSelectedSort("newest")
    setSelectedSkills([])
    setSelectedIndustries([])
    setShowBookmarked(false)
    setShowAdvanced(false)
  }

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "ALL" ||
    selectedSkills.length > 0 ||
    selectedIndustries.length > 0 ||
    showBookmarked

  return (
    <Card className={cn("border-violet-200 dark:border-violet-800", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-violet-900 dark:text-violet-100 flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="w-5 h-5 mr-2 text-violet-600" />
            Filter Ideas
          </div>
          {hasActiveFilters && (
            <Button
              size="sm"
              variant="ghost"
              onClick={clearAllFilters}
              className="text-violet-600 hover:text-violet-700 hover:bg-violet-100 dark:hover:bg-violet-900"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ideas..."
              className="pl-10 border-violet-200 focus:border-violet-500 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</h4>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                size="sm"
                variant={selectedCategory === category.value ? "default" : "outline"}
                className={cn(
                  "justify-start h-auto p-2 transition-all duration-200",
                  selectedCategory === category.value
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white border-violet-500"
                    : "border-violet-200 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950",
                )}
                onClick={() => setSelectedCategory(category.value)}
              >
                <span className="mr-2">{category.icon}</span>
                <span className="text-xs truncate">{category.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</h4>
          <Select value={selectedSort} onValueChange={setSelectedSort}>
            <SelectTrigger className="border-violet-200 focus:border-violet-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center">
                    <option.icon className="w-4 h-4 mr-2" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bookmark Filter */}
        {showBookmarkFilter && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Only</h4>
            <Button
              variant={showBookmarked ? "default" : "outline"}
              className={cn(
                "w-full justify-start transition-all duration-200",
                showBookmarked
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white border-violet-500"
                  : "border-violet-200 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950",
              )}
              onClick={() => setShowBookmarked(!showBookmarked)}
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Bookmarked Ideas
            </Button>
          </div>
        )}

        <Separator className="bg-violet-200 dark:bg-violet-800" />

        {/* Advanced Filters Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full justify-center text-violet-600 hover:text-violet-700 hover:bg-violet-100 dark:hover:bg-violet-900"
        >
          {showAdvanced ? "Hide" : "Show"} Advanced Filters
        </Button>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-6">
            {/* Skills Filter */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <Tag className="w-4 h-4 mr-2 text-violet-600" />
                Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {popularSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant={selectedSkills.includes(skill) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all duration-200",
                      selectedSkills.includes(skill)
                        ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white border-violet-500"
                        : "border-violet-200 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950",
                    )}
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                    {selectedSkills.includes(skill) && <X className="w-3 h-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Industries Filter */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <Building className="w-4 h-4 mr-2 text-violet-600" />
                Industries
              </h4>
              <div className="flex flex-wrap gap-2">
                {popularIndustries.map((industry) => (
                  <Badge
                    key={industry}
                    variant={selectedIndustries.includes(industry) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all duration-200",
                      selectedIndustries.includes(industry)
                        ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-amber-500"
                        : "border-amber-200 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950",
                    )}
                    onClick={() => toggleIndustry(industry)}
                  >
                    {industry}
                    {selectedIndustries.includes(industry) && <X className="w-3 h-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Filters:</h4>
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <Badge
                  variant="secondary"
                  className="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300"
                >
                  Search: "{searchQuery}"
                </Badge>
              )}
              {selectedCategory !== "ALL" && (
                <Badge
                  variant="secondary"
                  className="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300"
                >
                  Category: {categories.find((c) => c.value === selectedCategory)?.label}
                </Badge>
              )}
              {selectedSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300"
                >
                  Skill: {skill}
                </Badge>
              ))}
              {selectedIndustries.map((industry) => (
                <Badge
                  key={industry}
                  variant="secondary"
                  className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                >
                  Industry: {industry}
                </Badge>
              ))}
              {showBookmarked && (
                <Badge
                  variant="secondary"
                  className="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300"
                >
                  Bookmarked Only
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
