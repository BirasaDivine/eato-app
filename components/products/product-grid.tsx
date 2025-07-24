import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Product {
  id: string
  name: string
  description: string | null
  category: string
  original_price: number
  discounted_price: number
  quantity: number
  expiry_date: string
  image_urls: string[] | null
  profiles: {
    business_name: string | null
    full_name: string | null
  } | null
}

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
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

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <span className="text-lg font-bold text-green-600">{formatPrice(product.discounted_price)}</span>
                  <span className="text-sm text-gray-500 line-through ml-2">{formatPrice(product.original_price)}</span>
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
  )
}
