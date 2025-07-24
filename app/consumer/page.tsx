import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Clock, Star } from "lucide-react"

const mockDeals = [
  {
    id: 1,
    name: "Fresh Bread Loaves",
    business: "Kigali Bakery",
    originalPrice: 1500,
    discountedPrice: 900,
    expiryDate: "Today 6PM",
    distance: "0.5 km",
    rating: 4.5,
    category: "Bakery",
  },
  {
    id: 2,
    name: "Organic Vegetables Mix",
    business: "Green Market",
    originalPrice: 3000,
    discountedPrice: 1800,
    expiryDate: "Tomorrow",
    distance: "1.2 km",
    rating: 4.8,
    category: "Vegetables",
  },
  {
    id: 3,
    name: "Dairy Products Bundle",
    business: "Fresh Dairy Co",
    originalPrice: 2500,
    discountedPrice: 1500,
    expiryDate: "Today 8PM",
    distance: "0.8 km",
    rating: 4.3,
    category: "Dairy",
  },
]

export default function ConsumerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-green-800">Eato App</h1>
            <Button variant="outline">Profile</Button>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="bg-white py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Search for food deals near you..." className="pl-10" />
            </div>
            <div className="flex gap-2 mt-4">
              <Badge variant="secondary">Bakery</Badge>
              <Badge variant="secondary">Vegetables</Badge>
              <Badge variant="secondary">Dairy</Badge>
              <Badge variant="secondary">Meat</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Deals Section */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-semibold mb-6">Deals Near You</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockDeals.map((deal) => (
              <Card key={deal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{deal.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {deal.business} • {deal.distance}
                      </CardDescription>
                    </div>
                    <Badge>{deal.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-green-600">{deal.discountedPrice} RWF</span>
                        <span className="text-sm text-gray-500 line-through ml-2">{deal.originalPrice} RWF</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{deal.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-orange-600">
                      <Clock className="h-3 w-3" />
                      Expires: {deal.expiryDate}
                    </div>

                    <Button className="w-full bg-green-600 hover:bg-green-700">Reserve Now</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
