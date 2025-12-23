import { REQUEST_TIMEOUT, MAX_RETRIES } from '@/constants';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/';
const API_TIMEOUT = REQUEST_TIMEOUT;


export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public details: Record<string, any> = {}
  ) {
    super();
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network error occurred') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthError extends ApiError {
  constructor(message = 'Authentication failed') {
    super(401);
    this.message = message;
    this.name = 'AuthError';
  }
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface UserProfile {
  username: string;
  email: string;
  created_at: string;
}

interface ShortenedUrl {
  short_id: string;
  long_url: string;
  expiration_time: string;
  access_count: number;
  active: boolean;
}

interface UrlResponse {
  id: string;
  long_url: string;
  access_count: number;
  expiration_time: string;
  created_at: string;
  active: boolean;
  deleted_at?: string;
}

interface UrlListResponse {
  total: number;
  status: string;
  urls: UrlResponse[];
}

class ApiService {
  private baseUrl: string;
  private timeout: number;
  private refreshTokenAttempts = 0;
  private maxRefreshAttempts = 1;

  constructor(baseUrl = API_BASE_URL, timeout = API_TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }


  private async retryAsync<T>(
    fn: () => Promise<T>,
    retries = MAX_RETRIES,
    delayMs = 1000
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      // Don't retry on authentication errors
      if (error instanceof AuthError) {
        throw error;
      }

      // Don't retry on client errors (4xx except 408, 429)
      if (
        error instanceof ApiError &&
        error.statusCode >= 400 &&
        error.statusCode < 500 &&
        ![408, 429].includes(error.statusCode)
      ) {
        throw error;
      }

      if (retries <= 0) {
        throw error;
      }

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, delayMs * Math.pow(2, MAX_RETRIES - retries))
      );

      return this.retryAsync(fn, retries - 1, delayMs);
    }
  }

  /**
   * Make HTTP request with automatic token management and retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    // Remove trailing slash from baseUrl and ensure endpoint starts with /
    const baseUrlClean = this.baseUrl.replace(/\/$/, '');
    const endpointPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrlClean}${endpointPath}`;
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...options.headers,
    });

    // Add authorization token if available
    const token = this.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          // Try to refresh token and retry once
          if (retryCount === 0 && this.refreshTokenAttempts < this.maxRefreshAttempts) {
            this.refreshTokenAttempts++;
            const refreshed = await this.refreshToken();
            this.refreshTokenAttempts--;
            
            if (refreshed) {
              return this.request<T>(endpoint, options, retryCount + 1);
            }
          }
          // If refresh fails, logout
          this.logout();
          throw new AuthError('Unauthorized - please login again');
        }

        const errorMessage = errorData.detail || `API Error: ${response.statusText}`;
        console.error(`API Error [${response.status}]:`, errorMessage, errorData);
        throw new ApiError(response.status, { message: errorMessage, ...errorData });
      }

      const responseData = await response.json();
      console.log('API Response:', endpoint, responseData);
      return responseData;
    } catch (error) {
      if ((error as any)?.name === 'AbortError') {
        throw new NetworkError('Request timeout - please check your connection');
      }
      if (error instanceof ApiError || error instanceof AuthError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new NetworkError(error.message);
      }
      throw new NetworkError('An unexpected error occurred');
    }
  }

  /**
   * Authentication Methods
   */

  async register(
    username: string,
    email: string,
    password: string
  ): Promise<UserProfile> {
    // Register the user
    const userProfile = await this.request<UserProfile>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    // Automatically log in the user after registration
    try {
      const authTokens = await this.login(username, password);
      return userProfile;
    } catch (error) {
      console.error('Auto-login after registration failed:', error);
      throw new Error('Account created but automatic login failed. Please log in manually.');
    }
  }

  async login(username: string, password: string): Promise<AuthTokens> {
    return this.retryAsync(async () => {
      const response = await this.request<AuthTokens>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      // Store tokens
      this.setAccessToken(response.access_token);
      this.setRefreshToken(response.refresh_token);

      return response;
    });
  }

  async getCurrentUser(): Promise<UserProfile> {
    return this.request<UserProfile>('/auth/me', {
      method: 'GET',
    });
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await this.request<AuthTokens>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      this.setAccessToken(response.access_token);
      this.setRefreshToken(response.refresh_token);

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  /**
   * URL Management Methods
   */

  async createShortenedUrl(
    longUrl: string,
    expirationDays: number = 30
  ): Promise<ShortenedUrl> {
    return this.retryAsync(async () => {
      return this.request<ShortenedUrl>('/urls/shorten', {
        method: 'POST',
        body: JSON.stringify({
          long_url: longUrl,
          expiration_days: expirationDays,
        }),
      });
    });
  }

  async getMyUrls(): Promise<UrlListResponse> {
    return this.request<UrlListResponse>('/urls/my-urls', {
      method: 'GET',
    });
  }

  async getDeletedUrls(): Promise<UrlListResponse> {
    return this.request<UrlListResponse>('/urls/my-urls/deleted', {
      method: 'GET',
    });
  }

  async updateUrl(
    shortId: string,
    longUrl: string,
    expirationDays: number = 30
  ): Promise<{ message: string; short_id: string }> {
    return this.request<{ message: string; short_id: string }>(
      `/urls/update/${shortId}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          long_url: longUrl,
          expiration_days: expirationDays,
        }),
      }
    );
  }

  async deleteUrl(
    shortId: string
  ): Promise<{ message: string; short_id: string; note: string }> {
    return this.request<{ message: string; short_id: string; note: string }>(
      `/urls/delete/${shortId}`,
      {
        method: 'DELETE',
      }
    );
  }

  async restoreUrl(
    shortId: string
  ): Promise<{ message: string; short_id: string }> {
    return this.request<{ message: string; short_id: string }>(
      `/urls/restore/${shortId}`,
      {
        method: 'POST',
      }
    );
  }

  /**
   * Token Management
   */

  private getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  private setAccessToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }

  private setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', token);
    }
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export default new ApiService();
