import { StorageRepository } from '../storage/storageRepository';
import { Breed, BreedGroup } from '../types/dog';

// Mock AsyncStorage in-memory
const store: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(async (key: string, value: string) => {
    store[key] = value;
  }),
  getItem: jest.fn(async (key: string) => {
    return store[key] || null;
  }),
  removeItem: jest.fn(async (key: string) => {
    delete store[key];
  }),
  multiRemove: jest.fn(async (keys: string[]) => {
    for (const key of keys) {
      delete store[key];
    }
  }),
}));

describe('StorageRepository Offline Cache', () => {
  const mockBreed: Breed = {
    id: 'test-1',
    type: 'breed',
    attributes: {
      name: 'Beagle',
      description: 'Hound dog with great nose',
      life: { min: 12, max: 15 },
      male_weight: { min: 9, max: 11 },
      female_weight: { min: 9, max: 10 },
      male_height: { min: 33, max: 41 },
      female_height: { min: 33, max: 38 },
      hypoallergenic: false,
    },
  };

  const mockGroup: BreedGroup = {
    id: 'grp-hound',
    type: 'group',
    attributes: { name: 'Hound Group' },
  };

  it('saves and loads breeds properly', async () => {
    await StorageRepository.saveBreeds([mockBreed]);
    const loaded = await StorageRepository.loadBreeds();
    expect(loaded.length).toBe(1);
    expect(loaded[0].attributes.name).toBe('Beagle');
  });

  it('saves and loads breed groups properly', async () => {
    await StorageRepository.saveGroups([mockGroup]);
    const loaded = await StorageRepository.loadGroups();
    expect(loaded.length).toBe(1);
    expect(loaded[0].attributes.name).toBe('Hound Group');
  });

  it('persists cache metadata including freshness timestamp', async () => {
    const timestamp = Date.now();
    await StorageRepository.saveMetadata({
      schemaVersion: 1,
      lastSyncedAt: timestamp,
      totalRecords: 283,
      isPartial: false,
    });

    const meta = await StorageRepository.loadMetadata();
    expect(meta).not.toBeNull();
    expect(meta?.lastSyncedAt).toBe(timestamp);
    expect(meta?.totalRecords).toBe(283);
    expect(meta?.isPartial).toBe(false);
  });

  it('persists and loads favorites', async () => {
    await StorageRepository.saveFavorites(['test-1', 'test-2']);
    const favs = await StorageRepository.loadFavorites();
    expect(favs).toEqual(['test-1', 'test-2']);
  });
});
