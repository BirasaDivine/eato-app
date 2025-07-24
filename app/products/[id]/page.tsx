"use client"
import { createServerClient } from "@/lib/supabase"
import { Header } from "@/components/layout/header"
import { ProductDetails } from "@/components/products/product-details"
import { notFound } from "next/navigation"

type Product = {
  id: string
  name: string
  description: string | null
  category: string
  original_price: number
  discounted_price: number
  quantity: number
  expiry_date: string
  image_urls: string[] | null
  seller_id: string
  profiles: {
    business_name: string | null
    full_name: string | null
    business_address: string | null
    phone: string | null
  }
}

async function getProduct(id: string) {
  const supabase = createServerClient()

  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      profiles!products_seller_id_fkey(business_name, full_name, phone, business_address)
    `)
    .eq("id", id)
    .eq("is_active", true)
    .single()

  return product
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ProductDetails product={product} />
    </div>
  )
}
