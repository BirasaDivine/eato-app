import { createServerClient } from "@/lib/supabase"
import { DashboardLayout } from "@/components/dashboard/layout"
import { ProfileForm } from "@/components/dashboard/profile-form"
import { redirect } from "next/navigation"

async function getUser() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

async function getUserProfile(userId: string) {
  const supabase = await createServerClient()
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()
  return profile
}

export default async function ProfilePage() {
  const user = await getUser()

  if (!user) {
    redirect("/")
  }

  const profile = await getUserProfile(user.id)

  if (!profile || profile.role !== "fbo") {
    redirect("/")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your business profile and account settings</p>
        </div>

        <ProfileForm profile={profile} />
      </div>
    </DashboardLayout>
  )
}
