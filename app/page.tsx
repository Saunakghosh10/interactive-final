"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Users, MessageCircle, Network, Star, ArrowRight, Sparkles, Zap, Target } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export default function LandingPage() {
  const { data: session } = useSession()
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const features = [
    {
      icon: Lightbulb,
      title: "Idea Sharing & Discovery",
      description: "Share your innovative ideas and discover groundbreaking concepts from creators worldwide.",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      icon: Users,
      title: "Skill-based Matching",
      description: "Connect with collaborators who complement your skills and share your passion for innovation.",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      icon: MessageCircle,
      title: "Real-time Collaboration",
      description: "Work together seamlessly with integrated chat, video calls, and collaborative workspaces.",
      gradient: "from-violet-600 to-indigo-600",
    },
    {
      icon: Network,
      title: "Project Networking",
      description: "Build meaningful professional relationships and expand your creative network globally.",
      gradient: "from-amber-600 to-yellow-600",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Designer",
      content:
        "Interactive Ideas transformed how I collaborate. I've found amazing partners for three successful projects!",
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "Marcus Rodriguez",
      role: "Software Engineer",
      content:
        "The skill-matching feature is incredible. I connected with designers and marketers who perfectly complement my technical skills.",
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "Emily Watson",
      role: "Startup Founder",
      content:
        "This platform helped me find my co-founder and build an amazing team. The collaboration tools are top-notch!",
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60",
    },
  ]

  const stats = [
    { number: "10,000+", label: "Active Innovators", icon: Users },
    { number: "5,000+", label: "Projects Created", icon: Target },
    { number: "15,000+", label: "Connections Made", icon: Network },
    { number: "98%", label: "Success Rate", icon: Sparkles },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-violet-600 to-purple-700 dark:from-violet-900 dark:via-violet-800 dark:to-purple-900"></div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-10 w-20 h-20 bg-amber-400/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-10 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/4 w-16 h-16 bg-amber-400/15 rounded-full blur-lg animate-pulse delay-500"></div>
          <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-violet-300/10 rounded-full blur-xl animate-pulse delay-700"></div>
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center max-w-5xl mx-auto">
            <div
              className="transform transition-all duration-1000 ease-out"
              style={{
                transform: `translateY(${scrollY * 0.1}px)`,
              }}
            >
              <Badge className="mb-6 bg-amber-500/20 text-amber-100 border-amber-400/30 hover:bg-amber-500/30 text-sm px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                Join the Innovation Revolution
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-8 leading-tight">
                <span className="text-white">Where </span>
                <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">
                  Great Ideas
                </span>
                <br />
                <span className="text-white">Meet </span>
                <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">
                  Great Minds
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-violet-100 mb-10 max-w-4xl mx-auto leading-relaxed">
                Connect, collaborate, and create with like-minded innovators from around the world. Turn your ideas into
                reality with the power of community.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button
                  size="lg"
                  asChild
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl border-0"
                >
                  <Link href={session ? "/dashboard" : "/auth/signup"}>
                    {session ? "Go to Dashboard" : "Get Started"}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-2 border-white text-white hover:bg-white hover:text-violet-600 px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-200 bg-transparent"
                >
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-r from-violet-600 to-purple-700 dark:from-violet-800 dark:to-purple-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Join <span className="text-amber-300">10,000+</span> Innovators
            </h2>
            <p className="text-violet-200 text-lg">Building the future together, one idea at a time</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-300 mb-2">{stat.number}</div>
                <div className="text-violet-200 text-sm sm:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-700">
              <Zap className="w-4 h-4 mr-2" />
              Platform Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Innovate
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Powerful tools and features designed to help you connect, collaborate, and bring your ideas to life
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-violet-50 hover:to-purple-50 dark:hover:from-violet-950 dark:hover:to-purple-950 transform hover:-translate-y-3 hover:rotate-1"
              >
                <CardContent className="p-8 text-center">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700">
              <MessageCircle className="w-4 h-4 mr-2" />
              Success Stories
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              What Our{" "}
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Innovators
              </span>{" "}
              Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Real stories from real people who've transformed their ideas into reality
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-violet-500 to-purple-600 text-white transform hover:-translate-y-2 hover:scale-105"
              >
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-amber-300 fill-current" />
                    ))}
                  </div>
                  <p className="text-violet-100 mb-8 leading-relaxed italic text-lg">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full mr-4 border-3 border-amber-300 shadow-lg"
                    />
                    <div>
                      <div className="font-semibold text-white text-lg">{testimonial.name}</div>
                      <div className="text-violet-200">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-violet-500 via-purple-600 to-violet-700 dark:from-violet-800 dark:via-purple-800 dark:to-violet-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-amber-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-8">
            Ready to Turn Your{" "}
            <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">Ideas</span>{" "}
            into Reality?
          </h2>
          <p className="text-xl text-violet-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of innovators who are already building the future together. Your next breakthrough is just
            one connection away.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white px-10 py-5 text-lg font-semibold transform hover:scale-105 transition-all duration-200 shadow-xl border-0"
            >
              <Link href={session ? "/dashboard" : "/auth/signup"}>
                {session ? "Go to Dashboard" : "Start Your Journey"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-2 border-white text-white hover:bg-white hover:text-violet-600 px-10 py-5 text-lg font-semibold bg-transparent"
            >
              <Link href="/demo">Schedule Demo</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
