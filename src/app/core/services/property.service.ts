import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Property, PropertyCreateRequest, PropertySearchCriteria, PropertyStatus } from '../models';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {

  private apiUrl = `${environment.apiUrl}/ads`;

  constructor(private http: HttpClient) { }

  /**
   * Get all properties with optional filters
   */
  async getProperties(criteria?: PropertySearchCriteria): Promise<Property[]> {
    try {
      const ads = await firstValueFrom(this.http.get<any[]>(this.apiUrl));
      
      if (!ads) {
        return [];
      }
      
      if (!Array.isArray(ads)) {
        // If it's a single object, wrap it in an array
        if (typeof ads === 'object') {
          return [this.mapAdToProperty(ads)];
        }
        return [];
      }
      
      if (ads.length === 0) {
        return [];
      }
      
      const properties = ads.map(ad => this.mapAdToProperty(ad));
      return properties;
    } catch (error: any) {
      // Handle different error types gracefully
      if (error?.status === 500) {
        console.warn('Backend returned 500 error when fetching properties. Server may be experiencing issues.');
      } else if (error?.status === 404) {
        console.warn('Properties endpoint not found (404). Returning empty array.');
      } else if (error?.status === 403) {
        console.warn('Access denied (403) when fetching properties.');
      } else {
        console.warn('Error fetching properties:', error?.status || error?.message || 'Unknown error');
      }
      
      return [];
    }
  }

  /**
   * Get property by ID
   */
  async getPropertyById(id: number): Promise<Property | null> {
    try {
      const ad = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/${id}`));
      return this.mapAdToProperty(ad);
    } catch (error) {
      console.error('Error fetching property:', error);
      return null;
    }
  }

  /**
   * Get properties by landlord ID
   */
  async getPropertiesByLandlord(landlordId: number): Promise<Property[]> {
    try {
      // Try the landlord-specific endpoint first
      try {
        const ads = await firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/landlord/${landlordId}`));
        if (ads && Array.isArray(ads)) {
          return ads.map(ad => this.mapAdToProperty(ad));
        }
      } catch (landlordEndpointError: any) {
        // Fallback: Try fetching all properties and filtering
        if (landlordEndpointError?.status === 500 || landlordEndpointError?.status === 404) {
          try {
            const allProperties = await this.getProperties();
            const filtered = allProperties.filter(p => p.landlordId === landlordId);
            if (filtered.length > 0) {
              console.log(`Using fallback: Found ${filtered.length} properties for landlord ${landlordId}`);
            }
            return filtered;
          } catch (fallbackError: any) {
            // Both endpoints failed, return empty array
            console.warn(`Both property endpoints failed for landlord ${landlordId}. Returning empty array.`);
            return [];
          }
        } else {
          // For other errors (403, etc.), just return empty array
          return [];
        }
      }
      
      return [];
    } catch (error: any) {
      console.warn(`Error fetching properties for landlord ${landlordId}:`, error?.status || error?.message || 'Unknown error');
      return [];
    }
  }

  /**
   * Map backend Ad entity to frontend Property model
   */
  private mapAdToProperty(ad: any): Property {

    // Map photos array or photoUrls string to array of URLs
    let photos: string[] = [];
    if (ad.photos && Array.isArray(ad.photos)) {
      photos = ad.photos;
    } else if (ad.photoUrls) {
      photos = typeof ad.photoUrls === 'string'
        ? ad.photoUrls.split(',').map((url: string) => url.trim()).filter((url: string) => url)
        : [];
    }

    // Construct full image URLs if they are relative paths
    photos = photos.map(photo => {
      if (!photo) return '';
      
      // If already a full URL, return as is
      if (photo.startsWith('http://') || photo.startsWith('https://')) {
        return photo;
      }
      
      // If it's a relative path starting with /images/, construct full URL
      if (photo.startsWith('/images/')) {
        // Remove /api from the base URL and add the image path
        const baseUrl = environment.apiUrl.replace('/api', '');
        const fullUrl = `${baseUrl}${photo}`;
        return fullUrl;
      }
      
      // If it's just a filename, assume it's in /images/
      if (!photo.startsWith('/')) {
        const baseUrl = environment.apiUrl.replace('/api', '');
        const fullUrl = `${baseUrl}/images/${photo}`;
        return fullUrl;
      }
      
      return photo;
    }).filter(photo => photo && photo.length > 0); // Remove empty strings

    // Handle bathroom - can be string or number
    let bathroom = 0;
    if (ad.bathroom !== null && ad.bathroom !== undefined) {
      if (typeof ad.bathroom === 'string') {
        bathroom = parseFloat(ad.bathroom) || 0;
      } else {
        bathroom = Number(ad.bathroom) || 0;
      }
    }

    // Extract landlordId from various possible formats
    let landlordId: number | undefined;
    if (ad.landlord) {
      if (typeof ad.landlord === 'object' && ad.landlord.id) {
        landlordId = Number(ad.landlord.id);
      } else if (typeof ad.landlord === 'number') {
        landlordId = Number(ad.landlord);
      }
    } else if (ad.landlordId) {
      landlordId = Number(ad.landlordId);
    } else if (ad.landlord_id) {
      landlordId = Number(ad.landlord_id);
    }

    const property: Property = {
      id: Number(ad.id) || 0,
      reference: ad.reference || ad.referenceNumber || `REF-${ad.id || Date.now()}`,
      description: ad.description || '',
      price: Number(ad.price) || 0,
      status: this.mapStatus(ad.status),
      type: ad.type || 'APARTMENT',
      isAvailable: ad.isAvailable !== undefined ? Boolean(ad.isAvailable) : (ad.status !== 'RENTED'),
      photos: photos,
      bathroom: bathroom,
      beds: Number(ad.beds) || Number(ad.bedrooms) || 0,
      constructionYear: Number(ad.constructionYear) || Number(ad.yearBuilt) || new Date().getFullYear(),
      garage: Number(ad.garage) || Number(ad.parkingSpaces) || 0,
      country: ad.country || '',
      city: ad.city || '',
      surfaceArea: Number(ad.surfaceArea) || Number(ad.area) || 0,
      address: ad.address || '',
      publicationDate: ad.publicationDate ? new Date(ad.publicationDate) : (ad.createdAt ? new Date(ad.createdAt) : new Date()),
      houseRules: ad.houseRules || '',
      viewCount: Number(ad.viewCount) || 0,
      landlordId: landlordId,
      rentPeriod: ad.rentPeriod || ad.rent_period || 'monthly',
      createdAt: ad.createdAt ? new Date(ad.createdAt) : new Date(),
      updatedAt: ad.updatedAt ? new Date(ad.updatedAt) : new Date()
    };

    return property;
  }

  /**
   * Map backend status to frontend PropertyStatus
   */
  private mapStatus(status: any): PropertyStatus {
    // Handle both string and enum object formats
    let statusStr = status;
    if (typeof status === 'object' && status !== null) {
      statusStr = status.toString();
    }
    if (typeof statusStr !== 'string') {
      statusStr = String(statusStr || '');
    }

    switch (statusStr.toUpperCase()) {
      case 'AVAILABLE':
        return PropertyStatus.AVAILABLE;
      case 'RENTED':
        return PropertyStatus.RENTED;
      case 'MAINTENANCE':
        return PropertyStatus.MAINTENANCE;
      case 'PENDING':
        return PropertyStatus.UNAVAILABLE;
      case 'ARCHIVED':
        return PropertyStatus.UNAVAILABLE;
      default:
        console.warn('Unknown status value:', status, 'defaulting to AVAILABLE');
        return PropertyStatus.AVAILABLE;
    }
  }

  /**
   * Create new property with photos upload
   */
  async createPropertyWithPhotos(formData: FormData): Promise<Property> {
    return firstValueFrom(
      this.http.post<Property>(`${this.apiUrl}/upload`, formData)
    );
  }

  /**
   * Create new property
   */
  createProperty(property: PropertyCreateRequest): Promise<Property> {
    return Promise.resolve({
      id: Date.now(),
      reference: `REF-${Date.now()}`,
      description: property.description,
      price: property.price,
      status: PropertyStatus.AVAILABLE,
      type: property.type,
      isAvailable: true,
      photos: property.images || [],
      bathroom: property.bathrooms,
      beds: property.bedrooms,
      constructionYear: new Date().getFullYear(),
      garage: property.parkingSpaces,
      country: property.country,
      city: property.city,
      surfaceArea: property.area,
      address: property.address,
      publicationDate: new Date(),
      houseRules: '',
      viewCount: 0,
      landlordId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Property);
  }

  /**
   * Update existing property
   */
  updateProperty(id: number, property: Partial<Property>): Promise<Property> {
    return Promise.resolve({ id, ...property } as Property);
  }

  /**
   * Delete property
   */
  async deleteProperty(id: number): Promise<void> {
    try {
      await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
    } catch (error: any) {
      console.error(`Error deleting property ${id}:`, error?.status || error?.message || error);
      throw error;
    }
  }

  /**
   * Mock properties data
   */
  private getMockProperties(): Property[] {
    return [
      {
        id: 1,
        reference: 'REF-2026-001',
        description: 'Beautiful 2-bedroom apartment in the heart of downtown with modern amenities',
        price: 2500,
        status: PropertyStatus.AVAILABLE,
        type: 'APARTMENT' as any,
        isAvailable: true,
        photos: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          'https://images.unsplash.com/photo-1502672260066-6bc35f0b52f6?w=800'
        ],
        bathroom: 2,
        beds: 2,
        constructionYear: 2020,
        garage: 1,
        country: 'USA',
        city: 'New York',
        surfaceArea: 85,
        address: '123 Main St',
        publicationDate: new Date('2025-12-01'),
        houseRules: 'No smoking. No pets. Quiet hours after 10 PM.',
        viewCount: 156,
        landlordId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        reference: 'REF-2026-002',
        description: 'Spacious 3-bedroom house with beautiful garden and modern kitchen',
        price: 3200,
        status: PropertyStatus.AVAILABLE,
        type: 'HOUSE' as any,
        isAvailable: true,
        photos: [
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
          'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800'
        ],
        bathroom: 3,
        beds: 3,
        constructionYear: 2018,
        garage: 2,
        country: 'USA',
        city: 'Los Angeles',
        surfaceArea: 150,
        address: '456 Oak Avenue',
        publicationDate: new Date('2025-12-15'),
        houseRules: 'Pets allowed with deposit. No smoking indoors.',
        viewCount: 203,
        landlordId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        reference: 'REF-2026-003',
        description: 'Luxury studio apartment with stunning city views and premium finishes',
        price: 1800,
        status: PropertyStatus.AVAILABLE,
        type: 'STUDIO' as any,
        isAvailable: true,
        photos: [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
        ],
        bathroom: 1,
        beds: 1,
        constructionYear: 2022,
        garage: 0,
        country: 'USA',
        city: 'San Francisco',
        surfaceArea: 45,
        address: '789 Market Street',
        publicationDate: new Date('2026-01-05'),
        houseRules: 'No smoking. No pets.',
        viewCount: 89,
        landlordId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }
}
