import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Payment, PaymentCreateRequest, PaymentSummary } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  /**
   * Get all payments for a tenant
   */
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) { }

  /**
   * Get all payments for a tenant
   */
  getPaymentsByTenant(tenantId: number): Promise<Payment[]> {
    return firstValueFrom(this.http.get<Payment[]>(`${this.apiUrl}/tenant/${tenantId}`));
  }

  /**
   * Get all payments for a landlord
   */
  async getPaymentsByLandlord(landlordId: number): Promise<Payment[]> {
    try {
      const payments = await firstValueFrom(this.http.get<Payment[]>(`${this.apiUrl}/landlord/${landlordId}`));
      return payments || [];
    } catch (error: any) {
      // Handle 500, 404, 403 errors gracefully
      if (error?.status === 500) {
        console.warn(`Server error (500) when fetching payments for landlord ${landlordId}. Backend may be experiencing issues.`);
      } else if (error?.status === 404) {
        console.warn(`Payments endpoint not found (404) for landlord ${landlordId}. Returning empty array.`);
      } else if (error?.status === 403) {
        console.warn(`Access denied (403) when fetching payments for landlord ${landlordId}.`);
      } else {
        console.error(`Error fetching payments for landlord ${landlordId}:`, error?.status || error?.message || error);
      }
      return [];
    }
  }

  /**
   * Get payment summary for a user
   */
  async getPaymentSummary(userId: number, isLandlord: boolean = false): Promise<PaymentSummary> {
    try {
      return await firstValueFrom(this.http.get<PaymentSummary>(`${this.apiUrl}/summary/${userId}?isLandlord=${isLandlord}`));
    } catch (error: any) {
      // Return default summary on error
      if (error?.status === 404) {
        console.warn(`Payment summary endpoint not found (404) for user ${userId}. Returning default summary.`);
      } else {
        console.error(`Error fetching payment summary for user ${userId}:`, error?.status || error?.message || error);
      }
      return {
        totalPaid: 0,
        totalPending: 0,
        totalOverdue: 0,
        paymentsCount: 0
      };
    }
  }

  /**
   * Create new payment
   */
  createPayment(payment: PaymentCreateRequest): Promise<Payment> {
    return firstValueFrom(this.http.post<Payment>(this.apiUrl, payment));
  }

  /**
   * Process payment
   */
  processPayment(paymentId: number): Promise<Payment> {
    return firstValueFrom(this.http.post<Payment>(`${this.apiUrl}/${paymentId}/process`, {}));
  }
}
