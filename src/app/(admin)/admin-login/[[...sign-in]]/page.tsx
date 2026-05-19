import { SignIn } from "@clerk/nextjs"
import Image from "next/image"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Admin Sign In" }

export default function AdminSignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="Mel's Place"
            width={64}
            height={64}
            className="rounded-full mx-auto mb-3"
          />
          <h1 className="text-2xl font-bold text-white">Mel&apos;s Place</h1>
          <p className="text-stone-400 mt-1 text-sm">Admin Dashboard</p>
        </div>
        <SignIn forceRedirectUrl="/api/auth/after-sign-in" signUpUrl="/sign-up" />
      </div>
    </div>
  )
}
