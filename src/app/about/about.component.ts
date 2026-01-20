import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  stats = [
    { number: '10,000+', label: 'Properties Listed' },
    { number: '5,000+', label: 'Happy Landlords' },
    { number: '15,000+', label: 'Active Tenants' },
    { number: '98%', label: 'Satisfaction Rate' }
  ];

  team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      bio: 'Former real estate professional with 15 years of experience.'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      bio: 'Tech innovator passionate about solving real estate challenges.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Customer Success',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      bio: 'Dedicated to ensuring the best experience for our users.'
    },
    {
      name: 'David Williams',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      bio: 'Operations expert with a focus on efficiency and scalability.'
    }
  ];

  values = [
    {
      icon: 'trust',
      title: 'Trust & Transparency',
      description: 'We build trust through transparent practices and honest communication with all our users.'
    },
    {
      icon: 'innovation',
      title: 'Innovation',
      description: 'We constantly innovate to provide cutting-edge solutions for property management.'
    },
    {
      icon: 'support',
      title: 'Customer First',
      description: 'Our users are at the heart of everything we do. Their success is our success.'
    },
    {
      icon: 'quality',
      title: 'Quality Service',
      description: 'We strive for excellence in every aspect of our platform and service delivery.'
    }
  ];
}
