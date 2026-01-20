import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { User, UserRole } from '../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  UserRole = UserRole; // Expose enum to template

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
  }

  getRoleBadgeClass(): string {
    if (!this.currentUser) return '';
    
    switch (this.currentUser.role) {
      case UserRole.ADMIN:
        return 'badge-admin';
      case UserRole.LANDLORD:
        return 'badge-landlord';
      case UserRole.TENANT:
        return 'badge-tenant';
      default:
        return '';
    }
  }

  getRoleDisplayName(): string {
    if (!this.currentUser) return '';
    return this.currentUser.role.charAt(0).toUpperCase() + this.currentUser.role.slice(1);
  }
}
