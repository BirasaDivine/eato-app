"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Star, Clock, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  category: string
  original_price: number
  discounted_price: number
  quantity: number
  expiry_date?: string
  image_urls?: string[]
  profiles?: {
    business_name?: string
    full_name?: string
  }
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
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

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

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

  const getStockStatus = (quantity: number) => {
    if (quantity > 20) return { color: "bg-green-500", level: "high" }
    if (quantity > 5) return { color: "bg-yellow-500", level: "medium" }
    return { color: "bg-red-500", level: "low" }
  }

  const stockStatus = getStockStatus(product.quantity)

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden relative">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative">
          <Image
            src={product.image_urls?.[0] || "/placeholder.svg?height=240&width=300&query=organic food"}
            alt={product.name}
            width={300}
            height={240}
            className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Discount Badge */}
          {product.original_price > product.discounted_price && (
            <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-500 text-white">
              -{calculateDiscount(product.original_price, product.discounted_price)}%
            </Badge>
          )}

          {/* Fresh Badge */}
          <Badge className="absolute top-3 right-3 bg-green-600 hover:bg-green-600 text-white">Fresh</Badge>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Category */}
            <Badge variant="outline" className="text-xs capitalize">
              {product.category}
            </Badge>

            {/* Product Name */}
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
              {product.name}
            </h3>

            {/* Seller Info */}
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">by {product.profiles?.business_name || product.profiles?.full_name}</span>
            </div>

            {/* Expiry Date */}
            {product.expiry_date && (
              <div className="flex items-center gap-1 text-sm text-orange-600">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span>{formatExpiryDate(product.expiry_date)}</span>
              </div>
            )}

            {/* Price and Rating */}
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-green-600">{formatPrice(product.discounted_price)}</span>
                  {product.original_price > product.discounted_price && (
                    <span className="text-sm text-gray-500 line-through">{formatPrice(product.original_price)}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">(4.8)</span>
                </div>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${stockStatus.color}`}></div>
                <span className="text-sm text-gray-600 whitespace-nowrap">{product.quantity} items left</span>
              </div>

              {/* Low Stock Badge */}
              {product.quantity <= 5 && (
                <Badge variant="destructive" className="text-xs ml-2 flex-shrink-0">
                  Low Stock
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Link>

      {/* Heart Button - Outside Link to prevent navigation */}
      <div className="absolute top-3 right-12 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="secondary"
          className={`w-8 h-8 p-0 rounded-full ${
            isFavorite ? "bg-red-50 hover:bg-red-100 text-red-500" : "bg-white/90 hover:bg-white text-gray-600"
          }`}
          onClick={toggleFavorite}
          disabled={isLoading}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
        </Button>
      </div>
    </Card>
  )
}
