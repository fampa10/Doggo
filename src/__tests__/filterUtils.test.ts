import {
  deriveSizeBand,
  extractCoatLength,
  matchesSearch,
  matchesFilters,
  groupBreedsByGroup,
} from '../utils/filterUtils';
import { Breed, BreedFilters, BreedGroup } from '../types/dog';

describe('Filter and Aggregation Utilities', () => {
  const mockBreed: Breed = {
    id: 'b1',
    type: 'breed',
    attributes: {
      name: 'Golden Retriever',
      description: 'Gentle, intelligent, and friendly.',
      life: { min: 10, max: 12 },
      male_weight: { min: 29, max: 34 },
      female_weight: { min: 25, max: 32 },
      male_height: { min: 56, max: 61 },
      female_height: { min: 51, max: 56 },
      hypoallergenic: false,
      coat: {
        length: 'medium',
        type: 'double',
        colors: ['gold', 'cream'],
      },
      traits: {
        energy: 4,
        trainability: 5,
        good_with_children: 5,
        good_with_dogs: 5,
        good_with_strangers: 4,
        apartment_friendly: 2,
        exercise_minutes: 60,
      },
      other_names: ['Golden', 'Yellow Retriever'],
    },
    relationships: {
      group: {
        data: {
          id: 'g1',
          type: 'group',
        },
      },
    },
  };

  const mockSmallBreed: Breed = {
    id: 'b2',
    type: 'breed',
    attributes: {
      name: 'Chihuahua',
      description: 'Small size, big personality.',
      life: { min: 14, max: 18 },
      male_weight: { min: 1, max: 3 },
      female_weight: { min: 1, max: 3 },
      male_height: { min: 15, max: 23 },
      female_height: { min: 15, max: 23 },
      hypoallergenic: false,
      coat: {
        length: 'short',
        type: 'smooth',
      },
      traits: {
        energy: 3,
        trainability: 2,
        apartment_friendly: 5,
      },
    },
    relationships: {
      group: {
        data: {
          id: 'g2',
          type: 'group',
        },
      },
    },
  };

  describe('deriveSizeBand', () => {
    it('correctly categorizes small breeds (< 10kg)', () => {
      expect(deriveSizeBand(mockSmallBreed)).toBe('small');
    });

    it('correctly categorizes large breeds (25-45kg)', () => {
      expect(deriveSizeBand(mockBreed)).toBe('large');
    });

    it('derives giant breeds for weight >= 45kg', () => {
      const giantBreed: Breed = {
        ...mockBreed,
        attributes: {
          ...mockBreed.attributes,
          male_weight: { min: 50, max: 70 },
          female_weight: { min: 45, max: 60 },
        },
      };
      expect(deriveSizeBand(giantBreed)).toBe('giant');
    });
  });

  describe('extractCoatLength', () => {
    it('extracts coat length correctly', () => {
      expect(extractCoatLength(mockBreed)).toBe('medium');
      expect(extractCoatLength(mockSmallBreed)).toBe('short');
    });

    it('handles wire coat types', () => {
      const wireBreed: Breed = {
        ...mockBreed,
        attributes: {
          ...mockBreed.attributes,
          coat: { type: 'wire', length: 'wire' },
        },
      };
      expect(extractCoatLength(wireBreed)).toBe('wire');
    });
  });

  describe('matchesSearch', () => {
    it('matches by primary breed name case-insensitively', () => {
      expect(matchesSearch(mockBreed, 'golden')).toBe(true);
      expect(matchesSearch(mockBreed, 'RETRIEVER')).toBe(true);
    });

    it('matches by alternative names (other_names)', () => {
      expect(matchesSearch(mockBreed, 'Yellow Retriever')).toBe(true);
      expect(matchesSearch(mockBreed, 'poodle')).toBe(false);
    });

    it('returns true when query is empty', () => {
      expect(matchesSearch(mockBreed, '')).toBe(true);
      expect(matchesSearch(mockBreed, '   ')).toBe(true);
    });
  });

  describe('matchesFilters', () => {
    const baseFilters: BreedFilters = {
      searchQuery: '',
      selectedGroupIds: [],
      selectedSizes: [],
      selectedCoatLengths: [],
      hypoallergenicOnly: null,
      traitThresholds: {},
      onlyFavorites: false,
    };

    it('matches when all filters are open', () => {
      expect(matchesFilters(mockBreed, baseFilters, new Set())).toBe(true);
    });

    it('filters by breed group', () => {
      expect(
        matchesFilters(mockBreed, { ...baseFilters, selectedGroupIds: ['g1'] }, new Set())
      ).toBe(true);
      expect(
        matchesFilters(mockBreed, { ...baseFilters, selectedGroupIds: ['g2'] }, new Set())
      ).toBe(false);
    });

    it('filters by size band', () => {
      expect(
        matchesFilters(mockBreed, { ...baseFilters, selectedSizes: ['large'] }, new Set())
      ).toBe(true);
      expect(
        matchesFilters(mockBreed, { ...baseFilters, selectedSizes: ['small'] }, new Set())
      ).toBe(false);
    });

    it('filters by trait threshold', () => {
      expect(
        matchesFilters(
          mockBreed,
          { ...baseFilters, traitThresholds: { good_with_children: 4 } },
          new Set()
        )
      ).toBe(true);

      // Chihuahua apartment friendly threshold
      expect(
        matchesFilters(
          mockSmallBreed,
          { ...baseFilters, traitThresholds: { apartment_friendly: 4 } },
          new Set()
        )
      ).toBe(true);

      expect(
        matchesFilters(
          mockBreed,
          { ...baseFilters, traitThresholds: { apartment_friendly: 4 } },
          new Set()
        )
      ).toBe(false);
    });

    it('filters by favorites only', () => {
      const favorites = new Set(['b1']);
      expect(
        matchesFilters(mockBreed, { ...baseFilters, onlyFavorites: true }, favorites)
      ).toBe(true);
      expect(
        matchesFilters(mockSmallBreed, { ...baseFilters, onlyFavorites: true }, favorites)
      ).toBe(false);
    });
  });

  describe('groupBreedsByGroup', () => {
    it('groups breeds under their corresponding group', () => {
      const groupsById: Record<string, BreedGroup> = {
        g1: { id: 'g1', type: 'group', attributes: { name: 'Sporting Group' } },
        g2: { id: 'g2', type: 'group', attributes: { name: 'Toy Group' } },
      };

      const sections = groupBreedsByGroup([mockBreed, mockSmallBreed], groupsById);
      expect(sections.length).toBe(2);
      expect(sections.find((s) => s.groupId === 'g1')?.data[0].id).toBe('b1');
      expect(sections.find((s) => s.groupId === 'g2')?.data[0].id).toBe('b2');
    });
  });
});
