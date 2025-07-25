import { createServerClient } from "@/lib/supabase"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Truck, DollarSign, Leaf, Shield, Star, ArrowRight, Users, ShoppingCart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ProductCard } from "@/components/products/product-card"

async function getFeaturedProducts() {
  const supabase = createServerClient()

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

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts()

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-green-50 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1200')] opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">🌱 100% Organic & Fresh</Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Fresh & Healthy
                  <span className="text-green-600 block">Organic Food</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Discover premium quality organic vegetables and reduce food waste. Connect directly with local farmers
                  and businesses for the freshest produce.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg">
                  <Link href="/products">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Shop Now
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-6 text-lg bg-transparent"
                >
                  <Link href="/fbo">
                    <Users className="mr-2 h-5 w-5" />
                    Become a Seller
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">2,500+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">150+</div>
                  <div className="text-sm text-gray-600">Verified Sellers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600">Satisfaction Rate</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <Image
                  src="/placeholder.svg?height=600&width=600"
                  alt="Fresh organic vegetables"
                  width={600}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-200 rounded-full opacity-60"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-orange-200 rounded-full opacity-40"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow border-0 bg-white">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Truck className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg">Fast Delivery</h3>
                <p className="text-gray-600 text-sm">Same day delivery for fresh produce within Kigali</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow border-0 bg-white">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg">Best Prices</h3>
                <p className="text-gray-600 text-sm">Competitive prices with up to 50% discounts</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow border-0 bg-white">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <Leaf className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-lg">Fresh Daily</h3>
                <p className="text-gray-600 text-sm">Harvested daily from local organic farms</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow border-0 bg-white">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg">Quality Assured</h3>
                <p className="text-gray-600 text-sm">100% organic certification and quality guarantee</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">WE LOVE FRESH</h2>
            <div className="flex justify-center gap-4 mb-8">
              <Button variant="default" className="bg-green-600 hover:bg-green-700">
                Vegetables
              </Button>
              <Button variant="outline">Fruits</Button>
              <Button variant="outline">Dairy</Button>
              <Button variant="outline">Bakery</Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-green-600 text-green-600 hover:bg-green-50 bg-transparent inline-flex items-center gap-2"
            >
              <Link href="/products" className="flex items-center gap-2">
                View All Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
                <p className="text-gray-600">
                  We're committed to reducing food waste while providing the freshest organic produce to your doorstep.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">100% Organic Source</h3>
                    <p className="text-gray-600">
                      All our products are sourced from certified organic farms across Rwanda, ensuring the highest
                      quality and nutritional value.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Fast Delivery Service</h3>
                    <p className="text-gray-600">
                      Same-day delivery within Kigali and next-day delivery to other provinces, keeping your produce
                      fresh and nutritious.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Complete Fresh & Organic Food</h3>
                    <p className="text-gray-600">
                      From farm to table, we maintain the cold chain and ensure all products meet our strict freshness
                      and organic standards.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Best Online Support</h3>
                    <p className="text-gray-600">
                      24/7 customer support to help you with orders, delivery tracking, and any questions about our
                      products and services.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-green-100 rounded-full p-8">
                <Image
                  src="/placeholder.svg?height=400&width=400"
                  alt="Delivery person"
                  width={400}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Banners */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 overflow-hidden">
              <CardContent className="p-8 relative">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">Natural Vegetables</h3>
                  <p className="mb-6 opacity-90">Fresh from our organic farms</p>
                  <Button variant="secondary" className="bg-white text-green-600 hover:bg-gray-100" asChild>
                    <Link href="/products?category=vegetables">Shop Now</Link>
                  </Button>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-20">
                  <Leaf className="h-32 w-32" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 overflow-hidden">
              <CardContent className="p-8 relative">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">Specially Fresh</h3>
                  <p className="mb-6 opacity-90">Harvested this morning</p>
                  <Button variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100" asChild>
                    <Link href="/products?category=fruits">Discover</Link>
                  </Button>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-20">
                  <Star className="h-32 w-32" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">CLIENT TESTIMONIALS</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Image
                    src="/placeholder.svg?height=50&width=50"
                    alt="Customer"
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold">Sarah Mukamana</h4>
                    <p className="text-sm text-gray-600">Regular Customer</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm">
                  "The quality of vegetables is outstanding! Fresh, organic, and delivered right to my door. ZeroWaste
                  Rwanda has become my go-to for all organic produce."
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Image
                    src="/placeholder.svg?height=50&width=50"
                    alt="Customer"
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold">Jean Baptiste</h4>
                    <p className="text-sm text-gray-600">Restaurant Owner</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm">
                  "As a restaurant owner, I need consistent quality and freshness. ZeroWaste Rwanda delivers exactly
                  that, plus their prices help reduce food waste in my business."
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Image
                    src="/placeholder.svg?height=50&width=50"
                    alt="Customer"
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold">Grace Uwimana</h4>
                    <p className="text-sm text-gray-600">Health Enthusiast</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm">
                  "I love that I can support local farmers while getting the freshest organic produce. The platform is
                  easy to use and the delivery is always on time."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-green-600">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Join Our Community & Get Offers</h2>
            <p className="text-green-100 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter and be the first to know about new products, special offers, and
              sustainability tips.
            </p>

            <div className="max-w-md mx-auto flex gap-4">
              <Input type="email" placeholder="Enter your email address" className="bg-white text-gray-900 border-0" />
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8">Subscribe</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-6 text-green-400">ZeroWaste Rwanda</h3>
              <p className="text-gray-400 mb-6">
                Connecting communities to reduce food waste and promote sustainable living through fresh, organic
                produce.
              </p>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-sm">f</span>
                </div>
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-sm">t</span>
                </div>
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-sm">i</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="/products" className="hover:text-white transition-colors">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/fbo" className="hover:text-white transition-colors">
                    Become a Seller
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-white transition-colors">
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="hover:text-white transition-colors">
                    Returns
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6">Contact Info</h4>
              <ul className="space-y-3 text-gray-400">
                <li>📍 Kigali, Rwanda</li>
                <li>📞 +250 788 123 456</li>
                <li>✉️ info@zerowasterwanda.com</li>
                <li>🕒 Mon - Sat: 8AM - 6PM</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ZeroWaste Rwanda. All rights reserved. | Reducing food waste, one meal at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
