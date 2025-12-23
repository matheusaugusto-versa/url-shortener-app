'use client';

export interface ShortenedUrl {
  id: string;
  longUrl: string;
  shortUrl: string;
  createdAt: Date;
  clicks: number;
}

export const styles = {
  container: 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-md p-6',
  header: 'text-xl font-bold text-neutral-900 dark:text-white',
  table: 'w-full border-collapse',
  headerCell: 'px-4 py-3 text-center text-xs font-semibold text-neutral-700 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-700',
  bodyRow: 'border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors',
  bodyRowEven: 'bg-neutral-50/50 dark:bg-neutral-800/30',
  bodyCell: 'px-4 py-3 text-xs text-neutral-700 dark:text-neutral-300 text-center',
  bodyCellLeft: 'px-4 py-3 text-xs text-neutral-700 dark:text-neutral-300 text-left',
  bodyCellRight: 'px-4 py-3 text-xs text-neutral-700 dark:text-neutral-300 text-right',
  input: 'w-full px-2 py-1 text-xs bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded',
  select: 'w-full px-2 py-1 text-xs bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded text-neutral-900 dark:text-neutral-100',
  button: {
    save: 'px-3 py-1 text-xs font-medium rounded bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors',
    cancel: 'px-3 py-1 text-xs font-medium rounded bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-500/20 transition-colors',
    edit: 'px-3 py-1 text-xs font-medium rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors flex items-center gap-1',
    delete: 'px-3 py-1 text-xs font-medium rounded bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center gap-1',
  },
};

export const truncateUrl = (url: string, maxLength: number = 50): string => {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + '...';
};
