"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase.client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Product {
  id: string
  name: string
  description: string | null
  category: "bakery" | "vegetables" | "dairy" | "meat" | "fruits" | "beverages" | "other"
  original_price: number
  discounted_price: number
  quantity: number
  expiry_date: string
  image_urls: string[] | null
  is_active: boolean
}

interface ProductFormProps {
  sellerId: string
  product?: Product
}

export function ProductForm({ sellerId, product }: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>(product?.image_urls || [])
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    category: product?.category || ("bakery" as const),
    original_price: product?.original_price?.toString() || "",
    discounted_price: product?.discounted_price?.toString() || "",
    quantity: product?.quantity?.toString() || "",
    expiry_date: product?.expiry_date || "",
    is_active: product?.is_active ?? true,
  })

  const router = useRouter()
  const supabase = createClient()

  const categories = [
    { value: "bakery", label: "Bakery" },
    { value: "vegetables", label: "Vegetables" },
    { value: "dairy", label: "Dairy" },
    { value: "meat", label: "Meat" },
    { value: "fruits", label: "Fruits" },
    { value: "beverages", label: "Beverages" },
    { value: "other", label: "Other" },
  ]

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploadingImages(true)
    const newImageUrls: string[] = []

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image file`)
          continue
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum size is 5MB`)
          continue
        }

        // Generate unique filename
        const fileExt = file.name.split(".").pop()
        const fileName = `${sellerId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage.from("product-images").upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        })

        if (error) {
          console.error("Upload error:", error)
          toast.error(`Failed to upload ${file.name}`)
          continue
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(data.path)

        newImageUrls.push(publicUrl)
      }

      if (newImageUrls.length > 0) {
        setImageUrls([...imageUrls, ...newImageUrls])
        toast.success(`${newImageUrls.length} image(s) uploaded successfully`)
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload images")
    } finally {
      setUploadingImages(false)
      // Reset the input
      event.target.value = ""
    }
  }

  const handleImageUrlAdd = () => {
    const url = prompt("Enter image URL:")
    if (url && url.trim()) {
      setImageUrls([...imageUrls, url.trim()])
    }
  }

  const handleImageUrlRemove = async (index: number, url: string) => {
    // If it's a Supabase storage URL, delete from storage
    if (url.includes("supabase") && url.includes("product-images")) {
      try {
        const urlParts = url.split("/")
        const fileName = urlParts[urlParts.length - 1]
        const filePath = `${sellerId}/${fileName}`

        const { error } = await supabase.storage.from("product-images").remove([filePath])

        if (error) {
          console.error("Delete error:", error)
          toast.error("Failed to delete image from storage")
          return
        }
      } catch (error) {
        console.error("Delete error:", error)
      }
    }

    setImageUrls(imageUrls.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const originalPrice = Number.parseFloat(formData.original_price)
    const discountedPrice = Number.parseFloat(formData.discounted_price)
    const quantity = Number.parseInt(formData.quantity)

    // Validation
    if (isNaN(originalPrice) || originalPrice <= 0) {
      toast.error("Please enter a valid original price")
      return
    }

    if (isNaN(discountedPrice) || discountedPrice <= 0) {
      toast.error("Please enter a valid discounted price")
      return
    }

    if (isNaN(quantity) || quantity < 0) {
      toast.error("Please enter a valid quantity")
      return
    }

    if (discountedPrice >= originalPrice) {
      toast.error("Discounted price must be less than original price")
      return
    }

    if (new Date(formData.expiry_date) <= new Date()) {
      toast.error("Expiry date must be in the future")
      return
    }

    setLoading(true)

    try {
      const productData = {
        seller_id: sellerId,
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        original_price: originalPrice,
        discounted_price: discountedPrice,
        quantity: quantity,
        expiry_date: formData.expiry_date,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        is_active: formData.is_active,
      }

      if (product) {
        // Update existing product
        const { error } = await supabase.from("products").update(productData).eq("id", product.id)

        if (error) throw error

        toast.success("Product updated successfully")
      } else {
        // Create new product
        const { error } = await supabase.from("products").insert([productData])

        if (error) throw error

        toast.success("Product created successfully")
      }

      router.push("/dashboard/products")
    } catch (error) {
      console.error("Error saving product:", error)
      toast.error("Failed to save product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{product ? "Edit Product" : "Add New Product"}</CardTitle>
          <CardDescription>
            {product ? "Update your product information" : "Fill in the details for your new product listing"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Fresh Bread Loaves"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your product..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="original_price">Original Price (RWF) *</Label>
                <Input
                  id="original_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.original_price}
                  onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="discounted_price">Discounted Price (RWF) *</Label>
                <Input
                  id="discounted_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discounted_price}
                  onChange={(e) => setFormData({ ...formData, discounted_price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Inventory & Expiry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <Label htmlFor="expiry_date">Expiry Date *</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Product Images</Label>
                <div className="flex gap-2">
                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadingImages}
                    />
                    <Button type="button" variant="outline" size="sm" disabled={uploadingImages}>
                      {uploadingImages ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Images
                        </>
                      )}
                    </Button>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={handleImageUrlAdd}>
                    Add URL
                  </Button>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Upload images (max 5MB each) or add image URLs. Supported formats: JPG, PNG, GIF, WebP
              </p>

              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={url || "/placeholder.svg"}
                        alt={`Product image ${index + 1}`}
                        width={150}
                        height={150}
                        className="w-full h-32 object-cover rounded-md border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleImageUrlRemove(index, url)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading || uploadingImages} className="bg-green-600 hover:bg-green-700">
                {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/products">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
