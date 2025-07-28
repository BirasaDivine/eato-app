"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Clock, MapPin, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface FavoriteItem {
  id: string
  product_id: string
  products: {
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
}

interface FavoriteItemsProps {
  initialFavoriteItems: FavoriteItem[]
}

export function FavoriteItems({ initialFavoriteItems }: FavoriteItemsProps) {
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>(initialFavoriteItems)
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const router = useRouter()
  const supabase = createClient()

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

  const removeFromFavorites = async (favoriteId: string) => {
    try {
      setIsLoading((prev) => ({ ...prev, [favoriteId]: true }))

      const { error } = await supabase.from("favorites").delete().eq("id", favoriteId)

      if (error) {
        console.error("Error removing from favorites:", error)
        toast.error(`Failed to remove from favorites: ${error.message}`)
        return
      }

      setFavoriteItems((prev) => prev.filter((item) => item.id !== favoriteId))
      toast.success("Removed from favorites")
      router.refresh()
    } catch (error: any) {
      console.error("Error removing from favorites:", error)
      toast.error(`An error occurred: ${error.message || "Unknown error"}`)
    } finally {
      setIsLoading((prev) => ({ ...prev, [favoriteId]: false }))
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

      setIsLoading((prev) => ({ ...prev, [productId]: true }))

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .single()

      const product = favoriteItems.find((item) => item.product_id === productId)?.products
      if (!product) return

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + 1
        if (newQuantity > product.quantity) {
          toast.error("Not enough stock available")
          return
        }

        const { error } = await supabase.from("cart_items").update({ quantity: newQuantity }).eq("id", existingItem.id)

        if (error) {
          console.error("Error updating cart:", error)
          toast.error(`Failed to update cart: ${error.message}`)
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
          console.error("Error adding to cart:", error)
          toast.error(`Failed to add to cart: ${error.message}`)
          return
        }
      }

      toast.success("Added to cart")
      router.refresh()
    } catch (error: any) {
      console.error("Error adding to cart:", error)
      toast.error(`An error occurred: ${error.message || "Unknown error"}`)
    } finally {
      setIsLoading((prev) => ({ ...prev, [productId]: false }))
    }
  }

  if (favoriteItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="mb-6 flex justify-center">
            <Heart className="h-16 w-16 text-gray-300" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Your favorites list is empty</h1>
          <p className="text-gray-600 mb-8">Start adding products to your favorites to keep track of items you love.</p>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Favorites</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favoriteItems.map((item) => {
          const product = item.products
          if (!product) return null

          return (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <Link href={`/products/${product.id}`}>
                  <div className="aspect-square overflow-hidden">
                    <Image
                      src={product.image_urls?.[0] || "/placeholder.svg?height=300&width=300&query=organic food"}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>

                {/* Discount Badge */}
                {product.original_price > product.discounted_price && (
                  <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-500 text-white">
                    -{calculateDiscount(product.original_price, product.discounted_price)}%
                  </Badge>
                )}

                {/* Remove Button */}
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-3 right-3 w-8 h-8 p-0 rounded-full bg-white/90 hover:bg-white text-red-500"
                  onClick={() => removeFromFavorites(item.id)}
                  disabled={isLoading[item.id]}
                >
                  <Heart className="h-4 w-4 fill-current" />
                </Button>
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Category */}
                  <Badge variant="outline" className="text-xs capitalize">
                    {product.category}
                  </Badge>

                  {/* Product Name */}
                  <Link href={`/products/${product.id}`} className="block">
                    <h3 className="font-semibold text-lg text-gray-900 hover:text-green-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Seller Info */}
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">
                      by {product.profiles?.business_name || product.profiles?.full_name}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">(4.8)</span>
                  </div>

                  {/* Expiry Date */}
                  <div className="flex items-center gap-1 text-sm text-orange-600">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <span>{formatExpiryDate(product.expiry_date)}</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-green-600">
                          {formatPrice(product.discounted_price)}
                        </span>
                        {product.original_price > product.discounted_price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div>
                      <Badge
                        variant={product.quantity > 5 ? "outline" : "destructive"}
                        className="text-xs whitespace-nowrap"
                      >
                        {product.quantity} left
                      </Badge>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => addToCart(product.id)}
                    disabled={isLoading[product.id] || product.quantity === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
