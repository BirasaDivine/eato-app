"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Upload, Loader2, X } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  sellerId: string
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
}

export function ImageUpload({ sellerId, images, onImagesChange, maxImages = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    setUploading(true)
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
        onImagesChange([...images, ...newImageUrls])
        toast.success(`${newImageUrls.length} image(s) uploaded successfully`)
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload images")
    } finally {
      setUploading(false)
      // Reset the input
      event.target.value = ""
    }
  }

  const handleImageRemove = async (index: number, url: string) => {
    // If it's a Supabase storage URL, delete from storage
    if (url.includes("supabase") && url.includes("product-images")) {
      try {
        // Extract the file path from the URL
        const urlParts = url.split("/")
        const bucketIndex = urlParts.findIndex((part) => part === "product-images")
        if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
          const filePath = urlParts.slice(bucketIndex + 1).join("/")

          const { error } = await supabase.storage.from("product-images").remove([filePath])

          if (error) {
            console.error("Delete error:", error)
            toast.error("Failed to delete image from storage")
            return
          }
        }
      } catch (error) {
        console.error("Delete error:", error)
      }
    }

    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const handleUrlAdd = () => {
    if (images.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    const url = prompt("Enter image URL:")
    if (url && url.trim()) {
      onImagesChange([...images, url.trim()])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Product Images</h3>
          <p className="text-xs text-gray-500">
            Upload up to {maxImages} images (max 5MB each). Supported: JPG, PNG, GIF, WebP
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading || images.length >= maxImages}
            />
            <Button type="button" variant="outline" size="sm" disabled={uploading || images.length >= maxImages}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUrlAdd}
            disabled={images.length >= maxImages}
          >
            Add URL
          </Button>
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((url, index) => (
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
                onClick={() => handleImageRemove(index, url)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">No images uploaded yet</p>
        </div>
      )}
    </div>
  )
}
