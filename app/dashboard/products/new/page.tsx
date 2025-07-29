import { createServerClient } from "@/lib/supabase"
import { DashboardLayout } from "@/components/dashboard/layout"
import { ProductForm } from "@/components/dashboard/product-form"
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

export default async function NewProductPage() {
  const user = await getUser()

  if (!user) {
    redirect("/")
  }

  const profile = await getUserProfile(user.id)

  if (!profile || profile.role !== "fbo") {
    redirect("/")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600">Create a new product listing for your business</p>
        </div>

        <ProductForm sellerId={user.id} />
      </div>
    </DashboardLayout>
  )
}
