"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"

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

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Check if product is in favorites
        const { data } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("product_id", product.id)
          .single()

        setIsFavorite(!!data)
      }
    }

    getUser()
  }, [product.id])

  const handleFavoriteToggle = async () => {
    if (!user) {
      toast.error("Please sign in to add favorites")
      return
    }

    setIsLoading(true)

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("product_id", product.id)

        if (error) throw error

        setIsFavorite(false)
        toast.success("Removed from favorites")
      } else {
        // Add to favorites
        const { error } = await supabase.from("favorites").insert({
          user_id: user.id,
          product_id: product.id,
        })

        if (error) throw error

        setIsFavorite(true)
        toast.success("Added to favorites")
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast.error("Failed to update favorites")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please sign in to add items to cart")
      return
    }

    setIsLoading(true)

    try {
      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .single()

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id)

        if (error) throw error
      } else {
        // Add new item
        const { error } = await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: product.id,
          quantity: 1,
        })

        if (error) throw error
      }

      toast.success("Added to cart")
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Failed to add to cart")
    } finally {
      setIsLoading(false)
    }
  }

  const getStockStatus = () => {
    if (product.quantity === 0) {
      return { text: "Out of stock", color: "bg-red-500", textColor: "text-red-600" }
    } else if (product.quantity <= 5) {
      return { text: `${product.quantity} left`, color: "bg-orange-500", textColor: "text-orange-600" }
    } else {
      return { text: "In stock", color: "bg-green-500", textColor: "text-green-600" }
    }
  }

  const stockStatus = getStockStatus()

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.image_url || "/placeholder.svg?height=300&width=300"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute top-2 left-2">
            <div className={`w-2 h-2 rounded-full ${stockStatus.color}`}></div>
          </div>
          <div className="absolute top-2 right-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
              onClick={(e) => {
                e.preventDefault()
                handleFavoriteToggle()
              }}
              disabled={isLoading}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </Button>
          </div>
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/products/${product.id}`}>
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-green-600 transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-600">4.5</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xl font-bold text-green-600">RWF {product.price.toLocaleString()}</span>
                <p className="text-xs text-gray-500">
                  by {product.profiles.business_name || product.profiles.full_name}
                </p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className={`text-xs ${stockStatus.textColor} border-current`}>
                  {stockStatus.text}
                </Badge>
              </div>
            </div>
          </div>
        </Link>

        <div className="mt-4 flex gap-2">
          <Button
            onClick={handleAddToCart}
            disabled={product.quantity === 0 || isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
