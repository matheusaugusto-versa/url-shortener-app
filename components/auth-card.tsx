'use client';

import { useState } from 'react';
import { ArrowRight, Merge, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';

import { FormInput } from '@/components/ui/form-input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { VALIDATION, TOAST_MESSAGES } from '@/constants';
import { showToast } from '@/lib/toast';
import { loginSchema, registerSchema, getValidationError } from '@/lib/schemas';

interface AuthCardProps {
  mode: 'login' | 'register';
}

export function AuthCard({ mode }: AuthCardProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();
  const router = useRouter();

  const isLoginMode = mode === 'login';
  const isRegisterMode = mode === 'register';

  const validateLogin = (): boolean => {
    try {
      loginSchema.parse({ username, password });
      setFieldErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = getValidationError(err);
        setFieldErrors(errors);
        setLocalError(Object.values(errors)[0] || 'Validation failed');
        return false;
      }
      return false;
    }
  };

  const validateRegister = (): boolean => {
    try {
      registerSchema.parse({
        email,
        password,
        confirmPassword,
      });
      setFieldErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = getValidationError(err);
        setFieldErrors(errors);
        setLocalError(Object.values(errors)[0] || 'Validation failed');
        return false;
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setFieldErrors({});

    const isValid = isLoginMode ? validateLogin() : validateRegister();
    if (!isValid) return;

    setIsLoading(true);
    try {
      if (isLoginMode) {
        await login(username, password);
        showToast.success(TOAST_MESSAGES.LOGIN_SUCCESS);
      } else {
        await register(username, email, password);
        showToast.success(TOAST_MESSAGES.REGISTER_SUCCESS);
      }
      router.push('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `${isLoginMode ? 'Login' : 'Registration'} failed`;
      setLocalError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
                {isLoginMode ? 'Login' : 'Create your account'}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                Welcome! Please fill in the details to get started.
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-6 py-8">
            {/* Error Alert */}
            {localError && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-md flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">{localError}</p>
              </div>
            )}

            {/* Form */}
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {/* Username Field (Login) */}
              {isLoginMode && (
                <FormInput
                  label="Username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    // Clear field-specific errors when user starts typing
                    if (fieldErrors.username) {
                      setFieldErrors({ ...fieldErrors, username: '' });
                    }
                  }}
                  error={fieldErrors.username}
                  disabled={isLoading}
                  required
                />
              )}

              {/* Username Field (Register) */}
              {isRegisterMode && (
                <FormInput
                  label="Username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (fieldErrors.username) {
                      setFieldErrors({ ...fieldErrors, username: '' });
                    }
                  }}
                  error={fieldErrors.username}
                  disabled={isLoading}
                  required
                />
              )}

              {/* Email Field (Register Only) */}
              {isRegisterMode && (
                <FormInput
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors({ ...fieldErrors, email: '' });
                    }
                  }}
                  error={fieldErrors.email}
                  disabled={isLoading}
                  required
                />
              )}

              {/* Password Field */}
              <FormInput
                label="Password"
                type="password"
                placeholder={isLoginMode ? 'Enter your password' : 'Create a password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors({ ...fieldErrors, password: '' });
                  }
                }}
                error={fieldErrors.password}
                helperText={!isLoginMode && !fieldErrors.password ? 'Min 8 chars, 1 uppercase, 1 number' : undefined}
                disabled={isLoading}
                required
              />

              {/* Confirm Password Field (Register Only) */}
              {isRegisterMode && (
                <FormInput
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) {
                      setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                    }
                  }}
                  error={fieldErrors.confirmPassword}
                  disabled={isLoading}
                  required
                />
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 px-4 py-2.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{isLoginMode ? 'Logging in...' : 'Creating account...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isLoginMode ? 'Login' : 'Continue'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Section */}
          <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {isLoginMode ? (
                <>
                  Don't have an account?{' '}
                  <Link
                    href="/register"
                    className="text-neutral-900 dark:text-white font-medium hover:underline"
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-neutral-900 dark:text-white font-medium hover:underline"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
