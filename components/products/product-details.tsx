"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Clock, MapPin, Phone, ShoppingCart, Store, Minus, Plus } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

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
    phone: string | null
    business_address: string | null
  } | null
}

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [user, setUser] = useState<User | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

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

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please sign in to add items to cart")
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from("cart_items").upsert(
        {
          user_id: user.id,
          product_id: product.id,
          quantity,
        },
        {
          onConflict: "user_id,product_id",
        },
      )

      if (error) throw error

      toast.success("Added to cart successfully!")
      router.refresh()
    } catch (error) {
      toast.error("Failed to add to cart")
    } finally {
      setLoading(false)
    }
  }

  const images = product.image_urls || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
            {images.length > 0 ? (
              <Image
                src={images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400 text-lg">No image available</span>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? "border-green-500" : "border-gray-200"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
              <Badge variant="secondary" className="capitalize">
                {product.category}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <Store className="h-4 w-4" />
              <span>{product.profiles?.business_name || product.profiles?.full_name}</span>
            </div>

            {product.description && <p className="text-gray-600 leading-relaxed">{product.description}</p>}
          </div>

          <Separator />

          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-green-600">{formatPrice(product.discounted_price)}</span>
              <span className="text-xl text-gray-500 line-through">{formatPrice(product.original_price)}</span>
              <Badge className="bg-red-500">
                {calculateDiscount(product.original_price, product.discounted_price)}% OFF
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              You save {formatPrice(product.original_price - product.discounted_price)}
            </p>
          </div>

          <Separator />

          {/* Availability & Expiry */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Available quantity:</span>
              <span className="font-semibold">{product.quantity} items</span>
            </div>

            <div className="flex items-center gap-2 text-orange-600">
              <Clock className="h-4 w-4" />
              <span className="font-medium">{formatExpiryDate(product.expiry_date)}</span>
            </div>
          </div>

          <Separator />

          {/* Quantity Selector */}
          <div className="space-y-4">
            <Label htmlFor="quantity">Quantity</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={product.quantity}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Math.min(product.quantity, Number.parseInt(e.target.value) || 1)))
                }
                className="w-20 text-center"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                disabled={quantity >= product.quantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Add to Cart */}
          <Button
            onClick={handleAddToCart}
            disabled={loading || product.quantity === 0}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            {loading ? "Adding to Cart..." : "Add to Cart"}
          </Button>

          <Separator />

          {/* Seller Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seller Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-gray-500" />
                <span>{product.profiles?.business_name || product.profiles?.full_name}</span>
              </div>

              {product.profiles?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{product.profiles.phone}</span>
                </div>
              )}

              {product.profiles?.business_address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <span className="text-sm">{product.profiles.business_address}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
