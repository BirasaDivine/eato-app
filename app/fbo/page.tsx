import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, TrendingUp, Users } from "lucide-react"

const mockListings = [
  {
    id: 1,
    name: "Fresh Bread Loaves",
    category: "Bakery",
    quantity: 15,
    originalPrice: 1500,
    discountedPrice: 900,
    expiryDate: "2024-01-15",
    status: "Active",
  },
  {
    id: 2,
    name: "Organic Vegetables",
    category: "Vegetables",
    quantity: 8,
    originalPrice: 3000,
    discountedPrice: 1800,
    expiryDate: "2024-01-16",
    status: "Active",
  },
]

export default function FBOPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-green-800">FBO Dashboard</h1>
            <Button variant="outline">Settings</Button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Package className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">23</p>
                    <p className="text-sm text-gray-600">Active Listings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">45,600</p>
                    <p className="text-sm text-gray-600">Revenue (RWF)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">127</p>
                    <p className="text-sm text-gray-600">Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Package className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">89%</p>
                    <p className="text-sm text-gray-600">Waste Reduced</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-8">
        {/* Add New Product */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              List New Product
            </CardTitle>
            <CardDescription>Add products that are near expiry to reduce waste</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="productName">Product Name</Label>
              <Input id="productName" placeholder="e.g., Fresh Bread Loaves" />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bakery">Bakery</SelectItem>
                  <SelectItem value="vegetables">Vegetables</SelectItem>
                  <SelectItem value="dairy">Dairy</SelectItem>
                  <SelectItem value="meat">Meat</SelectItem>
                  <SelectItem value="fruits">Fruits</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="number" placeholder="0" />
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input id="expiryDate" type="date" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="originalPrice">Original Price (RWF)</Label>
                <Input id="originalPrice" type="number" placeholder="0" />
              </div>
              <div>
                <Label htmlFor="discountPrice">Discount Price (RWF)</Label>
                <Input id="discountPrice" type="number" placeholder="0" />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Product description..." />
            </div>

            <Button className="w-full bg-green-600 hover:bg-green-700">List Product</Button>
          </CardContent>
        </Card>

        {/* Current Listings */}
        <Card>
          <CardHeader>
            <CardTitle>Your Listings</CardTitle>
            <CardDescription>Manage your current product listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockListings.map((listing) => (
                <div key={listing.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{listing.name}</h3>
                    <Badge variant="secondary">{listing.status}</Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Category: {listing.category}</p>
                    <p>Quantity: {listing.quantity}</p>
                    <p>
                      Price: {listing.discountedPrice} RWF (was {listing.originalPrice} RWF)
                    </p>
                    <p>Expires: {listing.expiryDate}</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
