"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"
import { Heart, ShoppingCart, Clock, MapPin, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface FavoriteItem {
  id: string
  products: {
    id: string
    name: string
    discounted_price: number
    original_price: number
    quantity: number
    expiry_date: string
    image_urls: string[] | null
    category: string
    profiles: {
      business_name: string | null
      full_name: string | null
    } | null
  }
}

interface FavoriteItemsProps {
  initialFavoriteItems: FavoriteItem[]
}

export function FavoriteItems({ initialFavoriteItems }: FavoriteItemsProps) {
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>(initialFavoriteItems)
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    setFavoriteItems(initialFavoriteItems)
  }, [initialFavoriteItems])

  const removeFromFavorites = async (favoriteId: string) => {
    try {
      const { error } = await supabase.from("favorites").delete().eq("id", favoriteId)

      if (error) {
        toast.error("Failed to remove from favorites")
        return
      }

      setFavoriteItems((prev) => prev.filter((item) => item.id !== favoriteId))
      toast.success("Removed from favorites")
    } catch (error) {
      console.error("Error removing from favorites:", error)
      toast.error("An error occurred")
    }
  }

  const addToCart = async (productId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Please sign in to add to cart")
        return
      }

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .single()

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id)

        if (error) {
          toast.error("Failed to update cart")
          return
        }
      } else {
        // Add new item
        const { error } = await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: productId,
          quantity: 1,
        })

        if (error) {
          toast.error("Failed to add to cart")
          return
        }
      }

      toast.success("Added to cart")
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("An error occurred")
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

  if (favoriteItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No favorites yet</h2>
        <p className="text-gray-600 mb-8">Start browsing and add items you love to your favorites</p>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
        <p className="text-gray-600">Items you've saved for later</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favoriteItems.map((item) => (
          <Card
            key={item.id}
            className="group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden relative"
          >
            <div className="relative">
              <Link href={`/products/${item.products.id}`}>
                <Image
                  src={item.products.image_urls?.[0] || "/placeholder.svg?height=240&width=300&query=organic food"}
                  alt={item.products.name}
                  width={300}
                  height={240}
                  className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>

              {/* Discount Badge */}
              {item.products.original_price > item.products.discounted_price && (
                <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-500 text-white">
                  -{calculateDiscount(item.products.original_price, item.products.discounted_price)}%
                </Badge>
              )}

              {/* Remove from Favorites Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-3 right-3 h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white text-red-500"
                onClick={() => removeFromFavorites(item.id)}
              >
                <Heart className="h-4 w-4 fill-current" />
              </Button>
            </div>

            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Category */}
                <Badge variant="outline" className="text-xs capitalize">
                  {item.products.category}
                </Badge>

                {/* Product Name */}
                <Link href={`/products/${item.products.id}`}>
                  <h3 className="font-semibold text-lg text-gray-900 hover:text-green-600 transition-colors line-clamp-2">
                    {item.products.name}
                  </h3>
                </Link>

                {/* Seller Info */}
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">
                    by {item.products.profiles?.business_name || item.products.profiles?.full_name}
                  </span>
                </div>

                {/* Expiry Date */}
                <div className="flex items-center gap-1 text-sm text-orange-600">
                  <Clock className="h-3 w-3 flex-shrink-0" />
                  <span>{formatExpiryDate(item.products.expiry_date)}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">(4.8)</span>
                </div>

                {/* Price and Actions */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-green-600">
                      {formatPrice(item.products.discounted_price)}
                    </span>
                    {item.products.original_price > item.products.discounted_price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(item.products.original_price)}
                      </span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        item.products.quantity > 10
                          ? "bg-green-500"
                          : item.products.quantity > 5
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    />
                    <span className="text-sm text-gray-600">{item.products.quantity} items left</span>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    onClick={() => addToCart(item.products.id)}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={item.products.quantity === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {item.products.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
