import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { PropertiesComponent } from './properties/properties.component';
import { PropertyDetailsComponent } from './property-details/property-details.component';
import { ContactComponent } from './contact/contact.component';
import { AboutComponent } from './about/about.component';
import { ProfileComponent } from './profile/profile.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { authGuard, roleGuard } from './core/guards';
import { UserRole } from './core/models';
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard.component';
import { LandlordDashboardComponent } from './features/landlord/dashboard/landlord-dashboard.component';
import { TenantDashboardComponent } from './features/tenant/dashboard/tenant-dashboard.component';

export const routes: Routes = [
  // Public routes
  { 
    path: '', 
    component: HomeComponent 
  },
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'register', 
    component: RegisterComponent 
  },
  { 
    path: 'properties', 
    component: PropertiesComponent 
  },
  { 
    path: 'property/:id', 
    component: PropertyDetailsComponent 
  },
  { 
    path: 'contact', 
    component: ContactComponent 
  },
  { 
    path: 'about', 
    component: AboutComponent 
  },

  // Protected user profile routes
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'edit-profile', 
    component: EditProfileComponent,
    canActivate: [authGuard]
  },

  // Admin routes - Protected by role guard
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMIN] },
    children: [
      {
        path: 'dashboard',
        component: AdminDashboardComponent
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Landlord routes - Protected by role guard
  {
    path: 'landlord',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.LANDLORD] },
    children: [
      {
        path: 'dashboard',
        component: LandlordDashboardComponent
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Tenant routes - Protected by role guard
  {
    path: 'tenant',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.TENANT] },
    children: [
      {
        path: 'dashboard',
        component: TenantDashboardComponent
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Fallback routes
  { 
    path: 'unauthorized', 
    component: HomeComponent // TODO: Create unauthorized component
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];

