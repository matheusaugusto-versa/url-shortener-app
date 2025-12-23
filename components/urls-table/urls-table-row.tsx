'use client';

import { Copy, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ShortenedUrl, styles, truncateUrl } from './constants';
import { EXPIRATION_OPTIONS } from '@/constants';

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

function UrlsTableRow({
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
    <tr className={`${styles.bodyRow} ${index % 2 === 0 ? styles.bodyRowEven : ''}`}>
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
              {EXPIRATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
          month: 'short',
          day: 'numeric',
          year: 'numeric',
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

export { UrlsTableRow };
