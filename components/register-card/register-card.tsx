"use client"

import { useState } from "react"
import { ArrowRight, Merge, AlertCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { FormInput } from "@/components/ui/form-input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

export function RegisterCard() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [localError, setLocalError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const { register, error: authError } = useAuth()
  const router = useRouter()

  // Validação de email
  const validateEmail = (emailValue: string): string | null => {
    if (!emailValue.trim()) {
      return "Please enter an email"
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailValue)) {
      return "Please enter a valid email format"
    }
    return null
  }

  // Validação de senha
  const validatePassword = (passwordValue: string): string | null => {
    if (!passwordValue) {
      return "Please enter a password"
    }
    if (passwordValue.length < 6) {
      return "Password must be at least 6 characters"
    }
    return null
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    const error = validateEmail(newEmail)
    setFieldErrors((prev) => ({
      ...prev,
      email: error || "",
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    const error = validatePassword(newPassword)
    setFieldErrors((prev) => ({
      ...prev,
      password: error || "",
    }))
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value
    setConfirmPassword(newConfirmPassword)
    // Validar se as senhas combinam
    if (password && newConfirmPassword !== password) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }))
    } else {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: "",
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!username.trim()) {
      setLocalError("Please enter a username")
      return
    }

    if (username.length < 3) {
      setLocalError("Username must be at least 3 characters")
      return
    }

    // Validar email
    const emailError = validateEmail(email)
    if (emailError) {
      setFieldErrors((prev) => ({ ...prev, email: emailError }))
      setLocalError(emailError)
      return
    }

    // Validar senha
    const passwordError = validatePassword(password)
    if (passwordError) {
      setFieldErrors((prev) => ({ ...prev, password: passwordError }))
      setLocalError(passwordError)
      return
    }

    if (password !== confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }))
      setLocalError("Passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      await register(username, email, password)
      router.push("/")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed"
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
                Create your account
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
              <div className="flex flex-col gap-2">
                <Label htmlFor="username">Username</Label>
                <input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full text-sm h-9 bg-white dark:bg-neutral-50 rounded-md px-3 placeholder:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
                />
              </div>

              {/* Email Field with Real-time Validation */}
              <FormInput
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
                error={fieldErrors.email}
                disabled={isLoading}
                required
              />

              {/* Password Field with Real-time Validation */}
              <FormInput
                label="Password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={handlePasswordChange}
                error={fieldErrors.password}
                helperText={!fieldErrors.password && password ? "Min 6 characters" : undefined}
                disabled={isLoading}
                required
              />

              {/* Confirm Password Field */}
              <FormInput
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                error={fieldErrors.confirmPassword}
                disabled={isLoading}
                required
              />

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || Object.values(fieldErrors).some((err) => err)}
                className="w-full mt-2 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Footer Section */}
          <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-neutral-900 dark:text-white font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
