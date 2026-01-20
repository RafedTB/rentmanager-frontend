import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  selectedRole: 'tenant' | 'landlord' | 'admin' = 'tenant';
  username = '';
  password = '';
  rememberMe = false;
  errorMessage = '';
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['role']) {
        this.selectedRole = params['role'];
      }
    });
  }

  selectRole(role: 'tenant' | 'landlord' | 'admin') {
    this.selectedRole = role;
  }

  private getExpectedUserRole(): UserRole {
    switch (this.selectedRole) {
      case 'admin': return UserRole.ADMIN;
      case 'landlord': return UserRole.LANDLORD;
      case 'tenant': return UserRole.TENANT;
      default: return UserRole.TENANT;
    }
  }

  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const expectedRole = this.getExpectedUserRole();

    this.authService.login({
      username: this.username,
      password: this.password,
      expectedRole: expectedRole
    }).subscribe({
      next: (response) => {
        // Client-side role validation as additional security
        if (response.role !== expectedRole) {
          this.authService.logout();
          this.errorMessage = `Invalid role selected. You are registered as ${response.role.toLowerCase()}, not ${this.selectedRole}.`;
          this.isLoading = false;
          return;
        }
        this.authService.navigateToDashboard();
      },
      error: (error) => {
        this.errorMessage = error || 'Login failed. Please check your credentials.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
