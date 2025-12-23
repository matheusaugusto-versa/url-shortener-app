import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAsync } from '@/hooks/useAsync';

describe('useAsync Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading true when immediate is true', () => {
    const mockFn = vi.fn().mockResolvedValue('test');

    const { result } = renderHook(() => useAsync(mockFn, { immediate: true }));

    expect(result.current.loading).toBe(true);
  });

  it('should initialize with loading false when immediate is false', () => {
    const mockFn = vi.fn().mockResolvedValue('test');

    const { result } = renderHook(() => useAsync(mockFn, { immediate: false }));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it('should execute async function and return data', async () => {
    const mockFn = vi.fn().mockResolvedValue('test-data');

    const { result } = renderHook(() => useAsync(mockFn, { immediate: true }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe('test-data');
    expect(result.current.error).toBeNull();
  });

  it('should handle errors', async () => {
    const mockError = new Error('Test error');
    const mockFn = vi.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useAsync(mockFn, { immediate: true }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe('Test error');
  });

  it('should call onSuccess callback when function succeeds', async () => {
    const onSuccess = vi.fn();
    const mockFn = vi.fn().mockResolvedValue('test-data');

    renderHook(() => useAsync(mockFn, { immediate: true, onSuccess }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('test-data');
    });
  });

  it('should call onError callback when function fails', async () => {
    const onError = vi.fn();
    const mockError = new Error('Test error');
    const mockFn = vi.fn().mockRejectedValue(mockError);

    renderHook(() => useAsync(mockFn, { immediate: true, onError }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it('should allow manual execution with execute function', async () => {
    const mockFn = vi.fn().mockResolvedValue('manual-data');

    const { result } = renderHook(() => useAsync(mockFn, { immediate: false }));

    expect(result.current.loading).toBe(false);

    await result.current.execute();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe('manual-data');
  });
});
