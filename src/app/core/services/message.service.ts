import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Message, MessageCreateRequest } from '../models/message.model';

@Injectable({
    providedIn: 'root'
})
export class MessageService {

    private apiUrl = `${environment.apiUrl}/messages`;

    constructor(private http: HttpClient) { }

    /**
     * Get messages for a user
     */
    async getMessages(userId: number): Promise<Message[]> {
        try {
            const messages = await firstValueFrom(this.http.get<Message[]>(`${this.apiUrl}/user/${userId}`));
            return messages || [];
        } catch (error: any) {
            // Handle 404, 403, 500 errors gracefully
            if (error?.status === 404) {
                console.warn(`Messages endpoint not found (404) for user ${userId}. Returning empty array.`);
            } else if (error?.status === 403) {
                console.warn(`Access denied (403) when fetching messages for user ${userId}.`);
            } else if (error?.status === 500) {
                console.warn(`Server error (500) when fetching messages for user ${userId}.`);
            } else {
                console.error(`Error fetching messages for user ${userId}:`, error?.status || error?.message || error);
            }
            return [];
        }
    }

    /**
     * Send a message
     */
    sendMessage(message: MessageCreateRequest): Promise<Message> {
        return firstValueFrom(this.http.post<Message>(this.apiUrl, message));
    }

    /**
     * Mark message as read
     */
    markAsRead(messageId: number): Promise<void> {
        return firstValueFrom(this.http.put<void>(`${this.apiUrl}/${messageId}/read`, {}));
    }

    /**
     * Get unread messages count
     */
    getUnreadCount(userId: number): Promise<number> {
        return firstValueFrom(this.http.get<number>(`${this.apiUrl}/user/${userId}/unread-count`));
    }
}
