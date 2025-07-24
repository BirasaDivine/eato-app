"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<"consumer" | "fbo">("consumer")
  const [businessName, setBusinessName] = useState("")
  const [businessAddress, setBusinessAddress] = useState("")

  const router = useRouter()
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success("Signed in successfully!")
        onClose()
        router.refresh()
      }
    } catch (error) {
      toast.error("An error occurred during sign in")
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log("Starting signup process...")

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            role,
            business_name: role === "fbo" ? businessName : null,
            business_address: role === "fbo" ? businessAddress : null,
          },
        },
      })

      if (error) {
        console.error("Auth signup error:", error)
        toast.error(`Signup failed: ${error.message}`)
        return
      }

      console.log("Auth signup successful, user:", data.user?.id)

      if (data.user) {
        // Wait for the auth session to be established
        await new Promise((resolve) => setTimeout(resolve, 2000))

        console.log("Creating profile for user:", data.user.id)

        // Insert profile data directly
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email || email,
          full_name: fullName,
          phone: phone || null,
          role: role,
          business_name: role === "fbo" ? businessName : null,
          business_address: role === "fbo" ? businessAddress : null,
        })

        if (profileError) {
          console.error("Profile creation error:", profileError)

          // Try to delete the auth user if profile creation fails
          try {
            await supabase.auth.admin.deleteUser(data.user.id)
          } catch (deleteError) {
            console.error("Failed to cleanup user after profile error:", deleteError)
          }

          toast.error(`Registration failed: ${profileError.message}`)
          return
        }

        console.log("Profile created successfully")
        toast.success("Account created successfully! Please check your email to verify your account.")
        onClose()

        // Clear form
        setEmail("")
        setPassword("")
        setFullName("")
        setPhone("")
        setRole("consumer")
        setBusinessName("")
        setBusinessAddress("")
      }
    } catch (error) {
      console.error("Unexpected error during signup:", error)
      toast.error("An unexpected error occurred during sign up. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Welcome to ZeroWaste Rwanda</DialogTitle>
          <DialogDescription>Sign in to your account or create a new one to get started.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <Label htmlFor="full-name">Full Name</Label>
                <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
              </div>
              <div>
                <Label htmlFor="role">Account Type</Label>
                <Select value={role} onValueChange={(value: "consumer" | "fbo") => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consumer">Consumer (Buy Products)</SelectItem>
                    <SelectItem value="fbo">Business (Sell Products)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {role === "fbo" && (
                <>
                  <div>
                    <Label htmlFor="business-name">Business Name</Label>
                    <Input
                      id="business-name"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="business-address">Business Address</Label>
                    <Textarea
                      id="business-address"
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      required
                      rows={3}
                    />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
