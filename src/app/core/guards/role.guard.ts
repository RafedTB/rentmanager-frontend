import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';

/**
 * Guard to protect routes based on user roles
 * Usage: 
 * { 
 *   path: 'admin', 
 *   component: AdminComponent, 
 *   canActivate: [roleGuard],
 *   data: { roles: [UserRole.ADMIN] }
 * }
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get roles from route data (check both current route and parent route for child routes)
  const requiredRoles = (route.data?.['roles'] || route.parent?.data?.['roles']) as UserRole[];
  
  if (!requiredRoles || requiredRoles.length === 0) {
    console.warn('Role guard: No required roles specified for route:', state.url);
    return true; // Allow access if no roles specified
  }
  
  if (!authService.isLoggedIn()) {
    router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }

  const user = authService.getCurrentUser();
  if (!user || !user.role) {
    console.warn('Role guard: User has no role');
    // User exists but no role - logout and redirect to login
    authService.logout();
    router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }

  // Check if user has any of the required roles
  if (authService.hasAnyRole(requiredRoles)) {
    return true;
  }

  // User doesn't have required role - redirect to their appropriate dashboard
  // This provides better UX than just showing unauthorized
  console.warn(`Role guard: User with role '${user.role}' does not have required roles:`, requiredRoles);
  switch (user.role) {
    case UserRole.ADMIN:
      router.navigate(['/admin/dashboard']);
      break;
    case UserRole.LANDLORD:
      router.navigate(['/landlord/dashboard']);
      break;
    case UserRole.TENANT:
      router.navigate(['/tenant/dashboard']);
      break;
    default:
      router.navigate(['/unauthorized']);
  }
  return false;
};
