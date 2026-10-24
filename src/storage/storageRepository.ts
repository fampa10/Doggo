import AsyncStorage from '@react-native-async-storage/async-storage';
import { Breed, BreedGroup } from '../types/dog';

export interface CacheMetadata {
  schemaVersion: number;
  lastSyncedAt: number;
  totalRecords: number;
  isPartial: boolean;
}

const STORAGE_KEYS = {
  BREEDS: '@tripare_dog_breeds_v1',
  GROUPS: '@tripare_dog_groups_v1',
  METADATA: '@tripare_cache_metadata_v1',
  FAVORITES: '@tripare_favorites_v1',
  THEME: '@tripare_theme_mode_v1',
} as const;

export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Storage Repository for normalized offline cache
 */
export const StorageRepository = {
  async saveBreeds(breeds: Breed[]): Promise<void> {
    try {
      const serialized = JSON.stringify(breeds);
      await AsyncStorage.setItem(STORAGE_KEYS.BREEDS, serialized);
    } catch (error: unknown) {
      console.error('StorageRepository: Failed to save breeds', error);
      throw error;
    }
  },

  async loadBreeds(): Promise<Breed[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BREEDS);
      if (!data) return [];
      const parsed: unknown = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed as Breed[];
      }
      return [];
    } catch (error: unknown) {
      console.error('StorageRepository: Failed to load breeds', error);
      return [];
    }
  },

  async saveGroups(groups: BreedGroup[]): Promise<void> {
    try {
      const serialized = JSON.stringify(groups);
      await AsyncStorage.setItem(STORAGE_KEYS.GROUPS, serialized);
    } catch (error: unknown) {
      console.error('StorageRepository: Failed to save groups', error);
      throw error;
    }
  },

  async loadGroups(): Promise<BreedGroup[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.GROUPS);
      if (!data) return [];
      const parsed: unknown = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed as BreedGroup[];
      }
      return [];
    } catch (error: unknown) {
      console.error('StorageRepository: Failed to load groups', error);
      return [];
    }
  },

  async saveMetadata(metadata: CacheMetadata): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.METADATA, JSON.stringify(metadata));
    } catch (error: unknown) {
      console.error('StorageRepository: Failed to save metadata', error);
    }
  },

  async loadMetadata(): Promise<CacheMetadata | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.METADATA);
      if (!data) return null;
      return JSON.parse(data) as CacheMetadata;
    } catch (error: unknown) {
      console.error('StorageRepository: Failed to load metadata', error);
      return null;
    }
  },

  async saveFavorites(favoriteIds: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favoriteIds));
    } catch (error: unknown) {
      console.error('StorageRepository: Failed to save favorites', error);
    }
  },

  async loadFavorites(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (!data) return [];
      const parsed: unknown = JSON.parse(data);
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch (error: unknown) {
      console.error('StorageRepository: Failed to load favorites', error);
      return [];
    }
  },

  async saveThemeMode(mode: 'light' | 'dark' | 'system'): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, mode);
    } catch (error: unknown) {
      console.error('StorageRepository: Failed to save theme mode', error);
    }
  },

  async loadThemeMode(): Promise<'light' | 'dark' | 'system'> {
    try {
      const mode = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      if (mode === 'light' || mode === 'dark' || mode === 'system') {
        return mode;
      }
      return 'system';
    } catch {
      return 'system';
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.BREEDS,
        STORAGE_KEYS.GROUPS,
        STORAGE_KEYS.METADATA,
        STORAGE_KEYS.FAVORITES,
      ]);
    } catch (error: unknown) {
      console.error('StorageRepository: Failed to clear storage', error);
    }
  },
};
