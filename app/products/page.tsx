import { createServerClient } from "@/lib/supabase"
import { Header } from "@/components/layout/header"
import { ProductGrid } from "@/components/products/product-grid"
import { ProductFilters } from "@/components/products/product-filters"

interface SearchParams {
  category?: string
  search?: string
  sort?: string
}

async function getProducts(searchParams: SearchParams) {
  const supabase = createServerClient()

  let query = supabase
    .from("products")
    .select(`
      *,
      profiles!products_seller_id_fkey(business_name, full_name)
    `)
    .eq("is_active", true)
    .gte("expiry_date", new Date().toISOString().split("T")[0])

  if (searchParams.category) {
    query = query.eq("category", searchParams.category)
  }

  if (searchParams.search) {
    query = query.ilike("name", `%${searchParams.search}%`)
  }

  // Sort options
  switch (searchParams.sort) {
    case "price_low":
      query = query.order("discounted_price", { ascending: true })
      break
    case "price_high":
      query = query.order("discounted_price", { ascending: false })
      break
    case "expiry":
      query = query.order("expiry_date", { ascending: true })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  const { data: products } = await query

  return products || []
}

async function getCategories() {
  const supabase = createServerClient()

  const { data } = await supabase
    .from("products")
    .select("category")
    .eq("is_active", true)
    .gte("expiry_date", new Date().toISOString().split("T")[0])

  const categories = [...new Set(data?.map((p) => p.category) || [])]
  return categories
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const products = await getProducts(searchParams)
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64">
            <ProductFilters categories={categories} />
          </aside>

          <main className="flex-1">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Available Products</h1>
              <p className="text-gray-600">{products.length} products found</p>
            </div>

            <ProductGrid products={products} />
          </main>
        </div>
      </div>
    </div>
  )
}
