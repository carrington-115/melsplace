import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db, users, addresses } from "@/db"
import { eq } from "drizzle-orm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "./profile-form"
import { AddressesSection } from "./addresses-section"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
}

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const clerkUser = await currentUser()
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) redirect("/sign-in")

  const userAddresses = await db.query.addresses.findMany({
    where: eq(addresses.userId, user.id),
    orderBy: (a, { desc }) => [desc(a.isDefault), desc(a.createdAt)],
  })

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileForm
            defaultValues={{
              name: user.name,
              phone: user.phone ?? "",
              email: user.email,
            }}
            userId={user.id}
          />
        </TabsContent>

        <TabsContent value="addresses">
          <AddressesSection addresses={userAddresses} userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
