"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, MapPin, ShoppingCart, Trash } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

interface CartItem {
  id: string
  quantity: number
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

interface CartItemsProps {
  cartItems: CartItem[]
}

export function CartItems({ cartItems }: CartItemsProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
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

  const handleRemoveFromCart = async (cartItemId: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId)

      if (error) throw error

      toast.success("Removed from cart successfully!")
      router.refresh()
    } catch (error) {
      toast.error("Failed to remove from cart")
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + item.products.discounted_price * item.quantity
    }, 0)
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">Your cart is empty.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Shopping Cart</h1>

      <div className="grid gap-6">
        {cartItems.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{item.products.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {item.products.profiles?.business_name || item.products.profiles?.full_name}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveFromCart(item.id)} disabled={loading}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                <div className="md:col-span-1">
                  {item.products.image_urls && item.products.image_urls.length > 0 ? (
                    <Image
                      src={item.products.image_urls[0] || "/placeholder.svg"}
                      alt={item.products.name}
                      width={200}
                      height={150}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 rounded-md flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-green-600">
                        {formatPrice(item.products.discounted_price)}
                      </span>
                      <span className="text-sm text-gray-500 line-through ml-2">
                        {formatPrice(item.products.original_price)}
                      </span>
                    </div>
                    <Badge className="bg-red-500">
                      {calculateDiscount(item.products.original_price, item.products.discounted_price)}% OFF
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-orange-600">
                    <Clock className="h-3 w-3" />
                    {formatExpiryDate(item.products.expiry_date)}
                  </div>

                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator className="my-6" />

      <div className="flex justify-between items-center">
        <div className="text-xl font-semibold">Total: {formatPrice(calculateTotal())}</div>
        <Button className="bg-green-600 hover:bg-green-700" disabled={loading}>
          Checkout
        </Button>
      </div>
    </div>
  )
}
