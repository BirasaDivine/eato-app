import { createServerClient } from "@/lib/supabase"
import { DashboardLayout } from "@/components/dashboard/layout"
import { ProductForm } from "@/components/dashboard/product-form"
import { redirect, notFound } from "next/navigation"

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

async function getProduct(productId: string, sellerId: string) {
  const supabase = await createServerClient()
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("seller_id", sellerId)
    .single()

  return product
}

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const user = await getUser()

  if (!user) {
    redirect("/")
  }

  const profile = await getUserProfile(user.id)

  if (!profile || profile.role !== "fbo") {
    redirect("/")
  }

  const product = await getProduct(params.id, user.id)

  if (!product) {
    notFound()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600">Update your product information</p>
        </div>

        <ProductForm sellerId={user.id} product={product} />
      </div>
    </DashboardLayout>
  )
}
