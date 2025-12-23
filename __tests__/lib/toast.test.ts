import { describe, it, expect, beforeEach, vi } from 'vitest';
import { showToast } from '@/lib/toast';

describe('Toast Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export success toast function', () => {
    expect(showToast.success).toBeDefined();
    expect(typeof showToast.success).toBe('function');
  });

  it('should export error toast function', () => {
    expect(showToast.error).toBeDefined();
    expect(typeof showToast.error).toBe('function');
  });

  it('should export loading toast function', () => {
    expect(showToast.loading).toBeDefined();
    expect(typeof showToast.loading).toBe('function');
  });

  it('should export promise toast function', () => {
    expect(showToast.promise).toBeDefined();
    expect(typeof showToast.promise).toBe('function');
  });

  it('should export dismiss function', () => {
    expect(showToast.dismiss).toBeDefined();
    expect(typeof showToast.dismiss).toBe('function');
  });

  it('should be able to call success toast', () => {
    // Should not throw
    expect(() => {
      showToast.success('Test message');
    }).not.toThrow();
  });

  it('should be able to call error toast', () => {
    // Should not throw
    expect(() => {
      showToast.error('Error message');
    }).not.toThrow();
  });
});
