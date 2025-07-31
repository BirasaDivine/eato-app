import { createServerClient } from "@/lib/supabase"
import { DashboardLayout } from "@/components/dashboard/layout"
import { OrdersTable } from "@/components/dashboard/orders-table"
import { redirect } from "next/navigation"

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

async function getOrders(sellerId: string) {
  const supabase = await createServerClient()
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      profiles!orders_buyer_id_fkey(full_name, email, phone),
      order_items(
        *,
        products(name, image_urls)
      )
    `)
    // .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })

    console.log("orders", {orders})

  return orders || []
}

export default async function OrdersPage() {
  const user = await getUser()

  if (!user) {
    redirect("/")
  }

  const profile = await getUserProfile(user.id)

  if (!profile || profile.role !== "fbo") {
    redirect("/")
  }

  const orders = await getOrders(user.id)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage customer orders and fulfillment</p>
        </div>

        <OrdersTable orders={orders} />
      </div>
    </DashboardLayout>
  )
}
