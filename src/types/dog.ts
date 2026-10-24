/**
 * Core Data Models for Dog Breed Explorer
 * Conforms to JSON:API format from Dog API (v2)
 * https://dogapi.dog/docs/api-v2
 */

export type SizeBand = 'small' | 'medium' | 'large' | 'giant';
export type CoatLength = 'short' | 'medium' | 'long' | 'wire';

export interface MinMaxRange {
  min: number;
  max: number;
}

export interface BreedOrigin {
  era?: string;
  region?: string;
  country?: string;
}

export interface BreedCoat {
  type?: string;
  colors?: string[];
  length?: CoatLength | string;
}

export interface BreedTraits {
  energy?: number;
  barking?: number;
  drooling?: number;
  grooming?: number;
  shedding?: number;
  temperament?: string[];
  trainability?: number;
  good_with_dogs?: number;
  exercise_minutes?: number;
  apartment_friendly?: number;
  good_with_children?: number;
  good_with_strangers?: number;
}

export interface ImageAttribution {
  author?: string;
  license?: string;
  license_url?: string;
  source?: string;
  source_url?: string;
}

export interface BreedImage {
  id: string;
  url: string;
  thumb?: string;
  medium?: string;
  large?: string;
  attribution?: ImageAttribution;
}

export interface BreedAttributes {
  name: string;
  description: string;
  life: MinMaxRange;
  male_weight: MinMaxRange;
  female_weight: MinMaxRange;
  hypoallergenic: boolean;
  male_height: MinMaxRange;
  female_height: MinMaxRange;
  origin?: BreedOrigin;
  coat?: BreedCoat;
  traits?: BreedTraits;
  other_names?: string[];
  recognized_by?: string[];
  sources?: string[];
  images?: BreedImage[];
}

export interface BreedRelationshipGroup {
  data: {
    id: string;
    type: 'group';
  } | null;
}

export interface BreedRelationships {
  group?: BreedRelationshipGroup;
}

export interface Breed {
  id: string;
  type: 'breed';
  attributes: BreedAttributes;
  relationships?: BreedRelationships;
}

export interface BreedGroupAttributes {
  name: string;
}

export interface BreedGroup {
  id: string;
  type: 'group';
  attributes: BreedGroupAttributes;
  relationships?: {
    breeds?: {
      data: Array<{ id: string; type: 'breed' }>;
    };
  };
}

export interface PaginationLinks {
  self?: string;
  current?: string;
  next?: string;
  last?: string;
}

export interface PaginationMeta {
  pagination?: {
    current: number;
    next?: number;
    last: number;
    records: number;
  };
}

export interface BreedsApiResponse {
  data: Breed[];
  links?: PaginationLinks;
  meta?: PaginationMeta;
}

export interface SingleBreedApiResponse {
  data: Breed;
}

export interface BreedGroupsApiResponse {
  data: BreedGroup[];
}

/**
 * Filter State Model
 */
export interface TraitFilterThresholds {
  energy?: number;
  trainability?: number;
  good_with_dogs?: number;
  good_with_children?: number;
  good_with_strangers?: number;
  apartment_friendly?: number;
}

export interface BreedFilters {
  searchQuery: string;
  selectedGroupIds: string[];
  selectedSizes: SizeBand[];
  selectedCoatLengths: CoatLength[];
  hypoallergenicOnly: boolean | null; // true: only hypo, false: only non-hypo, null: all
  traitThresholds: TraitFilterThresholds;
  onlyFavorites: boolean;
}
