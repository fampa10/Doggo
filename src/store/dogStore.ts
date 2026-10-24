import { create } from 'zustand';
import {
  Breed,
  BreedFilters,
  BreedGroup,
  CoatLength,
  SizeBand,
  TraitFilterThresholds,
} from '../types/dog';
import { StorageRepository } from '../storage/storageRepository';
import { DogApiService } from '../api/dogApi';

export interface DogState {
  // Normalized Data Cache
  breedsById: Record<string, Breed>;
  breedIds: string[];
  groupsById: Record<string, BreedGroup>;
  groupIds: string[];

  // Sync & Freshness Status
  lastSyncedAt: number | null;
  isSyncing: boolean;
  isPartialSync: boolean;
  syncError: string | null;
  syncProgress: { current: number; total: number; page: number } | null;
  isOffline: boolean;
  isHydrated: boolean;

  // Filter State
  filters: BreedFilters;
  isFilterModalOpen: boolean;
  viewMode: 'grouped' | 'flat';

  // Favorites & Theme
  favoriteIds: string[];
  themeMode: 'light' | 'dark' | 'system';

  // Navigation / Selection State
  selectedBreedId: string | null;
  isDetailRefreshing: boolean;

  // Actions
  hydrateFromStorage: () => Promise<void>;
  syncAllData: (force?: boolean) => Promise<void>;
  refreshSingleBreed: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  toggleGroupFilter: (groupId: string) => void;
  toggleSizeFilter: (size: SizeBand) => void;
  toggleCoatFilter: (coat: CoatLength) => void;
  setHypoallergenicFilter: (value: boolean | null) => void;
  setTraitThreshold: (trait: keyof TraitFilterThresholds, value: number | undefined) => void;
  toggleOnlyFavorites: () => void;
  resetFilters: () => void;
  toggleFavorite: (breedId: string) => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  setOfflineStatus: (isOffline: boolean) => void;
  setSelectedBreedId: (id: string | null) => void;
  setFilterModalOpen: (open: boolean) => void;
  setViewMode: (mode: 'grouped' | 'flat') => void;
}

const initialFilters: BreedFilters = {
  searchQuery: '',
  selectedGroupIds: [],
  selectedSizes: [],
  selectedCoatLengths: [],
  hypoallergenicOnly: null,
  traitThresholds: {},
  onlyFavorites: false,
};

export const useDogStore = create<DogState>((set, get) => ({
  breedsById: {},
  breedIds: [],
  groupsById: {},
  groupIds: [],

  lastSyncedAt: null,
  isSyncing: false,
  isPartialSync: false,
  syncError: null,
  syncProgress: null,
  isOffline: false,
  isHydrated: false,

  filters: initialFilters,
  isFilterModalOpen: false,
  viewMode: 'grouped',

  favoriteIds: [],
  themeMode: 'system',

  selectedBreedId: null,
  isDetailRefreshing: false,

  hydrateFromStorage: async () => {
    try {
      const [breeds, groups, metadata, favorites, themeMode] = await Promise.all([
        StorageRepository.loadBreeds(),
        StorageRepository.loadGroups(),
        StorageRepository.loadMetadata(),
        StorageRepository.loadFavorites(),
        StorageRepository.loadThemeMode(),
      ]);

      const breedsById: Record<string, Breed> = {};
      const breedIds: string[] = [];
      for (const breed of breeds) {
        breedsById[breed.id] = breed;
        breedIds.push(breed.id);
      }

      const groupsById: Record<string, BreedGroup> = {};
      const groupIds: string[] = [];
      for (const group of groups) {
        groupsById[group.id] = group;
        groupIds.push(group.id);
      }

      set({
        breedsById,
        breedIds,
        groupsById,
        groupIds,
        lastSyncedAt: metadata?.lastSyncedAt ?? null,
        isPartialSync: metadata?.isPartial ?? false,
        favoriteIds: favorites,
        themeMode,
        isHydrated: true,
      });

      // If no cached breeds found, initiate fresh sync
      if (breedIds.length === 0) {
        await get().syncAllData();
      }
    } catch (err: unknown) {
      console.error('Hydration error:', err);
      set({ isHydrated: true });
    }
  },

  syncAllData: async (force = false) => {
    const { isSyncing } = get();
    if (isSyncing) return;

    set({ isSyncing: true, syncError: null, syncProgress: null });

    try {
      // 1. Fetch breed groups concurrently
      const groupsPromise = DogApiService.fetchGroups().catch((err) => {
        console.warn('Failed to fetch groups, retaining current:', err);
        return Object.values(get().groupsById);
      });

      // 2. Fetch all 283 breeds across 6 pages with progress updates
      const breedsResult = await DogApiService.fetchAllBreeds((loaded, total, page) => {
        set({ syncProgress: { current: loaded, total, page } });
      });

      const groups = await groupsPromise;

      // Update normalized caches
      const breedsById: Record<string, Breed> = {};
      const breedIds: string[] = [];
      for (const breed of breedsResult.breeds) {
        breedsById[breed.id] = breed;
        breedIds.push(breed.id);
      }

      const groupsById: Record<string, BreedGroup> = {};
      const groupIds: string[] = [];
      for (const group of groups) {
        groupsById[group.id] = group;
        groupIds.push(group.id);
      }

      const now = Date.now();

      set({
        breedsById,
        breedIds,
        groupsById,
        groupIds,
        lastSyncedAt: now,
        isSyncing: false,
        isPartialSync: breedsResult.isPartial,
        syncProgress: null,
        syncError: breedsResult.isPartial
          ? 'Completed partial sync. Some records could not be fetched.'
          : null,
      });

      // Persist to local storage in background
      await Promise.all([
        StorageRepository.saveBreeds(breedsResult.breeds),
        StorageRepository.saveGroups(groups),
        StorageRepository.saveMetadata({
          schemaVersion: 1,
          lastSyncedAt: now,
          totalRecords: breedIds.length,
          isPartial: breedsResult.isPartial,
        }),
      ]);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Network error occurred while syncing breeds.';

      set({
        isSyncing: false,
        syncProgress: null,
        syncError: message,
      });
    }
  },

  refreshSingleBreed: async (id: string) => {
    set({ isDetailRefreshing: true });
    try {
      const enrichedBreed = await DogApiService.fetchBreedById(id);
      const { breedsById } = get();

      const updatedBreedsById = {
        ...breedsById,
        [id]: enrichedBreed,
      };

      set({
        breedsById: updatedBreedsById,
        isDetailRefreshing: false,
      });

      // Save updated list in storage
      await StorageRepository.saveBreeds(Object.values(updatedBreedsById));
    } catch (err: unknown) {
      console.warn('Could not refresh breed detail:', err);
      set({ isDetailRefreshing: false });
    }
  },

  setSearchQuery: (query: string) => {
    set((state) => ({
      filters: { ...state.filters, searchQuery: query },
    }));
  },

  toggleGroupFilter: (groupId: string) => {
    set((state) => {
      const exists = state.filters.selectedGroupIds.includes(groupId);
      const newGroups = exists
        ? state.filters.selectedGroupIds.filter((id) => id !== groupId)
        : [...state.filters.selectedGroupIds, groupId];
      return {
        filters: { ...state.filters, selectedGroupIds: newGroups },
      };
    });
  },

  toggleSizeFilter: (size: SizeBand) => {
    set((state) => {
      const exists = state.filters.selectedSizes.includes(size);
      const newSizes = exists
        ? state.filters.selectedSizes.filter((s) => s !== size)
        : [...state.filters.selectedSizes, size];
      return {
        filters: { ...state.filters, selectedSizes: newSizes },
      };
    });
  },

  toggleCoatFilter: (coat: CoatLength) => {
    set((state) => {
      const exists = state.filters.selectedCoatLengths.includes(coat);
      const newCoats = exists
        ? state.filters.selectedCoatLengths.filter((c) => c !== coat)
        : [...state.filters.selectedCoatLengths, coat];
      return {
        filters: { ...state.filters, selectedCoatLengths: newCoats },
      };
    });
  },

  setHypoallergenicFilter: (value: boolean | null) => {
    set((state) => ({
      filters: { ...state.filters, hypoallergenicOnly: value },
    }));
  },

  setTraitThreshold: (trait: keyof TraitFilterThresholds, value: number | undefined) => {
    set((state) => ({
      filters: {
        ...state.filters,
        traitThresholds: {
          ...state.filters.traitThresholds,
          [trait]: value,
        },
      },
    }));
  },

  toggleOnlyFavorites: () => {
    set((state) => ({
      filters: {
        ...state.filters,
        onlyFavorites: !state.filters.onlyFavorites,
      },
    }));
  },

  resetFilters: () => {
    set({ filters: initialFilters });
  },

  toggleFavorite: (breedId: string) => {
    set((state) => {
      const exists = state.favoriteIds.includes(breedId);
      const updated = exists
        ? state.favoriteIds.filter((id) => id !== breedId)
        : [...state.favoriteIds, breedId];

      StorageRepository.saveFavorites(updated);
      return { favoriteIds: updated };
    });
  },

  setThemeMode: (mode: 'light' | 'dark' | 'system') => {
    set({ themeMode: mode });
    StorageRepository.saveThemeMode(mode);
  },

  setOfflineStatus: (isOffline: boolean) => {
    set({ isOffline });
  },

  setSelectedBreedId: (id: string | null) => {
    set({ selectedBreedId: id });
  },

  setFilterModalOpen: (open: boolean) => {
    set({ isFilterModalOpen: open });
  },

  setViewMode: (mode: 'grouped' | 'flat') => {
    set({ viewMode: mode });
  },
}));
