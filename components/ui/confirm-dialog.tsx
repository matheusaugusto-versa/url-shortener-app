'use client';

import { Button } from "./button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error("Confirm dialog error:", error);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="presentation"
      onClick={onCancel}
    >
      <div 
        className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg max-w-sm w-full mx-4 overflow-hidden"
        role="alertdialog"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 
            id="dialog-title"
            className="text-lg font-semibold text-neutral-900 dark:text-white"
          >
            {title}
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p 
            id="dialog-description"
            className="text-sm text-neutral-600 dark:text-neutral-300"
          >
            {description}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            ariaLabel={cancelText}
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            variant={isDangerous ? "destructive" : "default"}
            ariaLabel={confirmText}
          >
            {isLoading ? "Processando..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
