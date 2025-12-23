import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import apiService, { ApiError, AuthError, NetworkError } from '@/lib/api-service';

describe('ApiService', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    // Clear all mocks
    vi.clearAllMocks();
    // Reset fetch mock
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Error Classes', () => {
    it('should create ApiError with status code', () => {
      const error = new ApiError(404, { message: 'Not found' });
      expect(error.statusCode).toBe(404);
      expect(error.details).toEqual({ message: 'Not found' });
    });

    it('should create AuthError', () => {
      const error = new AuthError('Invalid credentials');
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Invalid credentials');
    });

    it('should create NetworkError', () => {
      const error = new NetworkError('Connection failed');
      expect(error.message).toBe('Connection failed');
    });
  });

  describe('Token Management', () => {
    it('should store and retrieve access token', () => {
      const token = 'test-access-token-123';
      apiService['setAccessToken'](token);
      const retrieved = apiService['getAccessToken']();
      expect(retrieved).toBe(token);
    });

    it('should store and retrieve refresh token', () => {
      const token = 'test-refresh-token-456';
      apiService['setRefreshToken'](token);
      const retrieved = apiService['getRefreshToken']();
      expect(retrieved).toBe(token);
    });

    it('should clear tokens on logout', () => {
      apiService['setAccessToken']('test-token');
      apiService['setRefreshToken']('test-refresh');
      apiService.logout();
      expect(apiService['getAccessToken']()).toBeNull();
      expect(apiService['getRefreshToken']()).toBeNull();
    });

    it('should correctly report authentication status', () => {
      expect(apiService.isAuthenticated()).toBe(false);
      apiService['setAccessToken']('test-token');
      expect(apiService.isAuthenticated()).toBe(true);
    });
  });

  describe('Login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        token_type: 'Bearer',
        expires_in: 3600,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiService.login('testuser', 'password123');

      expect(result.access_token).toBe('new-access-token');
      expect(apiService.isAuthenticated()).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.any(Object)
      );
    });

    it('should throw AuthError on login failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ detail: 'Invalid credentials' }),
      });

      await expect(apiService.login('testuser', 'wrongpassword')).rejects.toThrow();
    });
  });

  describe('Create Shortened URL', () => {
    it('should create a shortened URL with default expiration', async () => {
      apiService['setAccessToken']('test-token');

      const mockResponse = {
        short_id: 'abc123',
        long_url: 'https://example.com/very/long/url',
        expiration_time: '2025-01-22T10:00:00Z',
        access_count: 0,
        active: true,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiService.createShortenedUrl(
        'https://example.com/very/long/url'
      );

      expect(result.short_id).toBe('abc123');
      expect(result.long_url).toBe('https://example.com/very/long/url');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/urls/shorten'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should create a shortened URL with custom expiration', async () => {
      apiService['setAccessToken']('test-token');

      const mockResponse = {
        short_id: 'xyz789',
        long_url: 'https://example.com/url',
        expiration_time: '2025-02-22T10:00:00Z',
        access_count: 0,
        active: true,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiService.createShortenedUrl(
        'https://example.com/url',
        90
      );

      expect(result.short_id).toBe('xyz789');
    });
  });

  describe('Retry Logic', () => {
    it('should not retry on 400 errors', async () => {
      apiService['setAccessToken']('test-token');

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: 'Bad request' }),
      });

      await expect(
        apiService.createShortenedUrl('invalid-url')
      ).rejects.toThrow(ApiError);

      // Should not retry for client errors
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Get My URLs', () => {
    it('should fetch user URLs successfully', async () => {
      apiService['setAccessToken']('test-token');

      const mockResponse = {
        total: 2,
        status: 'success',
        urls: [
          {
            id: 'url1',
            long_url: 'https://example.com/1',
            access_count: 5,
            expiration_time: '2025-01-22T10:00:00Z',
            created_at: '2025-01-22T08:00:00Z',
            active: true,
          },
          {
            id: 'url2',
            long_url: 'https://example.com/2',
            access_count: 10,
            expiration_time: '2025-01-22T10:00:00Z',
            created_at: '2025-01-22T08:00:00Z',
            active: true,
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiService.getMyUrls();

      expect(result.total).toBe(2);
      expect(result.urls).toHaveLength(2);
      expect(result.urls[0].id).toBe('url1');
    });
  });

  describe('Delete URL', () => {
    it('should delete a URL successfully', async () => {
      apiService['setAccessToken']('test-token');

      const mockResponse = {
        message: 'URL deleted successfully',
        short_id: 'abc123',
        note: 'URL can be restored within 30 days',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiService.deleteUrl('abc123');

      expect(result.message).toBe('URL deleted successfully');
      expect(result.short_id).toBe('abc123');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/urls/delete/abc123'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });
});
