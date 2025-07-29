"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase.client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { AuthModal } from "@/components/auth/auth-modal"
import {
  User,
  LogOut,
  Menu,
  Search,
  ShoppingCart,
  Heart,
  ChevronDown,
  Store,
  Home,
  Info,
  Package,
  List,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [cartCount, setCartCount] = useState(0)
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Get user role
        const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single()
        if (data) {
          setUserRole(data.role)
        }

        // Get cart count
        const { count: cartItemCount } = await supabase
          .from("cart_items")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        setCartCount(cartItemCount || 0)

        // Get favorites count
        const { count: favCount } = await supabase
          .from("favorites")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        setFavoritesCount(favCount || 0)
      }
    }

    getUser()

    // Set up realtime subscription for cart
    const cartSubscription = supabase
      .channel("cart_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart_items",
        },
        async () => {
          if (user) {
            const { count } = await supabase
              .from("cart_items")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id)

            setCartCount(count || 0)
          }
        },
      )
      .subscribe()

    // Set up realtime subscription for favorites
    const favoritesSubscription = supabase
      .channel("favorites_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "favorites",
        },
        async () => {
          if (user) {
            const { count } = await supabase
              .from("favorites")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id)

            setFavoritesCount(count || 0)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(cartSubscription)
      supabase.removeChannel(favoritesSubscription)
    }
  }, [user])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserRole(null)
    router.refresh()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSignInClick = () => {
    setIsAuthModalOpen(true)
  }

  const categories = [
    { name: "Fruits", value: "fruits" },
    { name: "Vegetables", value: "vegetables" },
    { name: "Bakery", value: "bakery" },
    { name: "Dairy", value: "dairy" },
    { name: "Meat", value: "meat" },
    { name: "Beverages", value: "beverages" },
    { name: "Other", value: "other" },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white shadow-sm">
        {/* First line: Logo and main navigation */}
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/placeholder-logo.svg" alt="ZeroWaste Rwanda" width={40} height={40} />
              <span className="text-xl font-bold text-green-600">ZeroWaste</span>
            </Link>

            {/* Main Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors hover:text-green-600 ${
                  pathname === "/" ? "text-green-600" : "text-gray-600"
                }`}
              >
                Home
              </Link>
              <Link
                href="/fbo"
                className={`text-sm font-medium transition-colors hover:text-green-600 ${
                  pathname === "/fbo" ? "text-green-600" : "text-gray-600"
                }`}
              >
                For Business Owners
              </Link>
              <Link
                href="/products"
                className={`text-sm font-medium transition-colors hover:text-green-600 ${
                  pathname === "/products" ? "text-green-600" : "text-gray-600"
                }`}
              >
                Products
              </Link>
            </nav>

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Account</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {userRole === "fbo" && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="w-full cursor-pointer">
                          <Store className="h-4 w-4 mr-2" />
                          Seller Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {userRole === "consumer" && (
                      <DropdownMenuItem asChild>
                        <Link href="/consumer" className="w-full cursor-pointer">
                          <User className="h-4 w-4 mr-2" />
                          My Account
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={handleSignInClick} variant="ghost">
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>
                    <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                      <Image src="/placeholder-logo.svg" alt="ZeroWaste Rwanda" width={32} height={32} />
                      <span className="text-xl font-bold text-green-600">ZeroWaste</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-8">
                  <SheetClose asChild>
                    <Link
                      href="/"
                      className={`flex items-center space-x-2 px-2 py-2 rounded-md ${
                        pathname === "/" ? "bg-green-50 text-green-600" : "text-gray-600"
                      }`}
                    >
                      <Home className="h-5 w-5" />
                      <span>Home</span>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      href="/about"
                      className={`flex items-center space-x-2 px-2 py-2 rounded-md ${
                        pathname === "/about" ? "bg-green-50 text-green-600" : "text-gray-600"
                      }`}
                    >
                      <Info className="h-5 w-5" />
                      <span>About</span>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      href="/products"
                      className={`flex items-center space-x-2 px-2 py-2 rounded-md ${
                        pathname === "/products" ? "bg-green-50 text-green-600" : "text-gray-600"
                      }`}
                    >
                      <Package className="h-5 w-5" />
                      <span>Products</span>
                    </Link>
                  </SheetClose>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-sm text-gray-500 mb-2">Categories</h3>
                    {categories.map((category) => (
                      <SheetClose key={category.value} asChild>
                        <Link
                          href={`/products?category=${category.value}`}
                          className="flex items-center space-x-2 px-2 py-2 text-gray-600 hover:text-green-600"
                        >
                          <span>{category.name}</span>
                        </Link>
                      </SheetClose>
                    ))}
                  </div>

                  {user ? (
                    <div className="pt-4 border-t border-gray-200">
                      {userRole === "fbo" && (
                        <SheetClose asChild>
                          <Link
                            href="/dashboard"
                            className="flex items-center space-x-2 px-2 py-2 text-gray-600 hover:text-green-600"
                          >
                            <Store className="h-5 w-5" />
                            <span>Seller Dashboard</span>
                          </Link>
                        </SheetClose>
                      )}
                      {userRole === "consumer" && (
                        <SheetClose asChild>
                          <Link
                            href="/consumer"
                            className="flex items-center space-x-2 px-2 py-2 text-gray-600 hover:text-green-600"
                          >
                            <User className="h-5 w-5" />
                            <span>My Account</span>
                          </Link>
                        </SheetClose>
                      )}
                      <SheetClose asChild>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center space-x-2 px-2 py-2 text-gray-600 hover:text-green-600 w-full text-left"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Sign Out</span>
                        </button>
                      </SheetClose>
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-gray-200">
                      <SheetClose asChild>
                        <button
                          onClick={handleSignInClick}
                          className="flex items-center space-x-2 px-2 py-2 text-gray-600 hover:text-green-600 w-full text-left"
                        >
                          <User className="h-5 w-5" />
                          <span>Sign In</span>
                        </button>
                      </SheetClose>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Second line: Categories, Search, and User Actions */}
        <div className="border-t border-gray-100 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-14">
              {/* Categories Dropdown */}
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                      <List className="h-4 w-4" />
                      All Categories
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {categories.map((category) => (
                      <DropdownMenuItem key={category.value} asChild>
                        <Link href={`/products?category=${category.value}`}>{category.name}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex-1 mx-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search for products..."
                    className="w-full pl-10 pr-4 py-2 rounded-full border-gray-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>

              {/* User Actions */}
              <div className="flex items-center space-x-2">
                {/* Favorites */}
                <Link href="/favorites" className="relative p-2">
                  <Heart className="h-5 w-5 text-gray-600" />
                  {favoritesCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-green-600">
                      {favoritesCount}
                    </Badge>
                  )}
                </Link>

                {/* Cart */}
                <Link href="/cart" className="relative p-2">
                  <ShoppingCart className="h-5 w-5 text-gray-600" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-green-600">
                      {cartCount}
                    </Badge>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab="signin"
        defaultRole="consumer"
      />
    </>
  )
}
