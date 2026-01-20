export interface Message {
    id: number;
    senderId: number;
    receiverId: number;
    senderName: string;
    senderInitials?: string;
    senderRole?: 'LANDLORD' | 'TENANT' | 'ADMIN';
    subject: string;
    content: string;
    sentAt: Date;
    read: boolean;
    propertyId?: number;
    propertyReference?: string;
}

export interface MessageCreateRequest {
    receiverId: number;
    subject: string;
    content: string;
    propertyId?: number;
}
