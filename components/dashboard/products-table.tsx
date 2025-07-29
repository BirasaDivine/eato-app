"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase.client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash, Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Product {
  id: string
  name: string
  description: string | null
  category: string
  original_price: number
  discounted_price: number
  quantity: number
  expiry_date: string
  image_urls: string[] | null
  is_active: boolean
  created_at: string
}

interface ProductsTableProps {
  products: Product[]
}

export function ProductsTable({ products }: ProductsTableProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-RW")
  }

  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    setLoading(productId)
    try {
      const { error } = await supabase.from("products").update({ is_active: !currentStatus }).eq("id", productId)

      if (error) throw error

      toast.success(`Product ${!currentStatus ? "activated" : "deactivated"} successfully`)
      router.refresh()
    } catch (error) {
      toast.error("Failed to update product status")
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    setLoading(productId)
    try {
      const { error } = await supabase.from("products").delete().eq("id", productId)

      if (error) throw error

      toast.success("Product deleted successfully")
      router.refresh()
    } catch (error) {
      toast.error("Failed to delete product")
    } finally {
      setLoading(null)
    }
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found.</p>
          <p className="text-gray-400 text-sm mt-2">Start by adding your first product.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Products ({products.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {product.image_urls && product.image_urls.length > 0 ? (
                        <Image
                          src={product.image_urls[0] || "/placeholder.svg"}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                          <span className="text-xs text-gray-400">No img</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500 truncate max-w-[200px]">{product.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-green-600">{formatPrice(product.discounted_price)}</p>
                      <p className="text-sm text-gray-500 line-through">{formatPrice(product.original_price)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={product.quantity > 0 ? "text-green-600" : "text-red-600"}>{product.quantity}</span>
                  </TableCell>
                  <TableCell>{formatDate(product.expiry_date)}</TableCell>
                  <TableCell>
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(product.id, product.is_active)}
                        disabled={loading === product.id}
                      >
                        {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/products/${product.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        disabled={loading === product.id}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
