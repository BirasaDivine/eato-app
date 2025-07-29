import { createServerClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Package, DollarSign, Clock, MapPin, User } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

async function getProfile() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "consumer") {
    redirect("/")
  }

  return profile
}

async function getOrderStats(userId: string) {
  const supabase = await createServerClient()

  const { data: orders } = await supabase.from("orders").select("id, total_amount, status").eq("buyer_id", userId)

  const totalOrders = orders?.length || 0
  const activeOrders =
    orders?.filter((order) => ["pending", "confirmed", "preparing", "ready"].includes(order.status)).length || 0
  const totalSpent = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0

  return { totalOrders, activeOrders, totalSpent }
}

async function getRecentOrders(userId: string) {
  const supabase = await createServerClient()

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id,
      total_amount,
      status,
      delivery_address,
      phone_number,
      created_at,
      order_items (
        id,
        quantity,
        unit_price,
        products (
          name,
          image_urls,
          profiles!products_seller_id_fkey (
            business_name,
            full_name
          )
        )
      )
    `)
    .eq("buyer_id", userId)
    .order("created_at", { ascending: false })
    .limit(10)

  return orders || []
}

export default async function ConsumerDashboard() {
  const profile = await getProfile()
  const { totalOrders, activeOrders, totalSpent } = await getOrderStats(profile.id)
  const recentOrders = await getRecentOrders(profile.id)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "preparing":
        return "bg-purple-100 text-purple-800"
      case "ready":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <User className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {profile.full_name}!</h1>
          </div>
          <p className="text-gray-600">Manage your orders and discover great deals on quality food.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">All time orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeOrders}</div>
              <p className="text-xs text-muted-foreground">Pending & in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(totalSpent)}</div>
              <p className="text-xs text-muted-foreground">All time spending</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-2">Browse Products</h3>
              <p className="mb-4 opacity-90">Discover fresh food at amazing discounts</p>
              <Button asChild variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                <Link href="/products">Shop Now</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-2">View Cart</h3>
              <p className="mb-4 opacity-90">Check your cart and proceed to checkout</p>
              <Button asChild variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100">
                <Link href="/cart">View Cart</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your order history and current status</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No orders yet</p>
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <Link href="/products">Start Shopping</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">Order #{order.id.slice(0, 8)}</span>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(order.created_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {order.delivery_address.slice(0, 50)}...
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{formatPrice(Number(order.total_amount))}</div>
                        <div className="text-sm text-gray-600">{order.order_items.length} items</div>
                      </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto">
                      {order.order_items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex-shrink-0 text-sm">
                          <span className="font-medium">{item.quantity}x</span> {item.products.name}
                          <span className="text-gray-600 ml-1">
                            from {item.products.profiles?.business_name || item.products.profiles?.full_name}
                          </span>
                        </div>
                      ))}
                      {order.order_items.length > 3 && (
                        <span className="text-sm text-gray-600">+{order.order_items.length - 3} more items</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
