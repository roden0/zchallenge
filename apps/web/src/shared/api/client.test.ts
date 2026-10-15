import { ApiError, apiFetch } from './client';

describe('apiFetch', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('returns parsed JSON on success', async () => {
    const mockData = { data: [1, 2, 3] };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as unknown as Response);
    const result = await apiFetch('/api/test');
    expect(result).toEqual(mockData);
  });

  it('throws ApiError with status for non-2xx', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' }),
    } as unknown as Response);
    await expect(apiFetch('/api/test')).rejects.toBeInstanceOf(ApiError);
  });

  it('throws ApiError for network failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network down'));
    await expect(apiFetch('/api/test')).rejects.toBeInstanceOf(ApiError);
  });

  it('throws ApiError for invalid JSON', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => {
        throw new Error('Invalid');
      },
    } as unknown as Response);
    await expect(apiFetch('/api/test')).rejects.toBeInstanceOf(ApiError);
  });

  it('propagates abort errors', async () => {
    const controller = new AbortController();
    const abortError = new Error('AbortError');
    abortError.name = 'AbortError';
    global.fetch = jest.fn().mockRejectedValue(abortError);
    await expect(
      apiFetch('/api/test', controller.signal),
    ).rejects.toHaveProperty('name', 'AbortError');
  });
});
