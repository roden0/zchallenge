export class ApiError extends Error {
  status?: number;
  code?: string;
  constructor(message: string, options?: { status?: number; code?: string }) {
    super(message);
    this.name = 'ApiError';
    this.status = options?.status;
    this.code = options?.code;
  }
}

export async function apiFetch<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  if (!path.startsWith('/api')) {
    // normalize if needed; requirement states relative paths under /api
  }
  const url = path.startsWith('/api')
    ? path
    : `/api${path.startsWith('/') ? '' : '/'}${path}`;
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new ApiError('Request failed', { status: response.status });
    }
    try {
      const data = await response.json();
      return data as T;
    } catch {
      throw new ApiError('Invalid JSON response');
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error');
  }
}
