import { createServerClient } from "@/lib/supabase"
import { Header } from "@/components/layout/header"
import { ProductDetails } from "@/components/products/product-details"
import { notFound } from "next/navigation"

async function getProduct(id: string) {
  const supabase = createServerClient()

  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      profiles!products_seller_id_fkey(business_name, full_name, phone)
    `)
    .eq("id", id)
    .eq("is_active", true)
    .single()

  return product
}

async function getRelatedProducts(categoryId: string, currentProductId: string) {
  const supabase = createServerClient()

  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      profiles!products_seller_id_fkey(business_name, full_name)
    `)
    .eq("category", categoryId)
    .eq("is_active", true)
    .neq("id", currentProductId)
    .limit(4)

  return products || []
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)

  if (!product) {
    return {
      title: "Product Not Found",
    }
  }

  return {
    title: `${product.name} - ZeroWaste Rwanda`,
    description: product.description || `Buy ${product.name} at discounted prices`,
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.category, product.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ProductDetails product={product} relatedProducts={relatedProducts} />
    </div>
  )
}
