import { createServerClient } from "@/lib/supabase"
import { Header } from "@/components/layout/header"
import { FavoriteItems } from "@/components/favorites/favorite-items"
import { redirect } from "next/navigation"

async function getUser() {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

async function getFavoriteItems(userId: string) {
  const supabase = createServerClient()

  const { data: favoriteItems } = await supabase
    .from("favorites")
    .select(`
      *,
      products!favorites_product_id_fkey(
        *,
        profiles!products_seller_id_fkey(business_name, full_name)
      )
    `)
    .eq("user_id", userId)

  return favoriteItems || []
}

export default async function FavoritesPage() {
  const user = await getUser()

  if (!user) {
    redirect("/")
  }

  const favoriteItems = await getFavoriteItems(user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <FavoriteItems initialFavoriteItems={favoriteItems} />
    </div>
  )
}
