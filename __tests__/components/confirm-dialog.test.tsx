import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

describe('ConfirmDialog Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <ConfirmDialog
        isOpen={false}
        title="Delete Item"
        description="Are you sure?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
  });

  it('should render dialog when isOpen is true', () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Item"
        description="Are you sure?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', async () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Item"
        description="Are you sure?"
        confirmText="Delete"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(handleConfirm).toHaveBeenCalled();
    });
  });

  it('should call onCancel when cancel button is clicked', () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Item"
        description="Are you sure?"
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(handleCancel).toHaveBeenCalled();
  });

  it('should show loading state when isLoading is true', () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Item"
        description="Are you sure?"
        confirmText="Confirmar"
        isLoading={true}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    // When loading, button shows "Processando..."
    expect(screen.getByText('Processando...')).toBeInTheDocument();
    const confirmButton = screen.getByText('Processando...');
    expect(confirmButton).toBeDisabled();
  });

  it('should show danger styling when isDangerous is true', () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    const { container } = render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Item"
        description="Are you sure?"
        isDangerous={true}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    const confirmButton = screen.getByText('Confirmar');
    expect(confirmButton).toHaveClass('bg-red-600');
  });
});
