export enum MaintenanceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum MaintenancePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface MaintenanceRequest {
  id: number;
  propertyId: number;
  tenantId: number;
  landlordId: number;
  title: string;
  description: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  category: string; // "Plumbing", "Electrical", "Appliance", etc.
  images?: string[];
  assignedTo?: string; // Maintenance staff name
  estimatedCost?: number;
  actualCost?: number;
  scheduledDate?: Date;
  completedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  // View properties
  property?: string;
  tenant?: string;
  date?: Date;
}

export interface MaintenanceCreateRequest {
  tenantId: number;
  propertyId: number;
  title: string;
  description: string;
  priority: MaintenancePriority;
  category: string;
  images?: string[];
}
