/**
 * Centralized fetch utility for external API calls.
 * This module runs exclusively on the server (used by Server Actions).
 * It attaches the API token and tenant headers automatically.
 */

const API_BASE_URL = process.env.EXTERNAL_API_BASE_URL ?? "https://api.example.com";

interface FetchOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  token?: string;
  tenantId?: string;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { token, tenantId, headers: customHeaders, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (tenantId) {
    headers["X-Tenant-ID"] = tenantId;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      return {
        data: null,
        error: `API error: ${response.status} ${response.statusText}`,
        status: response.status,
      };
    }

    const data = (await response.json()) as T;
    return { data, error: null, status: response.status };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      status: 500,
    };
  }
}
