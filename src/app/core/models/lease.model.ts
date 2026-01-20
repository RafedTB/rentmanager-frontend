export enum LeaseStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
  PENDING = 'PENDING'
}

export interface Lease {
  id: number;
  propertyId: number;
  tenantId: number;
  landlordId: number;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  securityDeposit: number;
  status: LeaseStatus;
  terms?: string;
  documentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaseCreateRequest {
  propertyId: number;
  tenantId: number;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  securityDeposit: number;
  terms?: string;
}
