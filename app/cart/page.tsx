import { createServerClient } from "@/lib/supabase"
import { Header } from "@/components/layout/header"
import { CartItems } from "@/components/cart/cart-items"
import { redirect } from "next/navigation"

async function getUser() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

async function getCartItems(userId: string) {
  const supabase = await createServerClient()

  const { data: cartItems } = await supabase
    .from("cart_items")
    .select(`
      *,
      products!cart_items_product_id_fkey(
        *,
        profiles!products_seller_id_fkey(business_name, full_name)
      )
    `)
    .eq("user_id", userId)

  return cartItems || []
}

export default async function CartPage() {
  const user = await getUser()

  if (!user) {
    redirect("/")
  }

  const cartItems = await getCartItems(user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CartItems initialCartItems={cartItems} />
    </div>
  )
}
