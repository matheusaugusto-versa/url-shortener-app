"use client";

import React, { useState } from "react";
import { Copy, Trash2, Edit2, RotateCcw, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { showToast } from "@/lib/toast";
import { TOAST_MESSAGES } from "@/constants";

export interface ShortenedUrl {
  id: string;
  longUrl: string;
  shortUrl: string;
  createdAt: Date;
  clicks: number;
}

interface UrlsTableProps {
  urls: ShortenedUrl[];
  onEdit: (id: string, longUrl: string, expirationDays?: number) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onRefresh?: () => void | Promise<void>;
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 5;

// Estilos reutilizáveis
const styles = {
  container: "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-md p-6",
  header: "text-xl font-bold text-neutral-900 dark:text-white",
  table: "w-full border-collapse",
  headerCell: "px-4 py-3 text-center text-xs font-semibold text-neutral-700 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-700",
  bodyRow: "border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors",
  bodyRowEven: "bg-neutral-50/50 dark:bg-neutral-800/30",
  bodyCell: "px-4 py-3 text-xs text-neutral-700 dark:text-neutral-300 text-center",
  bodyCellLeft: "px-4 py-3 text-xs text-neutral-700 dark:text-neutral-300 text-left",
  bodyCellRight: "px-4 py-3 text-xs text-neutral-700 dark:text-neutral-300 text-right",
  input: "w-full px-2 py-1 text-xs bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded",
  select: "w-full px-2 py-1 text-xs bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded text-neutral-900 dark:text-neutral-100",
  button: {
    save: "px-3 py-1 text-xs font-medium rounded bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors",
    cancel: "px-3 py-1 text-xs font-medium rounded bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-500/20 transition-colors",
    edit: "px-3 py-1 text-xs font-medium rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors flex items-center gap-1",
    delete: "px-3 py-1 text-xs font-medium rounded bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center gap-1",
  },
};

// Função para truncar URL
const truncateUrl = (url: string, maxLength: number = 50): string => {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + "...";
};

export function UrlsTable({ urls, onEdit, onDelete, onRefresh, isLoading }: UrlsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editExpiration, setEditExpiration] = useState("30");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [urlToDelete, setUrlToDelete] = useState<string | null>(null);

  // Cálculos de paginação
  const totalPages = Math.ceil(urls.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedUrls = urls.slice(startIndex, endIndex);

  // Resetar para página 1 se a página atual ficar inválida
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
    setEditExpiration("30");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editUrl.trim()) return;
    
    try {
      new URL(editUrl);
    } catch {
      showToast.error("Please enter a valid URL");
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
    } finally {
      setRefreshing(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (urls.length === 0) {
    return (
      <section className="w-full py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className={styles.container + " text-center"}>
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
                <RotateCcw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className={styles.table}>
              <TableHeader />
              <tbody>
                {paginatedUrls.map((url, index) => (
                  <TableRow
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

          {/* Pagination Controls */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Showing {startIndex + 1} to {Math.min(endIndex, urls.length)} of {urls.length} URLs
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete URL"
        description="Are you sure you want to delete this shortened URL?"
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
    </section>
  );
}

// Componente para header da tabela
function TableHeader() {
  const headers = ["Short URL", "Long URL", "Clicks", "Created", "Actions"];

  return (
    <thead>
      <tr className="border-b border-neutral-200 dark:border-neutral-700">
        {headers.map((header) => (
          <th key={header} className={styles.headerCell}>
            {header}
          </th>
        ))}
      </tr>
    </thead>
  );
}

// Componente para linha da tabela
interface TableRowProps {
  url: ShortenedUrl;
  index: number;
  isEditing: boolean;
  isDeleting: boolean;
  editUrl: string;
  editExpiration: string;
  onCopyUrl: (url: string) => void;
  onStartEdit: (url: ShortenedUrl) => void;
  onEditUrlChange: (url: string) => void;
  onEditExpirationChange: (days: string) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onDeleteUrl: (id: string) => void;
}

function TableRow({
  url,
  index,
  isEditing,
  isDeleting,
  editUrl,
  editExpiration,
  onCopyUrl,
  onStartEdit,
  onEditUrlChange,
  onEditExpirationChange,
  onSaveEdit,
  onCancelEdit,
  onDeleteUrl,
}: TableRowProps) {
  return (
    <tr className={`${styles.bodyRow} ${index % 2 === 0 ? styles.bodyRowEven : ""}`}>
      {/* Short URL Cell */}
      <td className={styles.bodyCell}>
        <div className="flex items-center justify-center gap-2">
          <code className="text-xs font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-indigo-600 dark:text-indigo-400">
            {url.id}
          </code>
          <button
            onClick={() => onCopyUrl(url.shortUrl)}
            className="p-1 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
            title="Copy short URL"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </td>

      {/* Long URL Cell */}
      <td className={styles.bodyCell}>
        {isEditing ? (
          <div className="space-y-2">
            <Input
              type="url"
              value={editUrl}
              onChange={(e) => onEditUrlChange(e.target.value)}
              placeholder="https://example.com/your/long/url"
              className={styles.input}
            />
            <select
              value={editExpiration}
              onChange={(e) => onEditExpirationChange(e.target.value)}
              className={styles.select}
            >
              <option value="1">1 day</option>
              <option value="7">7 days</option>
              <option value="15">15 days</option>
              <option value="30">30 days</option>
            </select>
          </div>
        ) : (
          <a
            href={url.longUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 hover:underline block"
            title={url.longUrl}
          >
            {truncateUrl(url.longUrl, 50)}
          </a>
        )}
      </td>

      {/* Clicks Cell */}
      <td className={styles.bodyCell}>
        <span className="font-medium">{url.clicks}</span>
      </td>

      {/* Created Cell */}
      <td className={styles.bodyCell}>
        {url.createdAt.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </td>

      {/* Actions Cell */}
      <td className={styles.bodyCellRight}>
        <div className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <button onClick={() => onSaveEdit(url.id)} className={styles.button.save}>
                Save
              </button>
              <button onClick={onCancelEdit} className={styles.button.cancel}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={() => onStartEdit(url)} className={styles.button.edit}>
                <Edit2 className="h-3 w-3" />
                Edit
              </button>
              <button
                onClick={() => onDeleteUrl(url.id)}
                disabled={isDeleting}
                className={styles.button.delete}
              >
                {isDeleting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
                Delete
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
