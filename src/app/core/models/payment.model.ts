export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PAYPAL = 'PAYPAL',
  CASH = 'CASH'
}

export interface Payment {
  id: number;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  tenantId: number;
  landlordId: number;
  propertyId: number;
  dueDate: Date;
  paidDate?: Date;
  description: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
  // View properties
  property?: string;
  tenantName?: string;
}

export interface PaymentCreateRequest {
  tenantId: number;
  amount: number;
  method: PaymentMethod;
  propertyId: number;
  dueDate: Date;
  description: string;
}

export interface PaymentSummary {
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  paymentsCount: number;
}
