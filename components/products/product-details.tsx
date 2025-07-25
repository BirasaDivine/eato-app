"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, ShoppingCart, Minus, Plus, MapPin, Clock, Star, Phone } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ProductCard } from "./product-card"
import { toast } from "react-toastify"

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
  } | null
}

interface ProductDetailsProps {
  product: Product
  relatedProducts: Product[]
}

export function ProductDetails({ product, relatedProducts }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  const supabase = createClient()

  useEffect(() => {
    checkIfFavorite()
  }, [product.id])

  const checkIfFavorite = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .single()

      setIsFavorite(!!data)
    } catch (error) {
      // Item not in favorites, which is fine
    }
  }

  const toggleFavorite = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Please sign in to add favorites")
        return
      }

      setIsLoading(true)

      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("product_id", product.id)

        if (error) {
          toast.error("Failed to remove from favorites")
          return
        }

        setIsFavorite(false)
        toast.success("Removed from favorites")
      } else {
        // Add to favorites
        const { error } = await supabase.from("favorites").insert({
          user_id: user.id,
          product_id: product.id,
        })

        if (error) {
          toast.error("Failed to add to favorites")
          return
        }

        setIsFavorite(true)
        toast.success("Added to favorites")
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const addToCart = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Please sign in to add to cart")
        return
      }

      setIsLoading(true)

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .single()

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity
        if (newQuantity > product.quantity) {
          toast.error("Not enough stock available")
          return
        }

        const { error } = await supabase.from("cart_items").update({ quantity: newQuantity }).eq("id", existingItem.id)

        if (error) {
          toast.error("Failed to update cart")
          return
        }
      } else {
        // Add new item
        if (quantity > product.quantity) {
          toast.error("Not enough stock available")
          return
        }

        const { error } = await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: product.id,
          quantity: quantity,
        })

        if (error) {
          toast.error("Failed to add to cart")
          return
        }
      }

      toast.success("Added to cart")
      setQuantity(1)
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(price)
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

  const calculateDiscount = (original: number, discounted: number) => {
    return Math.round(((original - discounted) / original) * 100)
  }

  const images = product.image_urls || ["/placeholder.svg?height=400&width=400"]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={images[selectedImage] || "/placeholder.svg"}
              alt={product.name}
              width={500}
              height={500}
              className="w-full h-full object-cover"
            />
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
            <Badge variant="outline" className="mb-2 capitalize">
              {product.category}
            </Badge>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-gray-600">(4.8) • 24 reviews</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold text-green-600">{formatPrice(product.discounted_price)}</span>
              {product.original_price > product.discounted_price && (
                <>
                  <span className="text-xl text-gray-500 line-through">{formatPrice(product.original_price)}</span>
                  <Badge className="bg-red-500 text-white">
                    -{calculateDiscount(product.original_price, product.discounted_price)}% OFF
                  </Badge>
                </>
              )}
            </div>

            {/* Stock and Expiry */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    product.quantity > 10 ? "bg-green-500" : product.quantity > 5 ? "bg-yellow-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-sm text-gray-600">{product.quantity} items available</span>
                {product.quantity <= 5 && (
                  <Badge variant="destructive" className="text-xs">
                    Low Stock
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-orange-600">
                <Clock className="h-4 w-4" />
                <span>{formatExpiryDate(product.expiry_date)}</span>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                  disabled={quantity >= product.quantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={addToCart}
                disabled={isLoading || product.quantity === 0}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>

              <Button
                variant="outline"
                onClick={toggleFavorite}
                disabled={isLoading}
                className={`${isFavorite ? "text-red-500 border-red-200" : ""}`}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Seller Info */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Seller Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{product.profiles?.business_name || product.profiles?.full_name}</span>
                </div>
                {product.profiles?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{product.profiles.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Description</h2>
          <p className="text-gray-700 leading-relaxed">{product.description}</p>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Related Products</h2>
            <Button variant="outline" asChild>
              <Link href="/products" className="flex items-center gap-2">
                View All Products
                <span>→</span>
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
