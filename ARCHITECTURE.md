# RentManager - Frontend Architecture

## Project Overview

RentManager is a modern property rental management application built with Angular 20, featuring a clean and responsive UI with role-based access control.

## Technology Stack

- **Framework**: Angular 20
- **Language**: TypeScript 5.9
- **Styling**: CSS3 with custom design system
- **Routing**: Angular Router with Guards
- **State Management**: Angular Signals
- **Build Tool**: Angular CLI with esbuild

## Project Structure

```
src/app/
├── core/                          # Core functionality (singleton services, guards, interceptors)
│   ├── models/                    # TypeScript interfaces
│   │   ├── user.model.ts          # User, LoginRequest, RegisterRequest, AuthResponse
│   │   ├── property.model.ts      # Property, PropertyCreateRequest, PropertySearchCriteria
│   │   ├── payment.model.ts       # Payment, PaymentCreateRequest, PaymentSummary
│   │   ├── lease.model.ts         # Lease, LeaseCreateRequest
│   │   ├── maintenance.model.ts   # MaintenanceRequest, MaintenanceCreateRequest
│   │   └── index.ts              # Barrel exports
│   │
│   ├── services/                  # Business logic services
│   │   ├── auth.service.ts        # Authentication & authorization
│   │   ├── property.service.ts    # Property CRUD operations
│   │   ├── payment.service.ts     # Payment management
│   │   └── index.ts              # Barrel exports
│   │
│   ├── guards/                    # Route protection
│   │   ├── auth.guard.ts          # Protect routes requiring authentication
│   │   ├── role.guard.ts          # Protect routes based on user roles
│   │   └── index.ts              # Barrel exports
│   │
│   ├── interceptors/              # HTTP interceptors
│   │   ├── auth.interceptor.ts    # Add JWT token to requests
│   │   └── index.ts              # Barrel exports
│   │
│   └── index.ts                   # Core module barrel export
│
├── features/                      # Feature modules organized by user role
│   ├── admin/                     # Admin-specific features
│   │   ├── dashboard/
│   │   │   └── admin-dashboard.component.ts
│   │   ├── users/                 # User management (future)
│   │   ├── reports/               # System reports (future)
│   │   └── settings/              # System settings (future)
│   │
│   ├── landlord/                  # Landlord-specific features
│   │   ├── dashboard/
│   │   │   └── landlord-dashboard.component.ts
│   │   ├── properties/            # Property management (future)
│   │   ├── tenants/               # Tenant management (future)
│   │   └── payments/              # Payment tracking (future)
│   │
│   ├── tenant/                    # Tenant-specific features
│   │   ├── dashboard/
│   │   │   └── tenant-dashboard.component.ts
│   │   ├── payments/              # Pay rent (future)
│   │   └── maintenance/           # Submit maintenance requests (future)
│   │
│   └── public/                    # Public pages (home, properties, etc.)
│
├── shared/                        # Shared components, directives, pipes
│   └── components/                # Reusable UI components (future)
│
├── auth/                          # Authentication components
│   ├── login/
│   └── register/
│
├── [existing components]/         # Current public components
│   ├── home/
│   ├── properties/
│   ├── property-details/
│   ├── contact/
│   ├── about/
│   ├── header/
│   └── footer/
│
├── app.routes.ts                  # Application routing with guards
├── app.config.ts                  # App configuration (includes HTTP interceptors)
└── app.ts                         # Root component

src/environments/
├── environment.ts                 # Production environment config
└── environment.development.ts     # Development environment config
```

## Architecture Patterns

### 1. **Layered Architecture**
- **Presentation Layer**: Components (features/*)
- **Business Logic Layer**: Services (core/services/*)
- **Data Layer**: Models/Interfaces (core/models/*)

### 2. **Feature-Based Organization**
- Organized by user roles: admin, landlord, tenant
- Each role has its own feature module with dedicated routing
- Public features remain at root level for easy access

### 3. **Route Protection**
- **authGuard**: Ensures user is authenticated
- **roleGuard**: Ensures user has required role (ADMIN, LANDLORD, TENANT)
- Routes automatically redirect unauthorized users

### 4. **Security**
- JWT token-based authentication
- HTTP interceptor automatically adds token to API requests
- Automatic token refresh capability (ready for Spring Boot integration)
- Secure token storage in localStorage

## User Roles & Permissions

### ADMIN
- **Routes**: `/admin/*`
- **Access**: Full system access
- **Features**:
  - User management
  - System-wide reports and analytics
  - Platform configuration
  - All landlord and tenant features

### LANDLORD
- **Routes**: `/landlord/*`
- **Access**: Property management
- **Features**:
  - Manage owned properties
  - Track tenants and leases
  - View payment history
  - Handle maintenance requests
  - Financial reports for their properties

### TENANT
- **Routes**: `/tenant/*`
- **Access**: Rented property access
- **Features**:
  - View current property
  - Pay rent online
  - Submit maintenance requests
  - Browse available properties
  - Manage documents

## Spring Boot Integration (Future)

### API Endpoints Structure
```
Base URL: http://localhost:8080/api/v1

Auth:
- POST /auth/login
- POST /auth/register
- POST /auth/refresh
- POST /auth/logout

Properties:
- GET /properties
- GET /properties/{id}
- GET /properties/landlord/{landlordId}
- POST /properties
- PUT /properties/{id}
- DELETE /properties/{id}

Payments:
- GET /payments/tenant/{tenantId}
- GET /payments/landlord/{landlordId}
- POST /payments
- PUT /payments/{id}/process

Leases:
- GET /leases
- GET /leases/{id}
- POST /leases
- PUT /leases/{id}

Maintenance:
- GET /maintenance
- GET /maintenance/{id}
- POST /maintenance
- PUT /maintenance/{id}
```

### Data Models Alignment
All TypeScript interfaces in `core/models/` are designed to match Spring Boot entity structures:
- Enums match Java enums
- Field names follow camelCase (TypeScript) matching Java convention
- Date fields use JavaScript Date type (will be ISO strings in JSON)
- Optional fields use `?` to indicate nullable fields

### Authentication Flow
1. User enters credentials → Angular sends to Spring Boot `/auth/login`
2. Spring Boot validates → returns JWT token + user object
3. Angular stores token in localStorage via AuthService
4. authInterceptor adds `Authorization: Bearer {token}` to all API requests
5. Spring Boot validates token on each request
6. On 401 error → Angular redirects to login

## How to Use

### Protecting a Route
```typescript
{
  path: 'my-route',
  component: MyComponent,
  canActivate: [authGuard, roleGuard],
  data: { roles: [UserRole.LANDLORD, UserRole.ADMIN] }
}
```

### Using AuthService
```typescript
constructor(private authService: AuthService) {}

// Login
this.authService.login({ email, password, role })
  .then(response => {
    // User logged in, navigate to dashboard
    this.authService.navigateToDashboard();
  });

// Check authentication
if (this.authService.isLoggedIn()) {
  // User is authenticated
}

// Check role
if (this.authService.hasRole(UserRole.ADMIN)) {
  // User is admin
}

// Get current user
const user = this.authService.getCurrentUser();

// Logout
this.authService.logout();
```

### Using Services with Spring Boot API
```typescript
// When Spring Boot is ready, update services:
constructor(private http: HttpClient) {}

getProperties(): Observable<Property[]> {
  return this.http.get<Property[]>(`${environment.apiUrl}/properties`);
}
```

## Next Steps

### Immediate (UI Polish)
1. ✅ Enhanced button animations completed
2. ✅ Role-based architecture established
3. Create loading spinners
4. Add toast notifications

### Short Term (Functionality)
1. Implement real authentication with backend
2. Create property management pages for landlords
3. Create user management pages for admins
4. Add payment processing forms
5. Create maintenance request forms

### Long Term (Spring Boot Integration)
1. Set up Spring Boot backend with:
   - Spring Security + JWT
   - JPA entities matching TypeScript models
   - REST controllers for all endpoints
2. Update environment.ts with real API URL
3. Replace mock data in services with HTTP calls
4. Add error handling and loading states
5. Implement file upload for property images
6. Add real-time notifications (WebSocket)

## Technologies
- **Frontend**: Angular 19 (standalone components)
- **Backend** (Future): Spring Boot 3.x
- **Security**: JWT tokens
- **Database** (Future): PostgreSQL/MySQL with JPA
- **Styling**: Pure CSS with modern animations
