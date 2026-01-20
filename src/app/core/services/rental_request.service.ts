import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RentalRequest, RentalRequestCreateRequest, RentalRequestUpdateRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class RentalRequestService {

  private apiUrl = `${environment.apiUrl}/rental-requests`;

  constructor(private http: HttpClient) { }

  /**
   * Get rental requests for a landlord
   */
  async getRentalRequests(landlordId: number): Promise<RentalRequest[]> {
    try {
      const requests = await firstValueFrom(this.http.get<RentalRequest[]>(`${this.apiUrl}/landlord/${landlordId}`));
      return requests || [];
    } catch (error: any) {
      // Handle 404, 403, 500 errors gracefully
      if (error?.status === 404) {
        console.warn(`Rental requests endpoint not found (404) for landlord ${landlordId}. Returning empty array.`);
      } else if (error?.status === 403) {
        console.warn(`Access denied (403) when fetching rental requests for landlord ${landlordId}.`);
      } else if (error?.status === 500) {
        console.warn(`Server error (500) when fetching rental requests for landlord ${landlordId}.`);
      } else {
        console.error(`Error fetching rental requests for landlord ${landlordId}:`, error?.status || error?.message || error);
      }
      return [];
    }
  }

  /**
   * Get rental request by ID
   */
  async getRentalRequestById(id: number): Promise<RentalRequest | null> {
    try {
      const request = await firstValueFrom(this.http.get<RentalRequest>(`${this.apiUrl}/${id}`));
      return request;
    } catch (error: any) {
      if (error?.status === 404) {
        console.warn(`Rental request with ID ${id} not found (404).`);
      } else {
        console.error(`Error fetching rental request ${id}:`, error?.status || error?.message || error);
      }
      return null;
    }
  }

  /**
   * Create a new rental request
   */
  createRentalRequest(request: RentalRequestCreateRequest): Promise<RentalRequest> {
    return firstValueFrom(this.http.post<RentalRequest>(this.apiUrl, request));
  }

  /**
   * Update rental request status
   */
  updateRentalRequest(id: number, request: RentalRequestUpdateRequest): Promise<RentalRequest> {
    return firstValueFrom(this.http.put<RentalRequest>(`${this.apiUrl}/${id}`, request));
  }

  /**
   * Delete rental request
   */
  deleteRentalRequest(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }
}