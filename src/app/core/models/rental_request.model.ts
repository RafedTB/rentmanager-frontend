export enum RentalRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export interface RentalRequest {
  id: number;
  propertyId: number;
  tenantId: number;
  landlordId: number;
  status: RentalRequestStatus;
  message?: string;
  requestedDate: Date;
  responseDate?: Date;
  responseMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RentalRequestCreateRequest {
  propertyId: number;
  tenantId: number;
  message?: string;
}

export interface RentalRequestUpdateRequest {
  status: RentalRequestStatus;
  responseMessage?: string;
}