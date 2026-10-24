import { useDogStore } from '../store/dogStore';
import { Breed, BreedGroup } from '../types/dog';

// Mock storage and API
jest.mock('../storage/storageRepository', () => ({
  StorageRepository: {
    loadBreeds: jest.fn().mockResolvedValue([]),
    loadGroups: jest.fn().mockResolvedValue([]),
    loadMetadata: jest.fn().mockResolvedValue(null),
    loadFavorites: jest.fn().mockResolvedValue([]),
    loadThemeMode: jest.fn().mockResolvedValue('light'),
    saveBreeds: jest.fn().mockResolvedValue(undefined),
    saveGroups: jest.fn().mockResolvedValue(undefined),
    saveMetadata: jest.fn().mockResolvedValue(undefined),
    saveFavorites: jest.fn().mockResolvedValue(undefined),
    saveThemeMode: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../api/dogApi', () => ({
  DogApiService: {
    fetchGroups: jest.fn().mockResolvedValue([
      { id: 'g1', type: 'group', attributes: { name: 'Hound Group' } },
    ]),
    fetchAllBreeds: jest.fn().mockResolvedValue({
      breeds: [
        {
          id: 'b1',
          type: 'breed',
          attributes: {
            name: 'Beagle',
            description: 'Merry hound dog',
            life: { min: 12, max: 15 },
            male_weight: { min: 9, max: 11 },
            female_weight: { min: 9, max: 10 },
            male_height: { min: 33, max: 41 },
            female_height: { min: 33, max: 38 },
            hypoallergenic: false,
          },
        },
      ],
      isPartial: false,
      totalPages: 6,
    }),
    fetchBreedById: jest.fn().mockResolvedValue({
      id: 'b1',
      type: 'breed',
      attributes: {
        name: 'Beagle Enriched',
      },
    }),
  },
}));

describe('useDogStore State Management', () => {
  beforeEach(() => {
    useDogStore.setState({
      breedsById: {},
      breedIds: [],
      groupsById: {},
      groupIds: [],
      favoriteIds: [],
      selectedBreedId: null,
      filters: {
        searchQuery: '',
        selectedGroupIds: [],
        selectedSizes: [],
        selectedCoatLengths: [],
        hypoallergenicOnly: null,
        traitThresholds: {},
        onlyFavorites: false,
      },
    });
  });

  it('updates search query in store', () => {
    useDogStore.getState().setSearchQuery('poodle');
    expect(useDogStore.getState().filters.searchQuery).toBe('poodle');
  });

  it('toggles group filter in store', () => {
    useDogStore.getState().toggleGroupFilter('g1');
    expect(useDogStore.getState().filters.selectedGroupIds).toContain('g1');

    useDogStore.getState().toggleGroupFilter('g1');
    expect(useDogStore.getState().filters.selectedGroupIds).not.toContain('g1');
  });

  it('toggles size filter in store', () => {
    useDogStore.getState().toggleSizeFilter('small');
    expect(useDogStore.getState().filters.selectedSizes).toContain('small');

    useDogStore.getState().toggleSizeFilter('small');
    expect(useDogStore.getState().filters.selectedSizes).not.toContain('small');
  });

  it('toggles favorites in store', () => {
    useDogStore.getState().toggleFavorite('b1');
    expect(useDogStore.getState().favoriteIds).toContain('b1');

    useDogStore.getState().toggleFavorite('b1');
    expect(useDogStore.getState().favoriteIds).not.toContain('b1');
  });

  it('syncs data into normalized cache', async () => {
    await useDogStore.getState().syncAllData();
    const state = useDogStore.getState();
    expect(state.breedIds.length).toBe(1);
    expect(state.breedsById['b1'].attributes.name).toBe('Beagle');
    expect(state.groupIds.length).toBe(1);
    expect(state.lastSyncedAt).not.toBeNull();
  });

  it('refreshes single breed details', async () => {
    useDogStore.setState({
      breedsById: {
        b1: {
          id: 'b1',
          type: 'breed',
          attributes: { name: 'Old Beagle' } as any,
        },
      },
      breedIds: ['b1'],
    });

    await useDogStore.getState().refreshSingleBreed('b1');
    expect(useDogStore.getState().breedsById['b1'].attributes.name).toBe(
      'Beagle Enriched'
    );
  });
});
