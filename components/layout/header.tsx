"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AuthModal } from "@/components/auth/auth-modal"
import { createClient } from "@/lib/supabase"
import { User, ShoppingCart, LogOut, Search, Heart, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Profile {
  role: "consumer" | "fbo" | "admin"
  full_name: string | null
  business_name: string | null
}

const categories = ["Fruits", "Vegetables", "Grains", "Dairy", "Meat", "Beverages", "Snacks", "Other"]

export function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [cartCount, setCartCount] = useState(0)
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        fetchProfile(user.id)
        fetchCartCount(user.id)
        fetchFavoritesCount(user.id)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
        fetchCartCount(session.user.id)
        fetchFavoritesCount(session.user.id)
      } else {
        setProfile(null)
        setCartCount(0)
        setFavoritesCount(0)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("role, full_name, business_name").eq("id", userId).single()

    if (data) {
      setProfile(data)
    }
  }

  const fetchCartCount = async (userId: string) => {
    const { data } = await supabase.from("cart_items").select("quantity").eq("user_id", userId)

    if (data) {
      const total = data.reduce((sum, item) => sum + item.quantity, 0)
      setCartCount(total)
    }
  }

  const fetchFavoritesCount = async (userId: string) => {
    const { data } = await supabase.from("favorites").select("id").eq("user_id", userId)
    setFavoritesCount(data?.length || 0)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success("Signed out successfully")
    router.push("/")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleCategorySelect = (category: string) => {
    router.push(`/products?category=${encodeURIComponent(category)}`)
  }

  const getDashboardLink = () => {
    if (profile?.role === "fbo") {
      return "/dashboard"
    }
    return "/consumer"
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      {/* First Line - Logo and Main Navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-green-800">
            ZeroWaste Rwanda
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-green-600 font-medium">
              Home
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-green-600 font-medium">
              About
            </Link>
            <Link href="/products" className="text-gray-600 hover:text-green-600 font-medium">
              Products
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <Button onClick={() => setShowAuthModal(true)}>Sign In</Button>
            )}
          </div>
        </div>
      </div>

      {/* Second Line - Categories, Search, and User Actions */}
      <div className="bg-gray-50 border-t">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* All Categories Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                  <span className="mr-2">All Categories</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className="cursor-pointer"
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search Any Fruits, Vegetable..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-2 rounded-full border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* User Actions */}
            <div className="flex items-center space-x-2">
              {user ? (
                <>
                  {/* Profile */}
                  <Link href={getDashboardLink()}>
                    <Button variant="ghost" size="sm" className="p-2">
                      <User className="h-5 w-5" />
                    </Button>
                  </Link>

                  {/* Favorites */}
                  {profile?.role === "consumer" && (
                    <Link href="/favorites">
                      <Button variant="ghost" size="sm" className="p-2 relative">
                        <Heart className="h-5 w-5" />
                        {favoritesCount > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs">
                            {favoritesCount}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  )}

                  {/* Cart */}
                  {profile?.role === "consumer" && (
                    <Link href="/cart">
                      <Button variant="ghost" size="sm" className="p-2 relative">
                        <ShoppingCart className="h-5 w-5" />
                        {cartCount > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs">
                            {cartCount}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="p-2">
                    <User className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2">
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </header>
  )
}
