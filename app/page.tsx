"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HomeHeader } from "@/components/home-header";
import { UrlInputSection } from "@/components/url-input-section";
import { UrlsTable, type ShortenedUrl } from "@/components/urls-table";
import { FooterSimple } from "@/components/common/footer";
import { useAuth } from "@/lib/auth-context";
import apiService from "@/lib/api-service";
import { showToast } from "@/lib/toast";
import { TOAST_MESSAGES, API_BASE_URL } from "@/constants";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Load URLs on mount
  useEffect(() => {
    if (isAuthenticated && !loading) {
      loadUrls();
    }
  }, [isAuthenticated, loading]);

  const loadUrls = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getMyUrls();
      const formattedUrls: ShortenedUrl[] = (data.urls || []).map((url) => ({
        id: url.id,
        longUrl: url.long_url,
        shortUrl: `${API_BASE_URL}urls/redirect/${url.id}`,
        createdAt: new Date(url.created_at),
        clicks: url.access_count,
      }));
      setUrls(formattedUrls);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : TOAST_MESSAGES.CREATE_ERROR;
      setError(errorMessage);
      console.error("Error loading URLs:", err);
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUrl = async (longUrl: string, expirationDays?: number) => {
    setError(null);
    try {
      const result = await apiService.createShortenedUrl(
        longUrl,
        expirationDays || 30
      );
      const newUrl: ShortenedUrl = {
        id: result.short_id,
        longUrl: result.long_url,
        shortUrl: `${API_BASE_URL}urls/redirect/${result.short_id}`,
        createdAt: new Date(),
        clicks: result.access_count,
      };
      setUrls([newUrl, ...urls]);
      showToast.success(TOAST_MESSAGES.CREATE_SUCCESS);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : TOAST_MESSAGES.CREATE_ERROR;
      setError(errorMessage);
      console.error("Error creating URL:", err);
      showToast.error(errorMessage);
    }
  };

  const handleEditUrl = async (id: string, longUrl: string, expirationDays?: number) => {
    setError(null);
    try {
      await apiService.updateUrl(id, longUrl, expirationDays || 30);
      setUrls(
        urls.map((url) =>
          url.id === id ? { ...url, longUrl } : url
        )
      );
      showToast.success(TOAST_MESSAGES.UPDATE_SUCCESS);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : TOAST_MESSAGES.UPDATE_ERROR;
      setError(errorMessage);
      console.error("Error updating URL:", err);
      showToast.error(errorMessage);
    }
  };

  const handleDeleteUrl = async (id: string) => {
    setError(null);
    try {
      await apiService.deleteUrl(id);
      setUrls(urls.filter((url) => url.id !== id));
      showToast.success(TOAST_MESSAGES.DELETE_SUCCESS);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : TOAST_MESSAGES.DELETE_ERROR;
      setError(errorMessage);
      console.error("Error deleting URL:", err);
      showToast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-900">
      <HomeHeader />
      <main className="flex-1">
        {error && (
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          </div>
        )}
        <UrlInputSection onAddUrl={handleAddUrl} />
        <UrlsTable
          urls={urls}
          onEdit={handleEditUrl}
          onDelete={handleDeleteUrl}
          onRefresh={loadUrls}
          isLoading={isLoading}
        />
      </main>
      <FooterSimple />
    </div>
  );
}
