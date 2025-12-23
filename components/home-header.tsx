"use client";

import React from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/auth-context";

export function HomeHeader() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const { t } = useTranslation('common');

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="w-full border-b border-white/20 dark:border-neutral-800/50 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950 py-6 px-4 mb-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-black to-neutral-600 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">
              {t('app_name')}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">
              {t('app_description')}
            </p>
          </div>
          {isAuthenticated && user && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {user.username}
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {user.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                title={t('logout')}
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
