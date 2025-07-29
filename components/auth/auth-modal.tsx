"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase.client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, User, Store } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: "signin" | "signup"
  defaultRole?: "consumer" | "fbo"
}

export function AuthModal({ isOpen, onClose, defaultTab = "signin", defaultRole = "consumer" }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [role, setRole] = useState<"consumer" | "fbo">(defaultRole)
  const router = useRouter()
  const supabase = createClient()

  // Update tab and role when props change
  useEffect(() => {
    setActiveTab(defaultTab)
    setRole(defaultRole)
  }, [defaultTab, defaultRole])

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  })

  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    businessName: "",
    phone: "",
    location: "",
  })

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      if (data.user) {
        // Check user role
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

        toast.success("Signed in successfully!")
        onClose()

        // Redirect based on role
        if (profile?.role === "fbo") {
          router.push("/dashboard")
        } else {
          router.push("/consumer")
        }

        router.refresh()
      }
    } catch (error) {
      toast.error("An error occurred during sign in")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (signUpData.password !== signUpData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (signUpData.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            full_name: signUpData.fullName,
            business_name: role === "fbo" ? signUpData.businessName : null,
            phone: signUpData.phone,
            location: signUpData.location,
            role: role,
          },
        },
      })

      if (error) {
        toast.error(error.message)
        return
      }

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: signUpData.email,
          full_name: signUpData.fullName,
          business_name: role === "fbo" ? signUpData.businessName : null,
          phone: signUpData.phone,
          location: signUpData.location,
          role: role,
        })

        if (profileError) {
          console.error("Profile creation error:", profileError)
          toast.error("Account created but profile setup failed. Please contact support.")
          return
        }

        toast.success("Account created successfully! Please check your email to verify your account.")
        onClose()

        // Redirect based on role
        if (role === "fbo") {
          router.push("/dashboard")
        } else {
          router.push("/consumer")
        }

        router.refresh()
      }
    } catch (error) {
      toast.error("An error occurred during sign up")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setSignInData({ email: "", password: "" })
    setSignUpData({
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      businessName: "",
      phone: "",
      location: "",
    })
    setRole(defaultRole)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Welcome to ZeroWaste Rwanda</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="Enter your email"
                  value={signInData.email}
                  onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <div className="space-y-2">
              <Label>Account Type</Label>
              <Select value={role} onValueChange={(value: "consumer" | "fbo") => setRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consumer">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Consumer
                    </div>
                  </SelectItem>
                  <SelectItem value="fbo">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      Food Business Owner
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-fullname">Full Name</Label>
                <Input
                  id="signup-fullname"
                  type="text"
                  placeholder="Enter your full name"
                  value={signUpData.fullName}
                  onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                  required
                />
              </div>

              {role === "fbo" && (
                <div className="space-y-2">
                  <Label htmlFor="signup-business">Business Name</Label>
                  <Input
                    id="signup-business"
                    type="text"
                    placeholder="Enter your business name"
                    value={signUpData.businessName}
                    onChange={(e) => setSignUpData({ ...signUpData, businessName: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="signup-phone">Phone Number</Label>
                <Input
                  id="signup-phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={signUpData.phone}
                  onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-location">Location</Label>
                <Input
                  id="signup-location"
                  type="text"
                  placeholder="Enter your location"
                  value={signUpData.location}
                  onChange={(e) => setSignUpData({ ...signUpData, location: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={signUpData.confirmPassword}
                  onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
