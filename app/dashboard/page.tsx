import { createServerClient } from "@/lib/supabase"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, TrendingUp, Users } from "lucide-react"
import { redirect } from "next/navigation"
import Link from "next/link"

async function getUser() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

async function getUserProfile(userId: string) {
  const supabase = await createServerClient()
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()
  return profile
}

async function getDashboardStats(sellerId: string) {
  const supabase = await createServerClient()

  // Get products count
  const { count: productsCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", sellerId)
    .eq("is_active", true)

  // Get orders count
  const { count: ordersCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", sellerId)

  // Get total revenue
  const { data: orders } = await supabase
    .from("orders")
    .select("total_amount")
    .eq("seller_id", sellerId)
    .eq("status", "completed")

  const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0

  // Get pending orders count
  const { count: pendingOrdersCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", sellerId)
    .eq("status", "pending")

  return {
    productsCount: productsCount || 0,
    ordersCount: ordersCount || 0,
    totalRevenue,
    pendingOrdersCount: pendingOrdersCount || 0,
  }
}

export default async function DashboardPage() {
  const user = await getUser()

  if (!user) {
    redirect("/")
  }

  const profile = await getUserProfile(user.id)

  if (!profile || profile.role !== "fbo") {
    redirect("/")
  }

  const stats = await getDashboardStats(user.id)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "FRW",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back, {profile.business_name || profile.full_name}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.productsCount}</div>
              <p className="text-xs text-muted-foreground">Products currently listed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ordersCount}</div>
              <p className="text-xs text-muted-foreground">All time orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">From completed orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrdersCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting fulfillment</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to manage your business</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/products">
              <Card className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Package className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-medium">Add New Product</h3>
                    <p className="text-sm text-gray-600">List a new product for sale</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/dashboard/orders">
              <Card className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <ShoppingCart className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-medium">View Orders</h3>
                    <p className="text-sm text-gray-600">Check pending orders</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/dashboard/profile">
              <Card className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div>
                    <h3 className="font-medium">Update Profile</h3>
                    <p className="text-sm text-gray-600">Edit business information</p>
                  </div>
                </div>
              </Card>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
