import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { User, UserRole } from '../core/models/user.model';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  editProfileForm!: FormGroup;
  currentUser: User | null = null;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.editProfileForm = this.fb.group({
      firstName: [this.currentUser.firstName, [Validators.required, Validators.minLength(2)]],
      lastName: [this.currentUser.lastName, [Validators.required, Validators.minLength(2)]],
      email: [this.currentUser.email, [Validators.required, Validators.email]],
      phone: [this.currentUser.phoneNumber || '', [Validators.pattern(/^\+?[\d\s-()]+$/)]],
      currentPassword: [''],
      newPassword: ['', [Validators.minLength(6)]],
      confirmPassword: ['']
    });
  }

  onSubmit() {
    if (this.editProfileForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    const formValue = this.editProfileForm.value;

    // Check if passwords match when changing password
    if (formValue.newPassword && formValue.newPassword !== formValue.confirmPassword) {
      this.errorMessage = 'New passwords do not match.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Simulate API call
    setTimeout(() => {
      // Update user data (in a real app, this would be an API call)
      if (this.currentUser) {
        this.currentUser.firstName = formValue.firstName;
        this.currentUser.lastName = formValue.lastName;
        this.currentUser.email = formValue.email;
        this.currentUser.phoneNumber = formValue.phone;

        // Update in auth service
        this.authService.currentUser.set(this.currentUser);
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      }

      this.isSubmitting = false;
      this.successMessage = 'Profile updated successfully!';
      
      // Clear password fields
      this.editProfileForm.patchValue({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Redirect to profile after 2 seconds
      setTimeout(() => {
        this.router.navigate(['/profile']);
      }, 2000);
    }, 1500);
  }

  onCancel() {
    this.router.navigate(['/profile']);
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
