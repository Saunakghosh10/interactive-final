import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { Header } from "@/components/header"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Interactive Ideas - Share and Collaborate on Innovative Projects",
  description: "A platform for sharing and collaborating on innovative ideas and projects",
  keywords: ["collaboration", "innovation", "ideas", "projects", "networking"],
  authors: [{ name: "Interactive Ideas Team" }],
  openGraph: {
    title: "Interactive Ideas - Where Great Ideas Meet Great Minds",
    description: "Connect, collaborate, and create with like-minded innovators from around the world.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Interactive Ideas - Where Great Ideas Meet Great Minds",
    description: "Connect, collaborate, and create with like-minded innovators from around the world.",
  },
    generator: 'v0.dev'
}

const navigation = [
  { name: "Feed", href: "/feed" },
  { name: "Projects", href: "/projects" },
  { name: "Ideas", href: "/ideas" },
  { name: "Community", href: "/community" },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background antialiased")}>
        <ErrorBoundary>
          <Providers>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Header navigation={navigation} />
                <main>{children}</main>
              <Toaster />
            </ThemeProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
