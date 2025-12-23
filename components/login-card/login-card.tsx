"use client"

import { useState } from "react"
import { ArrowRight, Merge, AlertCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

export function LoginCard() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [localError, setLocalError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { login, error: authError } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!username.trim()) {
      setLocalError("Please enter your username")
      return
    }

    if (!password) {
      setLocalError("Please enter your password")
      return
    }

    setIsLoading(true)
    try {
      await login(username, password)
      router.push("/")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed"
      setLocalError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const error = localError || authError

  return (
    <div className="min-h-screen flex items-center justify-center dark:from-neutral-950 dark:to-neutral-900 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm">
          {/* Header Section */}
          <div className="flex flex-col gap-4 items-center justify-center px-6 py-8 border-b border-neutral-200 dark:border-neutral-800">
            <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-full">
              <Merge className="h-7 w-7 text-neutral-900 dark:text-neutral-100" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
                Login
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                Welcome! Please fill in the details to get started.
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-6 py-8">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-md flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Form */}
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {/* Username Field */}
              <div className="flex flex-col">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full text-sm h-9 bg-white dark:bg-neutral-50 rounded-md px-3 placeholder:text-neutral-400"
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full text-sm h-9 bg-white dark:bg-neutral-50 rounded-md px-3 placeholder:text-neutral-400"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 px-4 py-2.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Section */}
          <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-neutral-900 dark:text-white font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
