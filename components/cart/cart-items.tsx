"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"
import { Minus, Plus, Trash2, ShoppingBag, Clock, MapPin } from "lucide-react"
import Image from "next/image"
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
    expiry_date: string
    image_urls: string[] | null
    category: string
    profiles: {
      business_name: string | null
      full_name: string | null
    } | null
  }
}

export function CartItems() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutData, setCheckoutData] = useState({
    deliveryAddress: "",
    phoneNumber: "",
    notes: "",
  })
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchCartItems()
  }, [])

  const fetchCartItems = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          id,
          quantity,
          products (
            id,
            name,
            discounted_price,
            original_price,
            quantity,
            expiry_date,
            image_urls,
            category,
            profiles!products_seller_id_fkey (
              business_name,
              full_name
            )
          )
        `)
        .eq("user_id", user.id)

      if (error) {
        console.error("Error fetching cart items:", error)
        toast.error("Failed to load cart items")
        return
      }

      setCartItems(data || [])
    } catch (error) {
      console.error("Error:", error)
      toast.error("An error occurred while loading cart")
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

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

  const handleCheckout = async () => {
    if (!checkoutData.deliveryAddress.trim() || !checkoutData.phoneNumber.trim()) {
      toast.error("Please fill in delivery address and phone number")
      return
    }

    setIsCheckingOut(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Please sign in to checkout")
        return
      }

      // Calculate total
      const totalAmount = cartItems.reduce((sum, item) => sum + item.products.discounted_price * item.quantity, 0)

      // Check stock availability
      for (const item of cartItems) {
        if (item.quantity > item.products.quantity) {
          toast.error(`Insufficient stock for ${item.products.name}. Only ${item.products.quantity} available.`)
          return
        }
      }

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          buyer_id: user.id,
          total_amount: totalAmount,
          delivery_address: checkoutData.deliveryAddress.trim(),
          phone_number: checkoutData.phoneNumber.trim(),
          notes: checkoutData.notes.trim() || null,
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
      const orderItems = cartItems.map((item) => ({
        order_id: orderData.id,
        product_id: item.products.id,
        seller_id: item.products.profiles?.id || user.id, // Fallback to user.id if no seller
        quantity: item.quantity,
        unit_price: item.products.discounted_price,
        total_price: item.products.discounted_price * item.quantity,
      }))

      const { error: orderItemsError } = await supabase.from("order_items").insert(orderItems)

      if (orderItemsError) {
        console.error("Order items creation error:", orderItemsError)
        // Try to clean up the order
        await supabase.from("orders").delete().eq("id", orderData.id)
        toast.error("Failed to create order items")
        return
      }

      // Clear cart
      const { error: clearCartError } = await supabase.from("cart_items").delete().eq("user_id", user.id)

      if (clearCartError) {
        console.error("Error clearing cart:", clearCartError)
        // Don't fail the checkout for this
      }

      toast.success("Order placed successfully!")
      setShowCheckoutModal(false)
      setCheckoutData({ deliveryAddress: "", phoneNumber: "", notes: "" })
      router.push("/consumer")
    } catch (error) {
      console.error("Checkout error:", error)
      toast.error("An error occurred during checkout")
    } finally {
      setIsCheckingOut(false)
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

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.products.discounted_price * item.quantity, 0)
  }

  const calculateSavings = () => {
    return cartItems.reduce(
      (sum, item) => sum + (item.products.original_price - item.products.discounted_price) * item.quantity,
      0,
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading cart...</div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Start shopping to add items to your cart</p>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <a href="/products">Browse Products</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

          {cartItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    {item.products.image_urls && item.products.image_urls.length > 0 ? (
                      <Image
                        src={item.products.image_urls[0] || "/placeholder.svg"}
                        alt={item.products.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.products.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          {item.products.profiles?.business_name || item.products.profiles?.full_name}
                          <Badge variant="secondary" className="ml-2">
                            {item.products.category}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-orange-600">
                      <Clock className="h-3 w-3" />
                      {formatExpiryDate(item.products.expiry_date)}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.products.quantity}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm text-gray-600">({item.products.quantity} available)</span>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {formatPrice(item.products.discounted_price * item.quantity)}
                        </div>
                        <div className="text-sm text-gray-500 line-through">
                          {formatPrice(item.products.original_price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>{formatPrice(calculateTotal())}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>You save</span>
                  <span>-{formatPrice(calculateSavings())}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>
                </div>
              </div>

              <Dialog open={showCheckoutModal} onOpenChange={setShowCheckoutModal}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                    Proceed to Checkout
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Checkout Details</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                      <Textarea
                        id="deliveryAddress"
                        placeholder="Enter your full delivery address"
                        value={checkoutData.deliveryAddress}
                        onChange={(e) => setCheckoutData((prev) => ({ ...prev, deliveryAddress: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={checkoutData.phoneNumber}
                        onChange={(e) => setCheckoutData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Special Instructions (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any special instructions for the seller"
                        value={checkoutData.notes}
                        onChange={(e) => setCheckoutData((prev) => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between font-bold text-lg mb-4">
                        <span>Total Amount</span>
                        <span>{formatPrice(calculateTotal())}</span>
                      </div>
                      <Button
                        onClick={handleCheckout}
                        disabled={isCheckingOut}
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="lg"
                      >
                        {isCheckingOut ? "Processing..." : "Place Order"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="text-sm text-gray-600 space-y-1">
                <p>• Free pickup from local businesses</p>
                <p>• Help reduce food waste</p>
                <p>• Quality guaranteed</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
