import { Breed, BreedFilters, BreedGroup, CoatLength, SizeBand } from '../types/dog';

/**
 * Derives size bucket from male & female weight (primary) or height (fallback)
 * Small: < 10 kg (< 35 cm)
 * Medium: 10 - 25 kg (35 - 55 cm)
 * Large: 25 - 45 kg (55 - 70 cm)
 * Giant: >= 45 kg (>= 70 cm)
 */
export function deriveSizeBand(breed: Breed): SizeBand {
  const { male_weight, female_weight, male_height, female_height } = breed.attributes;

  // Calculate average weight
  const weights: number[] = [];
  if (male_weight) {
    if (typeof male_weight.min === 'number') weights.push(male_weight.min);
    if (typeof male_weight.max === 'number') weights.push(male_weight.max);
  }
  if (female_weight) {
    if (typeof female_weight.min === 'number') weights.push(female_weight.min);
    if (typeof female_weight.max === 'number') weights.push(female_weight.max);
  }

  if (weights.length > 0) {
    const avgWeight = weights.reduce((acc, w) => acc + w, 0) / weights.length;
    if (avgWeight < 10) return 'small';
    if (avgWeight < 25) return 'medium';
    if (avgWeight < 45) return 'large';
    return 'giant';
  }

  // Fallback to height in cm
  const heights: number[] = [];
  if (male_height) {
    if (typeof male_height.min === 'number') heights.push(male_height.min);
    if (typeof male_height.max === 'number') heights.push(male_height.max);
  }
  if (female_height) {
    if (typeof female_height.min === 'number') heights.push(female_height.min);
    if (typeof female_height.max === 'number') heights.push(female_height.max);
  }

  if (heights.length > 0) {
    const avgHeight = heights.reduce((acc, h) => acc + h, 0) / heights.length;
    if (avgHeight < 35) return 'small';
    if (avgHeight < 55) return 'medium';
    if (avgHeight < 70) return 'large';
    return 'giant';
  }

  return 'medium'; // Default fallback
}

/**
 * Extracts normalized coat length
 */
export function extractCoatLength(breed: Breed): CoatLength {
  const length = breed.attributes.coat?.length?.toLowerCase();
  if (length === 'short') return 'short';
  if (length === 'medium') return 'medium';
  if (length === 'long') return 'long';
  if (length === 'wire' || breed.attributes.coat?.type?.toLowerCase() === 'wire') {
    return 'wire';
  }
  return 'short';
}

/**
 * Matches search query against breed name and other_names
 */
export function matchesSearch(breed: Breed, query: string): boolean {
  if (!query || !query.trim()) return true;
  const cleanQuery = query.trim().toLowerCase();

  const nameMatch = breed.attributes.name?.toLowerCase().includes(cleanQuery);
  if (nameMatch) return true;

  const otherNames = breed.attributes.other_names;
  if (Array.isArray(otherNames)) {
    return otherNames.some((alt) => alt.toLowerCase().includes(cleanQuery));
  }

  return false;
}

/**
 * Evaluates whether a breed matches all active filters
 */
export function matchesFilters(
  breed: Breed,
  filters: BreedFilters,
  favoriteIds: Set<string>
): boolean {
  // 1. Search Query
  if (!matchesSearch(breed, filters.searchQuery)) {
    return false;
  }

  // 2. Favorites only
  if (filters.onlyFavorites && !favoriteIds.has(breed.id)) {
    return false;
  }

  // 3. Breed Group filter (multi-select)
  if (filters.selectedGroupIds.length > 0) {
    const breedGroupId = breed.relationships?.group?.data?.id;
    if (!breedGroupId || !filters.selectedGroupIds.includes(breedGroupId)) {
      return false;
    }
  }

  // 4. Size band filter (multi-select)
  if (filters.selectedSizes.length > 0) {
    const sizeBand = deriveSizeBand(breed);
    if (!filters.selectedSizes.includes(sizeBand)) {
      return false;
    }
  }

  // 5. Coat length filter (multi-select)
  if (filters.selectedCoatLengths.length > 0) {
    const coatLength = extractCoatLength(breed);
    if (!filters.selectedCoatLengths.includes(coatLength)) {
      return false;
    }
  }

  // 6. Hypoallergenic filter
  if (filters.hypoallergenicOnly !== null) {
    if (breed.attributes.hypoallergenic !== filters.hypoallergenicOnly) {
      return false;
    }
  }

  // 7. Trait thresholds
  const traits = breed.attributes.traits;
  const thresholds = filters.traitThresholds;

  if (thresholds.energy && ((traits?.energy ?? 0) < thresholds.energy)) {
    return false;
  }
  if (thresholds.trainability && ((traits?.trainability ?? 0) < thresholds.trainability)) {
    return false;
  }
  if (thresholds.good_with_dogs && ((traits?.good_with_dogs ?? 0) < thresholds.good_with_dogs)) {
    return false;
  }
  if (thresholds.good_with_children && ((traits?.good_with_children ?? 0) < thresholds.good_with_children)) {
    return false;
  }
  if (thresholds.good_with_strangers && ((traits?.good_with_strangers ?? 0) < thresholds.good_with_strangers)) {
    return false;
  }
  if (thresholds.apartment_friendly && ((traits?.apartment_friendly ?? 0) < thresholds.apartment_friendly)) {
    return false;
  }

  return true;
}

export interface BreedSection {
  title: string;
  groupId: string;
  data: Breed[];
}

/**
 * Groups filtered breeds by Breed Group for SectionList
 */
export function groupBreedsByGroup(
  breeds: Breed[],
  groupsById: Record<string, BreedGroup>
): BreedSection[] {
  const map = new Map<string, { title: string; groupId: string; data: Breed[] }>();

  // Initialize with known groups
  for (const group of Object.values(groupsById)) {
    map.set(group.id, {
      title: group.attributes.name,
      groupId: group.id,
      data: [],
    });
  }

  const unassignedKey = 'unassigned';
  map.set(unassignedKey, {
    title: 'Other Breeds',
    groupId: unassignedKey,
    data: [],
  });

  for (const breed of breeds) {
    const groupId = breed.relationships?.group?.data?.id;
    if (groupId && map.has(groupId)) {
      map.get(groupId)!.data.push(breed);
    } else {
      map.get(unassignedKey)!.data.push(breed);
    }
  }

  // Filter out empty groups and sort alphabetically by group title
  return Array.from(map.values())
    .filter((sec) => sec.data.length > 0)
    .sort((a, b) => {
      if (a.groupId === unassignedKey) return 1;
      if (b.groupId === unassignedKey) return -1;
      return a.title.localeCompare(b.title);
    });
}
