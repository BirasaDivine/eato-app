import { createServerClient } from "@/lib/supabase"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Users, Leaf, TrendingDown, Clock, MapPin } from "lucide-react"
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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-green-800 mb-6">Fight Food Waste, Save Money</h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover quality food near expiration at amazing prices. Help reduce waste while saving money in Kigali.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link href="/products">Shop Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/fbo">Sell Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <TrendingDown className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-3xl font-bold text-gray-800">100+</h3>
              <p className="text-gray-600">Tons of food saved daily</p>
            </div>
            <div className="flex flex-col items-center">
              <Users className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-3xl font-bold text-gray-800">500+</h3>
              <p className="text-gray-600">Active consumers</p>
            </div>
            <div className="flex flex-col items-center">
              <ShoppingCart className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-3xl font-bold text-gray-800">50+</h3>
              <p className="text-gray-600">Partner businesses</p>
            </div>
            <div className="flex flex-col items-center">
              <Leaf className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-3xl font-bold text-gray-800">80%</h3>
              <p className="text-gray-600">Waste reduction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Shop by Category</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <Link key={category} href={`/products?category=${category}`}>
                  <Badge variant="secondary" className="text-lg py-2 px-4 hover:bg-green-100 cursor-pointer">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">Latest Deals</h2>
            <Button asChild variant="outline">
              <Link href="/products">View All Products</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  {product.image_urls && product.image_urls.length > 0 ? (
                    <Image
                      src={product.image_urls[0] || "/placeholder.svg"}
                      alt={product.name}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                  <Badge className="absolute top-2 right-2 bg-red-500">
                    {calculateDiscount(product.original_price, product.discounted_price)}% OFF
                  </Badge>
                </div>

                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                    <Badge variant="secondary">{product.category}</Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {product.profiles?.business_name || product.profiles?.full_name}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-green-600">
                          {formatPrice(product.discounted_price)}
                        </span>
                        <span className="text-sm text-gray-500 line-through ml-2">
                          {formatPrice(product.original_price)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">{product.quantity} left</span>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-orange-600">
                      <Clock className="h-3 w-3" />
                      {formatExpiryDate(product.expiry_date)}
                    </div>

                    <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                      <Link href={`/products/${product.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-700">For Businesses</CardTitle>
                <CardDescription>List your near-expiry products instead of throwing them away</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Easy product listing</li>
                  <li>• Set discount prices</li>
                  <li>• Reduce waste costs</li>
                  <li>• Reach more customers</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-700">For Consumers</CardTitle>
                <CardDescription>Find quality food at discounted prices near you</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Browse local deals</li>
                  <li>• Filter by category</li>
                  <li>• Save money</li>
                  <li>• Help the environment</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-700">For Environment</CardTitle>
                <CardDescription>Together we're making a positive impact on our planet</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Reduce landfill waste</li>
                  <li>• Lower carbon footprint</li>
                  <li>• Sustainable consumption</li>
                  <li>• Community awareness</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
