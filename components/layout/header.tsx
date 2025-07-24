"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AuthModal } from "@/components/auth/auth-modal"
import { createClient } from "@/lib/supabase"
import { User, ShoppingCart, LogOut, Store } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface Profile {
  role: "consumer" | "fbo" | "admin"
  full_name: string | null
  business_name: string | null
}

export function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [cartCount, setCartCount] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        fetchProfile(user.id)
        fetchCartCount(user.id)
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
      } else {
        setProfile(null)
        setCartCount(0)
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success("Signed out successfully")
    router.push("/")
  }

  const getDashboardLink = () => {
    if (profile?.role === "fbo") {
      return "/dashboard"
    }
    return "/consumer"
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-green-800">
            ZeroWaste Rwanda
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-green-600">
              Home
            </Link>
            <Link href="/products" className="text-gray-600 hover:text-green-600">
              Products
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-green-600">
              About
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {profile?.role === "consumer" && (
                  <Link href="/cart">
                    <Button variant="outline" size="sm" className="relative bg-transparent">
                      <ShoppingCart className="h-4 w-4" />
                      {cartCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {cartCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                )}

                <Link href={getDashboardLink()}>
                  <Button variant="outline" size="sm">
                    {profile?.role === "fbo" ? <Store className="h-4 w-4 mr-2" /> : <User className="h-4 w-4 mr-2" />}
                    {profile?.role === "fbo" ? "Dashboard" : "Account"}
                  </Button>
                </Link>

                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button onClick={() => setShowAuthModal(true)}>Sign In</Button>
            )}
          </div>
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </header>
  )
}
