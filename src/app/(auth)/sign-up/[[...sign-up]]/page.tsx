import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-stone-100 dark:from-stone-950 dark:to-stone-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
            Mel&apos;s Place
          </h1>
          <p className="text-stone-500 dark:text-stone-400 mt-1 text-sm">
            Create your account to start shopping
          </p>
        </div>
        <SignUp />
      </div>
    </div>
  )
}
