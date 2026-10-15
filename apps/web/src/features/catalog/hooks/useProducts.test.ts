import { renderHook, waitFor } from '@testing-library/react';
import { useProducts } from './useProducts';

describe('useProducts', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('fetches products on mount', async () => {
    const mockData = [
      {
        id: '1',
        brand: 'Apple',
        name: 'iPhone',
        basePrice: 999,
        imageUrl: 'https://example.com/1.jpg',
      },
    ];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as unknown as Response);
    const { result } = renderHook(() => useProducts());
    expect(result.current.loading).toBe(true);
    await waitFor(() => {
      expect(result.current.success).toBe(true);
      expect(result.current.data).toEqual(mockData);
    });
  });
});
