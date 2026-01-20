export enum UserRole {
  ADMIN = 'ADMIN',
  LANDLORD = 'LANDLORD',
  TENANT = 'TENANT'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export interface User {
  id: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  gender?: string;
  role: UserRole;
  status?: UserStatus;
  isActive?: boolean;
  profileImage?: string;
  registrationDate?: string;
  createdAt?: Date;
  updatedAt?: Date;
  // View properties
  initials?: string;
  rent?: number;
  property?: string;
  paymentStatus?: string;
  leaseStart?: Date;
  leaseEnd?: Date;
  deposit?: number;
  name?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  expectedRole?: UserRole;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone?: string;
  gender?: string;
  role: UserRole;
  idCardNumber?: string;
  siret?: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  role: UserRole;
  userId: number;
}