"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase.client"
import { toast } from "sonner"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface CartItem {
  id: string
  quantity: number
  products: {
    id: string
    name: string
    discounted_price: number
    original_price: number
    quantity: number
    image_urls: string[] | null
    category: string
    seller_id: string
    profiles: {
      business_name: string | null
      full_name: string | null
    } | null
  }
}

interface CartItemsProps {
  initialCartItems: CartItem[]
}

export function CartItems({ initialCartItems }: CartItemsProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems)
  const [isLoading, setIsLoading] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [notes, setNotes] = useState("")

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setCartItems(initialCartItems)
  }, [initialCartItems])

  const updateQuantity = async (itemId: string, newQuantity: number, maxQuantity: number) => {
    if (newQuantity < 1 || newQuantity > maxQuantity) return

    try {
      const { error } = await supabase.from("cart_items").update({ quantity: newQuantity }).eq("id", itemId)

      if (error) {
        toast.error("Failed to update quantity")
        return
      }

      setCartItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))
    } catch (error) {
      console.error("Error updating quantity:", error)
      toast.error("An error occurred")
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase.from("cart_items").delete().eq("id", itemId)

      if (error) {
        toast.error("Failed to remove item")
        return
      }

      setCartItems((prev) => prev.filter((item) => item.id !== itemId))
      toast.success("Item removed from cart")
    } catch (error) {
      console.error("Error removing item:", error)
      toast.error("An error occurred")
    }
  }

  const checkout = async () => {
    if (!deliveryAddress.trim() || !phoneNumber.trim()) {
      toast.error("Please fill in delivery address and phone number")
      return
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    try {
      setIsLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Please sign in to checkout")
        return
      }

      // Group items by seller
      const itemsBySeller = cartItems.reduce(
        (acc, item) => {
          const sellerId = item.products.seller_id
          if (!acc[sellerId]) {
            acc[sellerId] = []
          }
          acc[sellerId].push(item)
          return acc
        },
        {} as Record<string, CartItem[]>,
      )

      // Create orders for each seller
      for (const [sellerId, items] of Object.entries(itemsBySeller)) {
        const totalAmount = items.reduce((sum, item) => sum + item.products.discounted_price * item.quantity, 0)

        // Create order
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            buyer_id: user.id,
            seller_id: sellerId,
            total_amount: totalAmount,
            delivery_address: deliveryAddress.trim(),
            phone_number: phoneNumber.trim(),
            notes: notes.trim() || null,
            status: "pending",
          })
          .select()
          .single()

        if (orderError) {
          console.error("Order creation error:", orderError)
          toast.error("Failed to create order")
          return
        }

        // Create order items
        const orderItems = items.map((item) => ({
          order_id: order.id,
          product_id: item.products.id,
          quantity: item.quantity,
          unit_price: item.products.discounted_price,
          total_price: item.products.discounted_price * item.quantity,
        }))

        const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

        if (itemsError) {
          console.error("Order items creation error:", itemsError)
          toast.error("Failed to create order items")
          return
        }

        // Update product quantities
        for (const item of items) {
          const { error: updateError } = await supabase.rpc("decrease_product_quantity", {
            product_id: item.products.id,
            quantity_to_decrease: item.quantity,
          })

          if (updateError) {
            console.error("Product quantity update error:", updateError)
            toast.error("Failed to update product quantity")
            return
          }
        }
      }

      // Clear cart
      const { error: clearError } = await supabase.from("cart_items").delete().eq("user_id", user.id)

      if (clearError) {
        console.error("Cart clearing error:", clearError)
        toast.error("Failed to clear cart")
        return
      }

      toast.success("Order placed successfully!")
      router.push("/consumer")
    } catch (error) {
      console.error("Checkout error:", error)
      toast.error("An error occurred during checkout")
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

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.products.discounted_price * item.quantity, 0)
  }

  const calculateSavings = () => {
    return cartItems.reduce(
      (sum, item) => sum + (item.products.original_price - item.products.discounted_price) * item.quantity,
      0,
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Add some delicious items to get started</p>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Link href={`/products/${item.products.id}`}>
                    <Image
                      src={item.products.image_urls?.[0] || "/placeholder.svg?height=100&width=100&query=organic food"}
                      alt={item.products.name}
                      width={100}
                      height={100}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </Link>

                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link href={`/products/${item.products.id}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-green-600">{item.products.name}</h3>
                        </Link>
                        <Badge variant="outline" className="text-xs capitalize mt-1">
                          {item.products.category}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          by {item.products.profiles?.business_name || item.products.profiles?.full_name}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-green-600">{formatPrice(item.products.discounted_price)}</span>
                        {item.products.original_price > item.products.discounted_price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(item.products.original_price)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center border rounded-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.products.quantity)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="px-3 py-1 font-medium">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.products.quantity)}
                          disabled={item.quantity >= item.products.quantity}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      Subtotal: {formatPrice(item.products.discounted_price * item.quantity)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
              {calculateSavings() > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>You Save</span>
                  <span>-{formatPrice(calculateSavings())}</span>
                </div>
              )}
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(calculateTotal())}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Delivery Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your full delivery address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="notes">Special Instructions</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special instructions for delivery"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button onClick={checkout} disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700">
                {isLoading ? "Processing..." : "Place Order"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
