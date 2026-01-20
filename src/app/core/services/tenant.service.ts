import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class TenantService {

    private apiUrl = `${environment.apiUrl}/tenants`;

    constructor(private http: HttpClient) { }

    /**
     * Get all tenants for a landlord
     */
    async getTenantsByLandlord(landlordId: number): Promise<User[]> {
        try {
            const tenants = await firstValueFrom(this.http.get<User[]>(`${this.apiUrl}/landlord/${landlordId}`));
            return tenants || [];
        } catch (error: any) {
            // Handle 403, 404, 500 errors gracefully
            if (error?.status === 403) {
                console.warn(`Access denied (403) when fetching tenants for landlord ${landlordId}. This may be a backend permission issue.`);
            } else if (error?.status === 404) {
                console.warn(`Tenants endpoint not found (404) for landlord ${landlordId}. Returning empty array.`);
            } else {
                console.error(`Error fetching tenants for landlord ${landlordId}:`, error?.status || error?.message || error);
            }
            return [];
        }
    }

    /**
     * Get tenant details
     */
    async getTenantDetails(tenantId: number): Promise<User | null> {
        try {
            return await firstValueFrom(this.http.get<User>(`${this.apiUrl}/${tenantId}`));
        } catch (error: any) {
            console.error(`Error fetching tenant details for ID ${tenantId}:`, error?.status || error?.message || error);
            return null;
        }
    }
}
