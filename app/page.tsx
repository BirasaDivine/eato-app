import { createServerClient } from "@/lib/supabase"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Truck, Shield, Award, Recycle, Star, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

async function getProducts() {
  const supabase = createServerClient()

  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      profiles!products_seller_id_fkey(business_name, full_name)
    `)
    .eq("is_active", true)
    .gte("expiry_date", new Date().toISOString().split("T")[0])
    .order("created_at", { ascending: false })
    .limit(8)

  return products || []
}

async function getCategories() {
  const supabase = createServerClient()

  const { data } = await supabase
    .from("products")
    .select("category")
    .eq("is_active", true)
    .gte("expiry_date", new Date().toISOString().split("T")[0])

  const categories = [...new Set(data?.map((p) => p.category) || [])]
  return categories
}

export default async function HomePage() {
  const products = await getProducts()
  const categories = await getCategories()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const calculateDiscount = (original: number, discounted: number) => {
    return Math.round(((original - discounted) / original) * 100)
  }

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Expires today"
    if (diffDays === 1) return "Expires tomorrow"
    return `Expires in ${diffDays} days`
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-50 to-green-100 overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">100% Fresh & Quality</Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Fresh & Healthy
                  <span className="text-green-600 block">Food Near Expiry</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Buy high-quality food at amazing discounts and help reduce waste. Fresh products from local businesses
                  at up to 70% off regular prices.
                </p>
              </div>
              <div className="flex gap-4">
                <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 px-8 py-6 text-lg">
                  <Link href="/products">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg bg-transparent">
                  <Link href="/fbo">Sell Products</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10">
                <Image
                  src="/placeholder.svg?height=500&width=600"
                  alt="Fresh vegetables and fruits"
                  width={600}
                  height={500}
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-200 rounded-full opacity-60"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-orange-200 rounded-full opacity-40"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <Truck className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Same Day Pickup</h3>
              <p className="text-gray-600 text-sm">Quick pickup from local businesses</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                <Award className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Best Prices</h3>
              <p className="text-gray-600 text-sm">Up to 70% off regular prices</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quality Assured</h3>
              <p className="text-gray-600 text-sm">Fresh, safe, and quality products</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <Recycle className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Zero Waste</h3>
              <p className="text-gray-600 text-sm">Help reduce food waste impact</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 mb-4">WE LOVE SAVING FOOD</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest Deals</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover amazing discounts on quality food items from local businesses
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {products.slice(0, 8).map((product) => (
              <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md">
                <div className="relative overflow-hidden rounded-t-lg">
                  {product.image_urls && product.image_urls.length > 0 ? (
                    <Image
                      src={product.image_urls[0] || "/placeholder.svg"}
                      alt={product.name}
                      width={300}
                      height={240}
                      className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-60 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                  <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-500">
                    {calculateDiscount(product.original_price, product.discounted_price)}% OFF
                  </Badge>
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-white/90 text-gray-700">
                      {product.category}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-green-600 transition-colors">
                    {product.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {product.profiles?.business_name || product.profiles?.full_name}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-green-600">{formatPrice(product.discounted_price)}</span>
                      <span className="text-sm text-gray-500 line-through ml-2">
                        {formatPrice(product.original_price)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">{product.quantity} left</span>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
                    <Clock className="h-3 w-3" />
                    {formatExpiryDate(product.expiry_date)}
                  </div>

                  <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                    <Link href={`/products/${product.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button asChild variant="outline" size="lg" className="px-8 bg-transparent">
              <Link href="/products">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 mb-4">Why Choose Us?</Badge>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">We're Making a Difference Together</h2>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">100% Organic Source</h3>
                    <p className="text-gray-600">
                      We partner with local businesses to offer fresh, quality food that would otherwise go to waste.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Fast Delivery Service</h3>
                    <p className="text-gray-600">
                      Quick pickup and delivery options to ensure you get fresh products when you need them.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Complete Safe & Organic Food</h3>
                    <p className="text-gray-600">
                      All products are carefully inspected to ensure they meet our quality and safety standards.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Best in Social Impact</h3>
                    <p className="text-gray-600">
                      Every purchase helps reduce food waste and supports local businesses in Rwanda.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <Image
                  src="/placeholder.svg?height=500&width=500"
                  alt="Delivery person with fresh groceries"
                  width={500}
                  height={500}
                  className="w-full h-auto rounded-2xl"
                />
              </div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-green-200 rounded-full opacity-60"></div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-orange-200 rounded-full opacity-40"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Banners */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 overflow-hidden">
              <CardContent className="p-8 relative">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">Natural Vegetables</h3>
                  <p className="mb-4 opacity-90">Fresh from local farms</p>
                  <Button variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                    Shop Now
                  </Button>
                </div>
                <div className="absolute right-0 top-0 opacity-20">
                  <Image
                    src="/placeholder.svg?height=200&width=200"
                    alt="Vegetables"
                    width={200}
                    height={200}
                    className="w-32 h-32"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 overflow-hidden">
              <CardContent className="p-8 relative">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">Specially Fresh</h3>
                  <p className="mb-4 opacity-90">Quality guaranteed products</p>
                  <Button variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100">
                    Explore
                  </Button>
                </div>
                <div className="absolute right-0 top-0 opacity-20">
                  <Image
                    src="/placeholder.svg?height=200&width=200"
                    alt="Fresh fruits"
                    width={200}
                    height={200}
                    className="w-32 h-32"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 mb-4">CLIENT TESTIMONIALS</Badge>
            <h2 className="text-4xl font-bold text-gray-900">What Our Customers Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "Amazing quality food at incredible prices! I've saved so much money while helping reduce waste. The
                  app is easy to use and delivery is always on time."
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    src="/placeholder.svg?height=40&width=40"
                    alt="Customer"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Marie Uwimana</p>
                    <p className="text-sm text-gray-600">Regular Customer</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "As a restaurant owner, this platform has helped us reduce waste significantly. Instead of throwing
                  away good food, we can sell it at discounted prices."
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    src="/placeholder.svg?height=40&width=40"
                    alt="Business Owner"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Jean Baptiste</p>
                    <p className="text-sm text-gray-600">Restaurant Owner</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "I love that I can help the environment while saving money on groceries. The food is always fresh and
                  the variety is great. Highly recommend!"
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    src="/placeholder.svg?height=40&width=40"
                    alt="Happy Customer"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Grace Mukamana</p>
                    <p className="text-sm text-gray-600">Eco-conscious Shopper</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-green-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Join Our Community & Get Offers</h2>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about new deals, special offers, and tips for reducing
            food waste.
          </p>
          <div className="flex max-w-md mx-auto gap-4">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-green-300 outline-none"
            />
            <Button className="bg-orange-500 hover:bg-orange-600 px-8">Subscribe</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold text-green-400 mb-4">ZeroWaste Rwanda</h3>
              <p className="text-gray-400 mb-4">
                Fighting food waste while helping you save money on quality products from local businesses.
              </p>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-xs">f</span>
                </div>
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-xs">t</span>
                </div>
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-xs">in</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-white">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/fbo" className="hover:text-white">
                    For Businesses
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Customer Care</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-white">
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="hover:text-white">
                    Returns
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📍 Kigali, Rwanda</li>
                <li>📞 +250 123 456 789</li>
                <li>✉️ info@zerowaste.rw</li>
                <li>🕒 Mon-Fri: 8AM-6PM</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ZeroWaste Rwanda. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
