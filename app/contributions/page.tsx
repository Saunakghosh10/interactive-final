"use client"

import { ContributorDashboard } from "@/components/contributor/contributor-dashboard"

export default function ContributionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          My Contributions
        </h1>
        <ContributorDashboard />
      </div>
    </div>
  )
} 