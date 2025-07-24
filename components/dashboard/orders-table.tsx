"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Eye, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Order {
  id: string
  buyer_id: string
  total_amount: number
  status: "pending" | "confirmed" | "ready" | "completed" | "cancelled"
  pickup_time: string | null
  notes: string | null
  created_at: string
  profiles: {
    full_name: string | null
    email: string
    phone: string | null
  } | null
  order_items: Array<{
    id: string
    quantity: number
    unit_price: number
    total_price: number
    products: {
      name: string
      image_urls: string[] | null
    } | null
  }>
}

interface OrdersTableProps {
  orders: Order[]
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-RW", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "ready":
        return "bg-purple-100 text-purple-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleFulfillOrder = async (orderId: string, orderItems: Order["order_items"]) => {
    setLoading(orderId)
    try {
      // Get the full order with product IDs
      const { data: fullOrder } = await supabase
        .from("orders")
        .select(`
        *,
        order_items(
          *,
          product_id
        )
      `)
        .eq("id", orderId)
        .single()

      if (!fullOrder) throw new Error("Order not found")

      // Check if we have enough stock for all items
      for (const item of fullOrder.order_items) {
        const { data: product } = await supabase
          .from("products")
          .select("quantity, name")
          .eq("id", item.product_id)
          .single()

        if (product && product.quantity < item.quantity) {
          toast.error(`Insufficient stock for ${product.name}`)
          return
        }
      }

      // Update order status
      const { error: orderError } = await supabase.from("orders").update({ status: "completed" }).eq("id", orderId)

      if (orderError) throw orderError

      // Update product quantities
      for (const item of fullOrder.order_items) {
        const { error: productError } = await supabase.rpc("decrease_product_quantity", {
          product_id: item.product_id,
          decrease_by: item.quantity,
        })

        if (productError) throw productError
      }

      toast.success("Order fulfilled successfully")
      router.refresh()
    } catch (error) {
      console.error("Fulfillment error:", error)
      toast.error("Failed to fulfill order")
    } finally {
      setLoading(null)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return

    setLoading(orderId)
    try {
      const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId)

      if (error) throw error

      toast.success("Order cancelled successfully")
      router.refresh()
    } catch (error) {
      toast.error("Failed to cancel order")
    } finally {
      setLoading(null)
    }
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500 text-lg">No orders found.</p>
          <p className="text-gray-400 text-sm mt-2">Orders will appear here when customers make purchases.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Orders ({orders.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.profiles?.full_name}</p>
                      <p className="text-sm text-gray-500">{order.profiles?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {order.order_items.slice(0, 2).map((item, index) => (
                        <p key={index} className="text-sm">
                          {item.quantity}x {item.products?.name}
                        </p>
                      ))}
                      {order.order_items.length > 2 && (
                        <p className="text-sm text-gray-500">+{order.order_items.length - 2} more items</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{formatPrice(order.total_amount)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Order Details</DialogTitle>
                            <DialogDescription>
                              Order #{order.id.slice(0, 8)}... - {formatDate(order.created_at)}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Customer Information</h4>
                              <p>{order.profiles?.full_name}</p>
                              <p className="text-sm text-gray-600">{order.profiles?.email}</p>
                              {order.profiles?.phone && <p className="text-sm text-gray-600">{order.profiles.phone}</p>}
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Order Items</h4>
                              <div className="space-y-2">
                                {order.order_items.map((item, index) => (
                                  <div key={index} className="flex justify-between">
                                    <span>
                                      {item.quantity}x {item.products?.name}
                                    </span>
                                    <span>{formatPrice(item.total_price)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="border-t pt-2">
                              <div className="flex justify-between font-medium">
                                <span>Total</span>
                                <span>{formatPrice(order.total_amount)}</span>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {order.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFulfillOrder(order.id, order.order_items)}
                            disabled={loading === order.id}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={loading === order.id}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
