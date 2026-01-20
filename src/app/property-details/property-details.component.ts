import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Property, PropertyType, PropertyStatus } from '../core/models/property.model';

@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './property-details.component.html',
  styleUrl: './property-details.component.css'
})
export class PropertyDetailsComponent implements OnInit {
  property: Property | null = null;
  selectedImageIndex = 0;
  showMessageModal = false;
  
  messageForm = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };

  // Mock data - In real app, this would come from a service
  private properties: Property[] = [
    {
      id: 1,
      reference: 'REF-2026-001',
      description: 'Beautiful modern apartment in the heart of downtown. Features stunning city views, hardwood floors, and high-end finishes throughout. Walking distance to shops, restaurants, and public transportation. Perfect for professionals or small families.',
      price: 2500,
      status: PropertyStatus.AVAILABLE,
      type: PropertyType.APARTMENT,
      isAvailable: true,
      photos: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        'https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800'
      ],
      bathroom: 2,
      beds: 2,
      constructionYear: 2020,
      garage: 1,
      country: 'USA',
      city: 'New York',
      surfaceArea: 111,
      address: '123 Main Street',
      publicationDate: new Date('2025-12-01'),
      houseRules: 'No smoking. No pets. Quiet hours after 10 PM. Pet Friendly building with pet deposit.',
      viewCount: 156
    },
    {
      id: 2,
      reference: 'REF-2026-002',
      description: 'Spacious family home with large backyard in a quiet neighborhood. Updated kitchen with granite countertops, master suite with walk-in closet, and plenty of natural light. Great schools nearby and close to parks.',
      price: 3200,
      status: PropertyStatus.AVAILABLE,
      type: PropertyType.HOUSE,
      isAvailable: true,
      photos: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
      ],
      bathroom: 3,
      beds: 4,
      constructionYear: 2018,
      garage: 2,
      country: 'USA',
      city: 'Los Angeles',
      surfaceArea: 232,
      address: '456 Oak Avenue',
      publicationDate: new Date('2025-12-05'),
      houseRules: 'No smoking indoors. Pets allowed with deposit. Keep backyard maintained.',
      viewCount: 203
    },
    {
      id: 3,
      reference: 'REF-2026-003',
      description: 'Stunning beachfront villa with panoramic ocean views. Features luxurious finishes, private pool, and direct beach access. Perfect for entertaining with spacious living areas and gourmet kitchen. Live the luxury lifestyle you deserve.',
      price: 5500,
      status: PropertyStatus.AVAILABLE,
      type: PropertyType.VILLA,
      isAvailable: true,
      photos: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
        'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800'
      ],
      bathroom: 4,
      beds: 5,
      constructionYear: 2021,
      garage: 3,
      country: 'USA',
      city: 'Miami',
      surfaceArea: 371,
      address: '789 Ocean Drive',
      publicationDate: new Date('2025-12-10'),
      houseRules: 'No smoking. No large parties. Respect neighbors. Pool maintenance included.',
      viewCount: 389
    }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.property = this.properties.find(p => p.id === id) || null;
    });
  }

  selectImage(index: number) {
    this.selectedImageIndex = index;
  }

  reserveProperty() {
    if (this.property && this.property.status === 'AVAILABLE') {
      alert('Reserve Request submitted! The landlord will contact you shortly to confirm your reservation.');
    }
  }

  sendMessage() {
    this.showMessageModal = true;
  }

  closeMessageModal() {
    this.showMessageModal = false;
    this.resetMessageForm();
  }

  submitMessage() {
    if (!this.messageForm.name || !this.messageForm.email || !this.messageForm.message) {
      alert('Please fill in all required fields (Name, Email, and Message)');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.messageForm.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // In a real app, this would send the message via API
    console.log('Message to landlord:', {
      property: this.property?.reference,
      ...this.messageForm
    });

    alert('Message sent successfully! The landlord will contact you soon.');
    this.closeMessageModal();
  }

  resetMessageForm() {
    this.messageForm = {
      name: '',
      email: '',
      phone: '',
      message: ''
    };
  }
}
