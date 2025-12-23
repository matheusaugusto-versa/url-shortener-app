"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { urlSchema } from "@/lib/schemas";

interface UrlInputSectionProps {
  onAddUrl: (longUrl: string, expirationDays?: number) => Promise<void>;
}

export function UrlInputSection({ onAddUrl }: UrlInputSectionProps) {
  const [longUrl, setLongUrl] = useState("https://");
  const [expirationDays, setExpirationDays] = useState("30");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!longUrl.trim()) {
      setError("Please enter a URL");
      return;
    }

    // Validate URL using Zod schema
    try {
      urlSchema.parse(longUrl);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues?.[0]?.message || 'Invalid URL format');
        return;
      }
      setError("Please enter a valid URL");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onAddUrl(longUrl, parseInt(expirationDays));
      setLongUrl("https://");
      setExpirationDays("30");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create shortened URL");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-md mx-auto max-w-6xl px-6 py-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-end gap-3 p-4">
          <div className="flex-1 space-y-2">
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Long URL
            </label>
            <Input
              type="url"
              placeholder="https://example.com/your/long/url"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              disabled={isLoading}
              className="w-full text-sm h-9 bg-white dark:bg-neutral-50 rounded-md px-3 placeholder:text-neutral-400"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Expiration
            </label>
            <select
              value={expirationDays}
              onChange={(e) => setExpirationDays(e.target.value)}
              disabled={isLoading}
              className="w-28 text-sm h-9 bg-white dark:bg-neutral-50 border border-neutral-200 dark:border-neutral-600 rounded-md px-2 font-medium text-neutral-900 dark:text-neutral-900"
            >
              <option value="1">1 day</option>
              <option value="7">7 days</option>
              <option value="15">15 days</option>
              <option value="30">30 days</option>
            </select>
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="h-9 px-4 text-sm font-medium"
          >
            {isLoading ? "Creating..." : "Shorten"}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}