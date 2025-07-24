"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    role: "consumer" as "consumer" | "fbo",
    businessName: "",
    businessAddress: "",
    businessDescription: "",
  })

  const supabase = createClient()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const clearForm = () => {
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      phone: "",
      role: "consumer",
      businessName: "",
      businessAddress: "",
      businessDescription: "",
    })
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("Starting signin process...")

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        console.error("Signin error:", error)
        toast.error(error.message)
        return
      }

      console.log("Signin successful:", data.user?.id)
      toast.success("Signed in successfully!")
      clearForm()
      onClose()
    } catch (error) {
      console.error("Unexpected signin error:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("Starting signup process...")

      // Validation
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match")
        return
      }

      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters")
        return
      }

      if (!formData.fullName.trim()) {
        toast.error("Full name is required")
        return
      }

      if (formData.role === "fbo" && !formData.businessName.trim()) {
        toast.error("Business name is required for FBO accounts")
        return
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        console.error("Auth signup error:", authError)
        toast.error(authError.message)
        return
      }

      if (!authData.user) {
        console.error("No user returned from signup")
        toast.error("Failed to create user account")
        return
      }

      console.log("Auth signup successful, user:", authData.user.id)

      // Wait a moment for the auth session to be established
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("Updating profile for user:", authData.user.id)

      // Create profile manually
      const profileData = {
        id: authData.user.id,
        email: formData.email,
        full_name: formData.fullName.trim(),
        phone: formData.phone.trim() || null,
        role: formData.role,
        business_name: formData.role === "fbo" ? formData.businessName.trim() : null,
        business_address: formData.role === "fbo" ? formData.businessAddress.trim() || null : null,
        business_description: formData.role === "fbo" ? formData.businessDescription.trim() || null : null,
      }

      console.log("Creating profile with data:", profileData)

      const { error: profileError } = await supabase.from("profiles").insert(profileData)

      if (profileError) {
        console.error("Profile creation error:", profileError.message)

        // Try to clean up the auth user if profile creation failed
        try {
          await supabase.auth.admin.deleteUser(authData.user.id)
        } catch (cleanupError) {
          console.error("Failed to cleanup auth user:", cleanupError)
        }

        toast.error(`Profile creation failed: ${profileError.message}`)
        return
      }

      console.log("Profile created successfully")
      toast.success("Account created successfully! Please check your email to verify your account.")
      clearForm()
      onClose()
    } catch (error) {
      console.error("Unexpected signup error:", error)
      toast.error("An unexpected error occurred during signup")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Welcome to ZeroWaste Rwanda</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="signin" className="w-full">
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
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
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
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Account Type</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "consumer" | "fbo") => handleInputChange("role", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consumer">Consumer (Buy Products)</SelectItem>
                    <SelectItem value="fbo">Business (Sell Products)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  required
                />
              </div>

              {formData.role === "fbo" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange("businessName", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessAddress">Business Address (Optional)</Label>
                    <Input
                      id="businessAddress"
                      type="text"
                      value={formData.businessAddress}
                      onChange={(e) => handleInputChange("businessAddress", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessDescription">Business Description (Optional)</Label>
                    <Textarea
                      id="businessDescription"
                      value={formData.businessDescription}
                      onChange={(e) => handleInputChange("businessDescription", e.target.value)}
                      rows={3}
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                      minLength={6}
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
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
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
