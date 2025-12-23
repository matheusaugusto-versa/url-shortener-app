'use client';

import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { z } from 'zod';
import { ShortenedUrl, styles } from './constants';
import { TableHeader } from './urls-table-header';
import { UrlsTableRow } from './urls-table-row';
import { UrlsTablePagination } from './urls-table-pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { showToast } from '@/lib/toast';
import { TOAST_MESSAGES, PAGINATION_LIMIT } from '@/constants';
import { urlSchema } from '@/lib/schemas';

interface UrlsTableProps {
  urls: ShortenedUrl[];
  onEdit: (id: string, longUrl: string, expirationDays?: number) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onRefresh?: () => void | Promise<void>;
  isLoading?: boolean;
}

export function UrlsTable({ urls, onEdit, onDelete, onRefresh, isLoading }: UrlsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [editExpiration, setEditExpiration] = useState('30');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [urlToDelete, setUrlToDelete] = useState<string | null>(null);

  // Pagination calculations
  const totalPages = Math.ceil(urls.length / PAGINATION_LIMIT);
  const startIndex = (currentPage - 1) * PAGINATION_LIMIT;
  const endIndex = startIndex + PAGINATION_LIMIT;
  const paginatedUrls = urls.slice(startIndex, endIndex);

  // Reset to page 1 if current page becomes invalid
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [urls.length, currentPage, totalPages]);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast.success(TOAST_MESSAGES.COPY_SUCCESS);
  };

  const handleStartEdit = (url: ShortenedUrl) => {
    setEditingId(url.id);
    setEditUrl(url.longUrl);
    setEditExpiration('30');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editUrl.trim()) {
      showToast.error('URL cannot be empty');
      return;
    }

    // Validate URL using Zod schema
    try {
      urlSchema.parse(editUrl);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errorMessage = err.issues?.[0]?.message || 'Invalid URL format';
        showToast.error(errorMessage);
        return;
      }
      showToast.error('Please enter a valid URL');
      return;
    }

    try {
      await onEdit(id, editUrl, parseInt(editExpiration) || 30);
      setEditingId(null);
      showToast.success(TOAST_MESSAGES.UPDATE_SUCCESS);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : TOAST_MESSAGES.UPDATE_ERROR;
      showToast.error(errorMessage);
    }
  };

  const handleDeleteClick = (id: string) => {
    setUrlToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!urlToDelete) return;

    setDeletingId(urlToDelete);
    try {
      await onDelete(urlToDelete);
      showToast.success(TOAST_MESSAGES.DELETE_SUCCESS);
      setShowDeleteDialog(false);
      setUrlToDelete(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : TOAST_MESSAGES.DELETE_ERROR;
      showToast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
      showToast.success('URLs refreshed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh URLs';
      showToast.error(errorMessage);
    } finally {
      setRefreshing(false);
    }
  };

  if (urls.length === 0) {
    return (
      <section className="w-full py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className={styles.container + ' text-center'}>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-2">
              No shortened URLs yet
            </p>
            <p className="text-sm text-neutral-500">
              Start by entering a long URL above to create your first shortened link
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="w-full py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className={styles.container}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className={styles.header}>Your Shortened URLs</h2>
              {onRefresh && (
                <button
                  onClick={handleRefresh}
                  disabled={refreshing || isLoading}
                  className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh"
                >
                  <RotateCcw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className={styles.table}>
                <TableHeader />
                <tbody>
                  {paginatedUrls.map((url, index) => (
                    <UrlsTableRow
                      key={url.id}
                      url={url}
                      index={index}
                      isEditing={editingId === url.id}
                      isDeleting={deletingId === url.id}
                      editUrl={editUrl}
                      editExpiration={editExpiration}
                      onCopyUrl={handleCopyUrl}
                      onStartEdit={handleStartEdit}
                      onEditUrlChange={setEditUrl}
                      onEditExpirationChange={setEditExpiration}
                      onSaveEdit={handleSaveEdit}
                      onCancelEdit={() => setEditingId(null)}
                      onDeleteUrl={handleDeleteClick}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <UrlsTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={urls.length}
              itemsPerPage={PAGINATION_LIMIT}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </section>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete URL"
        description="Are you sure you want to delete this shortened URL? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={deletingId !== null}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setUrlToDelete(null);
        }}
      />
    </>
  );
}
