"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/products/product-card"
import { Header } from "@/components/layout/header"
import { AuthModal } from "@/components/auth/auth-modal"
import { createServerClient } from "@/lib/supabase"
import { createClient } from "@/lib/supabase.client"
import {
  ShoppingCart,
  Store,
  Truck,
  Shield,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  Leaf,
  Heart,
  Award,
  Clock,
} from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  category: string
  image_url: string
  status: string
  created_at: string
  seller_id: string
  profiles: {
    business_name: string | null
    full_name: string
  }
}

async function getFeaturedProducts() {
  const supabase = await createServerClient()

  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      profiles!products_seller_id_fkey(business_name, full_name)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(8)

  return products || []
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<"signin" | "signup">("signin")
  const [authModalRole, setAuthModalRole] = useState<"consumer" | "fbo">("consumer")

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      const supabase = createClient()
      const { data: products } = await supabase
        .from("products")
        .select(`
          *,
          profiles:seller_id (
            business_name,
            full_name
          )
        `)
        .eq("status", "active")
        .gt("quantity", 0)
        .order("created_at", { ascending: false })
        .limit(8)

      setFeaturedProducts(products || [])
    }

    fetchFeaturedProducts()
  }, [])

  const handleSignInClick = () => {
    setAuthModalTab("signin")
    setAuthModalRole("consumer")
    setIsAuthModalOpen(true)
  }

  const handleBecomeSellerClick = () => {
    setAuthModalTab("signup")
    setAuthModalRole("fbo")
    setIsAuthModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">🌱 Fresh & Sustainable</Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Fresh Food, <span className="text-green-600">Zero Waste</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Connect with local farmers and food businesses to reduce waste while enjoying fresh, quality produce
                  delivered to your doorstep.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Shop Now
                  </Button>
                </Link>
                <Button
                  onClick={handleBecomeSellerClick}
                  variant="outline"
                  size="lg"
                  className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 text-lg bg-transparent"
                >
                  <Store className="mr-2 h-5 w-5" />
                  Become a Seller
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">50+</div>
                  <div className="text-sm text-gray-600">Local Farmers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">1000+</div>
                  <div className="text-sm text-gray-600">Products Saved</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative z-10">
                <Image
                  src="/hero-grocery-basket.webp"
                  alt="Fresh grocery basket with fruits and vegetables"
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-2xl shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose ZeroWaste Rwanda?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to reducing food waste while connecting you with the freshest local produce.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Leaf className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Fresh & Organic</h3>
                <p className="text-gray-600">
                  Direct from local farmers, ensuring maximum freshness and quality for your family.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Truck className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Fast Delivery</h3>
                <p className="text-gray-600">
                  Quick and reliable delivery service to get fresh produce to your doorstep.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Quality Assured</h3>
                <p className="text-gray-600">
                  Every product is carefully inspected to meet our high quality standards.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Community Impact</h3>
                <p className="text-gray-600">Supporting local farmers and reducing food waste in our community.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <p className="text-xl text-gray-600">
                Discover fresh, quality products from local farmers and food businesses.
              </p>
            </div>
            <Link href="/products" className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium">
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 bg-transparent">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Reducing Food Waste, One Order at a Time</h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Join our mission to create a sustainable food ecosystem in Rwanda. Every purchase helps reduce waste
                  and supports local communities.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Direct from Farmers</h3>
                    <p className="text-gray-600">
                      Connect directly with local farmers and food businesses, ensuring fair prices and fresh produce.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Heart className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Focused</h3>
                    <p className="text-gray-600">
                      Supporting local communities by providing a platform for small-scale farmers and food businesses.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Award className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Guaranteed</h3>
                    <p className="text-gray-600">
                      Every product meets our strict quality standards, ensuring you get the best value for your money.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <Image
                src="/Vegetables.jpg"
                alt="Local farmers market"
                width={600}
                height={500}
                className="w-full h-auto rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Banners */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-700">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-8">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Leaf className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">Fresh Vegetables</h3>
                </div>
                <p className="text-white/90 mb-6">
                  Get the freshest vegetables directly from local farms. Perfect for healthy meals and family nutrition.
                </p>
                <Link href="/products?category=vegetables">
                  <Button variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                    Shop Vegetables
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-8">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">Quick Delivery</h3>
                </div>
                <p className="text-white/90 mb-6">
                  Same-day delivery available for orders placed before 2 PM. Fresh produce delivered to your doorstep.
                </p>
                <Link href="/products">
                  <Button variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                    Order Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust ZeroWaste Rwanda for their fresh produce needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600">
                  "Amazing quality and freshness! The vegetables I ordered were delivered the same day and lasted much
                  longer than store-bought ones."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">MK</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Marie Uwimana</div>
                    <div className="text-sm text-gray-600">Kigali</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600">
                  "Great platform for supporting local farmers. The prices are fair and the delivery is always on time."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">JB</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Jean Baptiste</div>
                    <div className="text-sm text-gray-600">Huye</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600">
                  "Love the variety of products available. It's so convenient to get fresh produce without leaving
                  home."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">AN</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Alice Nyirahabimana</div>
                    <div className="text-sm text-gray-600">Musanze</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-green-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-white">Stay Updated</h2>
            <p className="text-xl text-green-100">
              Get notified about new products, special offers, and tips for reducing food waste.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white"
              />
              <Button className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3">Subscribe</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">ZeroWaste Rwanda</h3>
              <p className="text-gray-400">
                Connecting communities with fresh, local produce while reducing food waste across Rwanda.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/" className="block text-gray-400 hover:text-white">
                  Home
                </Link>
                <Link href="/products" className="block text-gray-400 hover:text-white">
                  Products
                </Link>
                <Link href="/about" className="block text-gray-400 hover:text-white">
                  About
                </Link>
                <button onClick={handleBecomeSellerClick} className="block text-gray-400 hover:text-white text-left">
                  Become a Seller
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Categories</h4>
              <div className="space-y-2">
                <Link href="/products?category=fruits" className="block text-gray-400 hover:text-white">
                  Fruits
                </Link>
                <Link href="/products?category=vegetables" className="block text-gray-400 hover:text-white">
                  Vegetables
                </Link>
                <Link href="/products?category=dairy" className="block text-gray-400 hover:text-white">
                  Dairy
                </Link>
                <Link href="/products?category=grains" className="block text-gray-400 hover:text-white">
                  Grains
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <p>Email: info@zerowaste.rw</p>
                <p>Phone: +250 123 456 789</p>
                <p>Address: Kigali, Rwanda</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ZeroWaste Rwanda. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
        defaultRole={authModalRole}
      />
    </div>
  )
}
