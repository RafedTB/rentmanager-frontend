export enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  VILLA = 'VILLA',
  STUDIO = 'STUDIO',
  OFFICE = 'OFFICE',
  COMMERCIAL = 'COMMERCIAL'
}

export enum PropertyStatus {
  AVAILABLE = 'AVAILABLE',
  RENTED = 'RENTED',
  MAINTENANCE = 'MAINTENANCE',
  UNAVAILABLE = 'UNAVAILABLE'
}

export interface Property {
  id: number;
  reference: string;
  description: string;
  price: number;
  status: PropertyStatus;
  type: PropertyType;
  isAvailable: boolean;
  photos: string[]; // List<String> from backend
  bathroom: number;
  beds: number;
  constructionYear: number;
  garage: number;
  country: string;
  city: string;
  surfaceArea: number;
  address: string;
  publicationDate: Date;
  houseRules: string;
  viewCount: number;
  rentPeriod?: string;
  // Additional fields for compatibility
  landlordId?: number;
  currentTenantId?: number;
  createdAt?: Date;
  updatedAt?: Date;
  featured?: boolean;
}

export interface PropertyCreateRequest {
  title: string;
  description: string;
  type: PropertyType;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  furnished: boolean;
  parkingSpaces: number;
  features: string[];
  images?: string[];
}

export interface PropertySearchCriteria {
  city?: string;
  type?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  status?: PropertyStatus;
  furnished?: boolean;
}
