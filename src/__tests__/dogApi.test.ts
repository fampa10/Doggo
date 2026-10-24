import { resilientFetch, DogApiService, ApiError } from '../api/dogApi';

describe('DogApiService and Resilient Fetch', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('successfully fetches data on first attempt', async () => {
    const mockData = { data: [{ id: '1', type: 'group', attributes: { name: 'Toy' } }] };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    const result = await resilientFetch<{ data: unknown[] }>('https://api.test/data', {
      retries: 2,
    });
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('retries with exponential backoff on transient failure and recovers', async () => {
    const mockData = { data: 'success' };
    let calls = 0;

    global.fetch = jest.fn().mockImplementation(() => {
      calls++;
      if (calls < 2) {
        return Promise.reject(new TypeError('Network request failed'));
      }
      return Promise.resolve({
        ok: true,
        json: async () => mockData,
      } as Response);
    });

    const result = await resilientFetch<{ data: string }>('https://api.test/retry', {
      retries: 2,
      timeoutMs: 3000,
    });

    expect(result).toEqual(mockData);
    expect(calls).toBe(2);
  });

  it('throws ApiError after exhausting all retries', async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new TypeError('Network request failed'));

    await expect(
      resilientFetch('https://api.test/failure', {
        retries: 1,
        timeoutMs: 1000,
      })
    ).rejects.toThrow(ApiError);
  });

  it('merges 6 pages of breeds into a unified dataset', async () => {
    const pageData = (page: number) => ({
      data: [
        {
          id: `breed-${page}`,
          type: 'breed',
          attributes: { name: `Breed ${page}` },
        },
      ],
      meta: {
        pagination: { current: page, last: 3, records: 3 },
      },
    });

    jest.spyOn(DogApiService, 'fetchBreedsPage').mockImplementation(async (page: number) => {
      return pageData(page) as any;
    });

    const progressTracker: number[] = [];
    const result = await DogApiService.fetchAllBreeds((loaded) => {
      progressTracker.push(loaded);
    });

    expect(result.breeds.length).toBe(3);
    expect(result.isPartial).toBe(false);
    expect(progressTracker.length).toBe(3);
  });
});
