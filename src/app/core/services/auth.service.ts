import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { User, UserRole, LoginRequest, RegisterRequest, AuthResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';
  private readonly API_URL = environment.apiUrl;

  currentUser = signal<User | null>(this.getUserFromStorage());
  isAuthenticated = signal<boolean>(this.hasToken());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.API_URL + '/auth/login', credentials).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        console.error('Login error:', error);
        // Handle different error response formats from backend
        let errorMessage = 'Login failed. Please try again.';
        
        if (error.error) {
          // Check for common backend error message formats
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.error) {
            errorMessage = error.error.error;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Handle specific HTTP status codes
        if (error.status === 401) {
          errorMessage = 'Invalid username, password, or role. Please check your credentials.';
        } else if (error.status === 403) {
          errorMessage = error.error?.error || error.error?.message || 'Access denied. Invalid role selected.';
        } else if (error.status === 0) {
          errorMessage = 'Cannot connect to server. Please check your connection.';
        }
        
        return throwError(() => errorMessage);
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.API_URL + '/auth/register', userData).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        console.error('Register error:', error);
        return throwError(() => error.error?.error || 'Registration failed');
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    const user = this.currentUser();
    // Ensure role is normalized when retrieving (but don't update signal to avoid loops)
    if (user && user.role && typeof user.role === 'string') {
      const roleUpper = user.role.toUpperCase();
      if (roleUpper === 'ADMIN') {
        user.role = UserRole.ADMIN;
      } else if (roleUpper === 'LANDLORD') {
        user.role = UserRole.LANDLORD;
      } else if (roleUpper === 'TENANT') {
        user.role = UserRole.TENANT;
      }
    }
    return user;
  }
  
  /**
   * Refresh user data from storage and normalize role
   */
  refreshUser(): void {
    const user = this.getUserFromStorage();
    if (user) {
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
    }
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.role) {
      return false;
    }
    // Direct enum comparison
    return user.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.role) {
      console.warn('hasAnyRole: User or role is missing', { user, roles });
      return false;
    }
    
    // Normalize user role to enum value
    let userRoleValue: UserRole;
    if (typeof user.role === 'string') {
      const roleUpper = user.role.toUpperCase();
      if (roleUpper === 'ADMIN') {
        userRoleValue = UserRole.ADMIN;
      } else if (roleUpper === 'LANDLORD') {
        userRoleValue = UserRole.LANDLORD;
      } else if (roleUpper === 'TENANT') {
        userRoleValue = UserRole.TENANT;
      } else {
        console.warn('hasAnyRole: Unknown role value', user.role);
        return false;
      }
    } else {
      userRoleValue = user.role;
    }
    
    // Check if user's role is in the required roles array
    return roles.includes(userRoleValue);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);

    // Normalize role to ensure it matches enum values
    let normalizedRole: UserRole = response.role;
    if (typeof response.role === 'string') {
      const roleUpper = response.role.toUpperCase();
      if (roleUpper === 'ADMIN') {
        normalizedRole = UserRole.ADMIN;
      } else if (roleUpper === 'LANDLORD') {
        normalizedRole = UserRole.LANDLORD;
      } else if (roleUpper === 'TENANT') {
        normalizedRole = UserRole.TENANT;
      }
    }

    const user: User = {
      id: response.userId,
      username: response.username,
      email: response.email,
      role: normalizedRole,
      isActive: true,
      registrationDate: new Date().toISOString()
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }

  private loadUserFromStorage(): void {
    const user = this.getUserFromStorage();
    if (user) {
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
    }
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        // Ensure role is properly set as enum value
        if (user.role && typeof user.role === 'string') {
          // Convert string role to enum if needed
          const roleUpper = user.role.toUpperCase();
          if (roleUpper === 'ADMIN') {
            user.role = UserRole.ADMIN;
          } else if (roleUpper === 'LANDLORD') {
            user.role = UserRole.LANDLORD;
          } else if (roleUpper === 'TENANT') {
            user.role = UserRole.TENANT;
          }
        }
        return user;
      } catch {
        return null;
      }
    }
    return null;
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  navigateToDashboard(): void {
    const user = this.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    switch (user.role) {
      case UserRole.ADMIN:
        this.router.navigate(['/admin/dashboard']);
        break;
      case UserRole.LANDLORD:
        this.router.navigate(['/landlord/dashboard']);
        break;
      case UserRole.TENANT:
        this.router.navigate(['/tenant/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}
