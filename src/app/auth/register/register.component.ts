import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  selectedRole: 'tenant' | 'landlord' = 'tenant';
  username = '';
  email = '';
  phone = '';
  gender = '';
  password = '';
  confirmPassword = '';
  agreeTerms = false;
  errorMessage = '';
  isLoading = false;
  
  // Tenant specific
  idCardNumber = '';
  
  // Landlord specific
  siret = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['role'] && params['role'] !== 'admin') {
        this.selectedRole = params['role'];
      }
    });
  }

  selectRole(role: 'tenant' | 'landlord') {
    this.selectedRole = role;
  }

  onSubmit() {
    if (!this.username || !this.email || !this.password) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match!';
      return;
    }

    if (!this.agreeTerms) {
      this.errorMessage = 'Please accept the terms and conditions';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const userRole = this.selectedRole === 'landlord' ? UserRole.LANDLORD : UserRole.TENANT;

    this.authService.register({
      username: this.username,
      email: this.email,
      password: this.password,
      phone: this.phone,
      gender: this.gender,
      role: userRole,
      idCardNumber: this.selectedRole === 'tenant' ? this.idCardNumber : undefined,
      siret: this.selectedRole === 'landlord' ? this.siret : undefined
    }).subscribe({
      next: () => {
        this.authService.navigateToDashboard();
      },
      error: (error) => {
        this.errorMessage = error || 'Registration failed. Please try again.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
