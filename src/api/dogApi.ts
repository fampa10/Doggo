import {
  BreedsApiResponse,
  BreedGroupsApiResponse,
  SingleBreedApiResponse,
  Breed,
  BreedGroup,
} from '../types/dog';

const DEFAULT_BASE_URL = 'https://dogapi.dog/api/v2';
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_BASE_URL;
const DEFAULT_TIMEOUT_MS = 12000;
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

export interface FetchOptions {
  timeoutMs?: number;
  retries?: number;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  statusCode?: number;
  isNetworkError: boolean;

  constructor(message: string, statusCode?: number, isNetworkError = false) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.isNetworkError = isNetworkError;
  }
}

/**
 * Resilient fetch helper with exponential backoff and timeout
 */
export async function resilientFetch<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = MAX_RETRIES,
    signal,
  } = options;

  let attempt = 0;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    // Link incoming signal if provided
    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new ApiError(
          `Request failed with status ${response.status}: ${response.statusText}`,
          response.status,
          false
        );
      }

      const json = (await response.json()) as T;
      return json;
    } catch (err: unknown) {
      clearTimeout(timer);

      const isLastAttempt = attempt === retries;
      const isAbort =
        err instanceof Error &&
        (err.name === 'AbortError' || err.message.includes('aborted'));
      const isNetError =
        isAbort ||
        (err instanceof ApiError && err.isNetworkError) ||
        (err instanceof TypeError && err.message.toLowerCase().includes('network'));

      if (isLastAttempt) {
        if (err instanceof ApiError) throw err;
        throw new ApiError(
          err instanceof Error ? err.message : 'Unknown network error',
          undefined,
          isNetError
        );
      }

      // Calculate exponential backoff with jitter
      const backoff =
        INITIAL_BACKOFF_MS * Math.pow(2, attempt) + Math.random() * 300;
      await new Promise((resolve) => setTimeout(resolve, backoff));
      attempt++;
    }
  }

  throw new ApiError('Exhausted all retries', undefined, true);
}

/**
 * Dog API Service
 */
export const DogApiService = {
  /**
   * Fetches all 9 breed groups
   */
  async fetchGroups(options?: FetchOptions): Promise<BreedGroup[]> {
    const url = `${API_BASE_URL}/groups`;
    const response = await resilientFetch<BreedGroupsApiResponse>(url, options);
    return response.data || [];
  },

  /**
   * Fetches a single page of breeds
   */
  async fetchBreedsPage(
    pageNumber: number,
    pageSize = 48,
    options?: FetchOptions
  ): Promise<BreedsApiResponse> {
    const url = `${API_BASE_URL}/breeds?page[number]=${pageNumber}&page[size]=${pageSize}`;
    return await resilientFetch<BreedsApiResponse>(url, options);
  },

  /**
   * Intelligently fetches and merges all 6 paginated pages of breeds into a single 283-breed dataset.
   * Provides progressive callbacks for smooth UI progress updates.
   * Resilient to partial failure: returns partially loaded breeds if later pages fail.
   */
  async fetchAllBreeds(
    onProgress?: (loaded: number, totalEstimated: number, currentPage: number) => void,
    options?: FetchOptions
  ): Promise<{ breeds: Breed[]; isPartial: boolean; totalPages: number }> {
    const allBreeds: Breed[] = [];
    let currentPage = 1;
    let totalPages = 6; // Standard 283 / 48 = 6 pages
    let isPartial = false;

    // Fetch page 1 first to establish total pages/records
    try {
      const firstPage = await this.fetchBreedsPage(1, 48, options);
      if (firstPage.data) {
        allBreeds.push(...firstPage.data);
      }
      if (firstPage.meta?.pagination?.last) {
        totalPages = firstPage.meta.pagination.last;
      }
      onProgress?.(allBreeds.length, firstPage.meta?.pagination?.records ?? 283, 1);
    } catch (error: unknown) {
      throw new ApiError(
        `Failed to fetch initial breeds page: ${error instanceof Error ? error.message : 'Unknown'}`,
        undefined,
        true
      );
    }

    // Fetch remaining pages (2 to totalPages)
    for (currentPage = 2; currentPage <= totalPages; currentPage++) {
      try {
        const pageData = await this.fetchBreedsPage(currentPage, 48, options);
        if (pageData.data && pageData.data.length > 0) {
          allBreeds.push(...pageData.data);
        }
        onProgress?.(
          allBreeds.length,
          pageData.meta?.pagination?.records ?? 283,
          currentPage
        );
      } catch (pageError: unknown) {
        console.warn(
          `Failed to fetch page ${currentPage} of breeds, continuing with partial cache.`,
          pageError
        );
        isPartial = true;
        // Don't throw if we already have partial data; return what we have
        break;
      }
    }

    // Remove duplicates if any (keyed by id)
    const uniqueMap = new Map<string, Breed>();
    for (const breed of allBreeds) {
      if (!uniqueMap.has(breed.id)) {
        uniqueMap.set(breed.id, breed);
      }
    }

    return {
      breeds: Array.from(uniqueMap.values()),
      isPartial,
      totalPages,
    };
  },

  /**
   * Enriches or refreshes a single breed's details
   */
  async fetchBreedById(id: string, options?: FetchOptions): Promise<Breed> {
    const url = `${API_BASE_URL}/breeds/${id}`;
    const response = await resilientFetch<SingleBreedApiResponse>(url, options);
    return response.data;
  },
};
