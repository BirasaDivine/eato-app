import { createServerClient } from "@/lib/supabase"
import { DashboardLayout } from "@/components/dashboard/layout"
import { ProductsTable } from "@/components/dashboard/products-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

async function getUser() {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

async function getUserProfile(userId: string) {
  const supabase = createServerClient()
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()
  return profile
}

async function getProducts(sellerId: string) {
  const supabase = createServerClient()
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })

  return products || []
}

export default async function ProductsPage() {
  const user = await getUser()

  if (!user) {
    redirect("/")
  }

  const profile = await getUserProfile(user.id)

  if (!profile || profile.role !== "fbo") {
    redirect("/")
  }

  const products = await getProducts(user.id)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600">Manage your product listings</p>
          </div>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/dashboard/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>

        <ProductsTable products={products} />
      </div>
    </DashboardLayout>
  )
}
