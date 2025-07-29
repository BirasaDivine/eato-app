"use client"

import { useState } from "react"
import { AuthModal } from "@/components/auth/auth-modal"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Store, TrendingUp, Users, ShoppingCart, CheckCircle, Star, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function FBOPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)

  const benefits = [
    {
      icon: Store,
      title: "Easy Store Setup",
      description: "Create your online store in minutes with our user-friendly dashboard.",
    },
    {
      icon: TrendingUp,
      title: "Increase Sales",
      description: "Reach more customers and grow your business with our platform.",
    },
    {
      icon: Users,
      title: "Customer Management",
      description: "Track orders, manage customers, and build lasting relationships.",
    },
    {
      icon: ShoppingCart,
      title: "Inventory Control",
      description: "Keep track of your products and never run out of stock.",
    },
  ]

  const features = [
    "Free registration and setup",
    "Commission-based pricing",
    "Real-time order notifications",
    "Customer review system",
    "Analytics and reporting",
    "Mobile-friendly dashboard",
  ]

  const testimonials = [
    {
      name: "Jean Claude Uwimana",
      business: "Fresh Fruits Rwanda",
      rating: 5,
      comment: "ZeroWaste Rwanda has helped me reach customers I never could before. My sales have increased by 300%!",
    },
    {
      name: "Marie Mukamana",
      business: "Organic Vegetables Co.",
      rating: 5,
      comment: "The platform is so easy to use. I can manage my inventory and orders from anywhere.",
    },
    {
      name: "Paul Nzeyimana",
      business: "Dairy Fresh",
      rating: 5,
      comment: "Great support team and excellent features. Highly recommend to any food business owner.",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-green-100 text-green-800">🚀 Start Selling Today</Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Grow Your <span className="text-green-600">Food Business</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Join Rwanda's leading food marketplace and connect with thousands of customers looking for fresh,
                  quality produce.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
                  onClick={() => setShowAuthModal(true)}
                >
                  <Store className="mr-2 h-5 w-5" />
                  Start Selling Now
                </Button>
                <Link href="/products">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 text-lg bg-transparent"
                  >
                    View Marketplace
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">50+</div>
                  <div className="text-sm text-gray-600">Active Sellers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">1000+</div>
                  <div className="text-sm text-gray-600">Orders Completed</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <Image
                src="/placeholder.svg?height=500&width=600"
                alt="Farmer selling fresh produce"
                width={600}
                height={500}
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Platform?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide everything you need to succeed in the digital marketplace.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <benefit.icon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Our comprehensive platform provides all the tools and features you need to run a successful food
                  business online.
                </p>
              </div>

              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setShowAuthModal(true)}
              >
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="relative">
              <Image
                src="/placeholder.svg?height=500&width=600"
                alt="Business dashboard"
                width={600}
                height={500}
                className="w-full h-auto rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in just three simple steps and begin selling your products today.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Sign Up</h3>
                <p className="text-gray-600">
                  Create your seller account and complete your business profile in minutes.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Add Products</h3>
                <p className="text-gray-600">
                  Upload your products with photos, descriptions, and pricing information.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Start Selling</h3>
                <p className="text-gray-600">
                  Receive orders, manage inventory, and grow your business with our tools.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from our successful sellers who have grown their businesses with our platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.comment}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.business}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-white">Ready to Start Selling?</h2>
            <p className="text-xl text-green-100">
              Join thousands of successful food businesses on ZeroWaste Rwanda and start growing your sales today.
            </p>
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 text-lg"
              onClick={() => setShowAuthModal(true)}
            >
              <Store className="mr-2 h-5 w-5" />
              Create Seller Account
            </Button>
          </div>
        </div>
      </section>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultRole="fbo" />
    </div>
  )
}
