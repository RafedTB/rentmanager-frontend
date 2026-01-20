import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MaintenanceRequest, MaintenanceCreateRequest } from '../models/maintenance.model';

@Injectable({
    providedIn: 'root'
})
export class MaintenanceService {

    private apiUrl = `${environment.apiUrl}/maintenance`;

    constructor(private http: HttpClient) { }

    /**
     * Get all maintenance requests for a landlord
     */
    async getMaintenanceRequestsByLandlord(landlordId: number): Promise<MaintenanceRequest[]> {
        try {
            const requests = await firstValueFrom(this.http.get<MaintenanceRequest[]>(`${this.apiUrl}/landlord/${landlordId}`));
            return requests || [];
        } catch (error: any) {
            // Handle 404, 403, 500 errors gracefully
            if (error?.status === 404) {
                console.warn(`Maintenance endpoint not found (404) for landlord ${landlordId}. Returning empty array.`);
            } else if (error?.status === 403) {
                console.warn(`Access denied (403) when fetching maintenance requests for landlord ${landlordId}.`);
            } else if (error?.status === 500) {
                console.warn(`Server error (500) when fetching maintenance requests for landlord ${landlordId}.`);
            } else {
                console.error(`Error fetching maintenance requests for landlord ${landlordId}:`, error?.status || error?.message || error);
            }
            return [];
        }
    }

    /**
     * Create new maintenance request
     */
    createMaintenanceRequest(request: MaintenanceCreateRequest): Promise<MaintenanceRequest> {
        return firstValueFrom(this.http.post<MaintenanceRequest>(this.apiUrl, request));
    }

    /**
     * Update maintenance status
     */
    updateMaintenanceStatus(requestId: number, status: string): Promise<MaintenanceRequest> {
        return firstValueFrom(this.http.patch<MaintenanceRequest>(`${this.apiUrl}/${requestId}/status`, { status }));
    }
}
