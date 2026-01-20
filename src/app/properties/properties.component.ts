import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Property, PropertyType } from '../core/models/property.model';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './properties.component.html',
  styleUrl: './properties.component.css'
})
export class PropertiesComponent {
  searchQuery = '';
  selectedType = '';
  minPrice = '';
  maxPrice = '';
  bedrooms = '';
  viewMode: 'grid' | 'list' = 'grid';

  propertyTypes = ['Apartment', 'House', 'Villa', 'Studio', 'Condo', 'Townhouse'];

  properties: Property[] = [
    {
      id: 1,
      reference: 'REF-2026-001',
      description: 'Beautiful 2-bedroom apartment in the heart of downtown with modern amenities and stunning views',
      price: 2500,
      status: 'AVAILABLE' as any,
      type: PropertyType.APARTMENT,
      isAvailable: true,
      photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
      bathroom: 2,
      beds: 2,
      constructionYear: 2020,
      garage: 1,
      country: 'USA',
      city: 'New York',
      surfaceArea: 111,
      address: '123 Main Street',
      publicationDate: new Date('2025-12-01'),
      houseRules: 'No smoking. No pets.',
      viewCount: 156,
      featured: true
    },
    {
      id: 2,
      reference: 'REF-2026-002',
      description: 'Spacious 4-bedroom family house with beautiful garden and modern kitchen',
      price: 3200,
      status: 'AVAILABLE' as any,
      type: PropertyType.HOUSE,
      isAvailable: true,
      photos: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
      bathroom: 3,
      beds: 4,
      constructionYear: 2018,
      garage: 2,
      country: 'USA',
      city: 'Los Angeles',
      surfaceArea: 232,
      address: '456 Oak Avenue',
      publicationDate: new Date('2025-12-05'),
      houseRules: 'Pets allowed with deposit. No smoking indoors.',
      viewCount: 203,
      featured: true
    },
    {
      id: 3,
      reference: 'REF-2026-003',
      description: 'Luxury 5-bedroom beachfront villa with private pool and ocean views',
      price: 5500,
      status: 'AVAILABLE' as any,
      type: PropertyType.VILLA,
      isAvailable: true,
      photos: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
      bathroom: 4,
      beds: 5,
      constructionYear: 2021,
      garage: 3,
      country: 'USA',
      city: 'Miami',
      surfaceArea: 371,
      address: '789 Ocean Drive',
      publicationDate: new Date('2025-12-10'),
      houseRules: 'No smoking. Pets negotiable.',
      viewCount: 389,
      featured: true
    },
    {
      id: 4,
      reference: 'REF-2026-004',
      description: 'Modern urban studio loft in the art district with exposed brick and high ceilings',
      price: 1400,
      status: 'AVAILABLE' as any,
      type: PropertyType.STUDIO,
      isAvailable: true,
      photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
      bathroom: 1,
      beds: 1,
      constructionYear: 2019,
      garage: 0,
      country: 'USA',
      city: 'Chicago',
      surfaceArea: 55,
      address: '321 Art District',
      publicationDate: new Date('2025-12-15'),
      houseRules: 'No smoking. No pets.',
      viewCount: 127,
      featured: false
    },
    {
      id: 5,
      reference: 'REF-2026-005',
      description: 'Elegant 3-bedroom city apartment with park views and luxury finishes',
      price: 2800,
      status: 'AVAILABLE' as any,
      type: PropertyType.APARTMENT,
      isAvailable: true,
      photos: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
      bathroom: 2,
      beds: 3,
      constructionYear: 2020,
      garage: 1,
      country: 'USA',
      city: 'Boston',
      surfaceArea: 167,
      address: '555 Park Lane',
      publicationDate: new Date('2025-12-20'),
      houseRules: 'No smoking. Small pets allowed.',
      viewCount: 98,
      featured: false
    },
    {
      id: 6,
      reference: 'REF-2026-006',
      description: 'Spacious 3-bedroom townhouse with modern design and private garden',
      price: 3500,
      status: 'AVAILABLE' as any,
      type: PropertyType.HOUSE,
      isAvailable: true,
      photos: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
      bathroom: 2,
      beds: 3,
      constructionYear: 2019,
      garage: 2,
      country: 'USA',
      city: 'Seattle',
      surfaceArea: 204,
      address: '888 Garden Street',
      publicationDate: new Date('2025-12-22'),
      houseRules: 'No smoking. Pets allowed.',
      viewCount: 145,
      featured: false
    },
    {
      id: 7,
      reference: 'REF-2026-007',
      description: 'Minimalist modern 2-bedroom flat with sleek design and city views',
      price: 3100,
      status: 'AVAILABLE' as any,
      type: PropertyType.APARTMENT,
      isAvailable: true,
      photos: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'],
      bathroom: 1,
      beds: 2,
      constructionYear: 2022,
      garage: 1,
      country: 'USA',
      city: 'San Francisco',
      surfaceArea: 88,
      address: '222 Design Blvd',
      publicationDate: new Date('2025-12-25'),
      houseRules: 'No smoking. No pets.',
      viewCount: 176,
      featured: false
    },
    {
      id: 8,
      reference: 'REF-2026-008',
      description: 'Charming 3-bedroom suburban home with large backyard and cozy interior',
      price: 2200,
      status: 'AVAILABLE' as any,
      type: PropertyType.HOUSE,
      isAvailable: true,
      photos: ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800'],
      bathroom: 2,
      beds: 3,
      constructionYear: 2017,
      garage: 2,
      country: 'USA',
      city: 'Denver',
      surfaceArea: 148,
      address: '444 Maple Road',
      publicationDate: new Date('2026-01-01'),
      houseRules: 'No smoking. Pets allowed with deposit.',
      viewCount: 211,
      featured: false
    }
  ];

  get filteredProperties(): Property[] {
    return this.properties.filter(property => {
      const matchesSearch = !this.searchQuery || 
        property.reference.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        property.address.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        property.city.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesType = !this.selectedType || property.type === this.selectedType;
      
      const matchesMinPrice = !this.minPrice || property.price >= Number(this.minPrice);
      const matchesMaxPrice = !this.maxPrice || property.price <= Number(this.maxPrice);
      
      const matchesBedrooms = !this.bedrooms || property.beds >= Number(this.bedrooms);

      return matchesSearch && matchesType && matchesMinPrice && matchesMaxPrice && matchesBedrooms;
    });
  }

  get featuredProperties(): Property[] {
    return this.properties.filter(p => p.featured);
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedType = '';
    this.minPrice = '';
    this.maxPrice = '';
    this.bedrooms = '';
  }

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  applySearch() {
    // The filtering is already reactive through filteredProperties getter
    // This method can be used for additional search actions if needed
    console.log('Searching for:', this.searchQuery);
  }

  toggleFavorite(propertyId: number) {
    // Toggle favorite status - would typically update backend
    alert(`Favorite toggled for property ID: ${propertyId}. This feature will be fully implemented with backend integration.`);
  }
}
