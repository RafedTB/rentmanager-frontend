import { Component, OnInit, effect } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { User, UserRole } from '../core/models';

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  senderRole: UserRole;
  receiverId: number;
  receiverName: string;
  receiverRole: UserRole;
  content: string;
  timestamp: Date;
  read: boolean;
}

interface Conversation {
  userId: number;
  userName: string;
  userRole: UserRole;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: Message[];
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  isLoggedIn = false;
  UserRole = UserRole; // Expose enum to template
  
  // Messaging properties
  showMessagesModal = false;
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  newMessage = '';
  unreadMessagesCount = 0;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // React to authentication state changes
    effect(() => {
      const user = this.authService.currentUser();
      this.currentUser = user;
      this.isLoggedIn = user !== null;
    });
  }

  ngOnInit() {
    // Initial load
    this.currentUser = this.authService.getCurrentUser();
    this.isLoggedIn = this.authService.isLoggedIn();
    this.loadConversations();
  }

  loadConversations() {
    if (!this.currentUser) return;

    // Mock conversations - In real app, fetch from API based on user role
    if (this.currentUser.role === UserRole.ADMIN) {
      // Admin sees all conversations
      this.conversations = [
        {
          userId: 2,
          userName: 'John Smith (Landlord)',
          userRole: UserRole.LANDLORD,
          lastMessage: 'The property inspection went well',
          lastMessageTime: new Date('2026-01-10T10:30:00'),
          unreadCount: 2,
          messages: [
            {
              id: 1,
              senderId: 2,
              senderName: 'John Smith',
              senderRole: UserRole.LANDLORD,
              receiverId: 1,
              receiverName: 'Admin',
              receiverRole: UserRole.ADMIN,
              content: 'Hello, I need assistance with property verification',
              timestamp: new Date('2026-01-10T09:00:00'),
              read: true
            },
            {
              id: 2,
              senderId: 1,
              senderName: 'Admin',
              senderRole: UserRole.ADMIN,
              receiverId: 2,
              receiverName: 'John Smith',
              receiverRole: UserRole.LANDLORD,
              content: 'Sure! What do you need help with?',
              timestamp: new Date('2026-01-10T09:15:00'),
              read: true
            },
            {
              id: 3,
              senderId: 2,
              senderName: 'John Smith',
              senderRole: UserRole.LANDLORD,
              receiverId: 1,
              receiverName: 'Admin',
              receiverRole: UserRole.ADMIN,
              content: 'The property inspection went well',
              timestamp: new Date('2026-01-10T10:30:00'),
              read: false
            }
          ]
        },
        {
          userId: 3,
          userName: 'Sarah Johnson (Tenant)',
          userRole: UserRole.TENANT,
          lastMessage: 'Thank you for the quick response!',
          lastMessageTime: new Date('2026-01-09T16:20:00'),
          unreadCount: 0,
          messages: [
            {
              id: 4,
              senderId: 3,
              senderName: 'Sarah Johnson',
              senderRole: UserRole.TENANT,
              receiverId: 1,
              receiverName: 'Admin',
              receiverRole: UserRole.ADMIN,
              content: 'I have a question about my lease',
              timestamp: new Date('2026-01-09T16:00:00'),
              read: true
            },
            {
              id: 5,
              senderId: 1,
              senderName: 'Admin',
              senderRole: UserRole.ADMIN,
              receiverId: 3,
              receiverName: 'Sarah Johnson',
              receiverRole: UserRole.TENANT,
              content: 'How can I help you?',
              timestamp: new Date('2026-01-09T16:10:00'),
              read: true
            },
            {
              id: 6,
              senderId: 3,
              senderName: 'Sarah Johnson',
              senderRole: UserRole.TENANT,
              receiverId: 1,
              receiverName: 'Admin',
              receiverRole: UserRole.ADMIN,
              content: 'Thank you for the quick response!',
              timestamp: new Date('2026-01-09T16:20:00'),
              read: true
            }
          ]
        }
      ];
    } else if (this.currentUser.role === UserRole.LANDLORD) {
      // Landlord sees conversations with tenants and admin
      this.conversations = [
        {
          userId: 1,
          userName: 'Admin Support',
          userRole: UserRole.ADMIN,
          lastMessage: 'Sure! What do you need help with?',
          lastMessageTime: new Date('2026-01-10T09:15:00'),
          unreadCount: 1,
          messages: [
            {
              id: 1,
              senderId: this.currentUser.id,
              senderName: this.currentUser.firstName + ' ' + this.currentUser.lastName,
              senderRole: UserRole.LANDLORD,
              receiverId: 1,
              receiverName: 'Admin',
              receiverRole: UserRole.ADMIN,
              content: 'Hello, I need assistance with property verification',
              timestamp: new Date('2026-01-10T09:00:00'),
              read: true
            },
            {
              id: 2,
              senderId: 1,
              senderName: 'Admin',
              senderRole: UserRole.ADMIN,
              receiverId: this.currentUser.id,
              receiverName: this.currentUser.firstName + ' ' + this.currentUser.lastName,
              receiverRole: UserRole.LANDLORD,
              content: 'Sure! What do you need help with?',
              timestamp: new Date('2026-01-10T09:15:00'),
              read: false
            }
          ]
        },
        {
          userId: 4,
          userName: 'Michael Brown (Tenant)',
          userRole: UserRole.TENANT,
          lastMessage: 'When can I schedule a viewing?',
          lastMessageTime: new Date('2026-01-09T14:30:00'),
          unreadCount: 1,
          messages: [
            {
              id: 7,
              senderId: 4,
              senderName: 'Michael Brown',
              senderRole: UserRole.TENANT,
              receiverId: this.currentUser.id,
              receiverName: this.currentUser.firstName + ' ' + this.currentUser.lastName,
              receiverRole: UserRole.LANDLORD,
              content: 'Hi, I am interested in your property on Main Street',
              timestamp: new Date('2026-01-09T14:00:00'),
              read: true
            },
            {
              id: 8,
              senderId: 4,
              senderName: 'Michael Brown',
              senderRole: UserRole.TENANT,
              receiverId: this.currentUser.id,
              receiverName: this.currentUser.firstName + ' ' + this.currentUser.lastName,
              receiverRole: UserRole.LANDLORD,
              content: 'When can I schedule a viewing?',
              timestamp: new Date('2026-01-09T14:30:00'),
              read: false
            }
          ]
        }
      ];
    } else if (this.currentUser.role === UserRole.TENANT) {
      // Tenant sees conversations with landlords and admin
      this.conversations = [
        {
          userId: 2,
          userName: 'John Smith (Landlord)',
          userRole: UserRole.LANDLORD,
          lastMessage: 'Yes, we can arrange a viewing this week',
          lastMessageTime: new Date('2026-01-10T11:00:00'),
          unreadCount: 1,
          messages: [
            {
              id: 9,
              senderId: this.currentUser.id,
              senderName: this.currentUser.firstName + ' ' + this.currentUser.lastName,
              senderRole: UserRole.TENANT,
              receiverId: 2,
              receiverName: 'John Smith',
              receiverRole: UserRole.LANDLORD,
              content: 'Hello, is the apartment still available?',
              timestamp: new Date('2026-01-10T10:00:00'),
              read: true
            },
            {
              id: 10,
              senderId: 2,
              senderName: 'John Smith',
              senderRole: UserRole.LANDLORD,
              receiverId: this.currentUser.id,
              receiverName: this.currentUser.firstName + ' ' + this.currentUser.lastName,
              receiverRole: UserRole.TENANT,
              content: 'Yes, we can arrange a viewing this week',
              timestamp: new Date('2026-01-10T11:00:00'),
              read: false
            }
          ]
        },
        {
          userId: 1,
          userName: 'Admin Support',
          userRole: UserRole.ADMIN,
          lastMessage: 'Your issue has been resolved',
          lastMessageTime: new Date('2026-01-08T15:00:00'),
          unreadCount: 0,
          messages: [
            {
              id: 11,
              senderId: this.currentUser.id,
              senderName: this.currentUser.firstName + ' ' + this.currentUser.lastName,
              senderRole: UserRole.TENANT,
              receiverId: 1,
              receiverName: 'Admin',
              receiverRole: UserRole.ADMIN,
              content: 'I need help with payment',
              timestamp: new Date('2026-01-08T14:00:00'),
              read: true
            },
            {
              id: 12,
              senderId: 1,
              senderName: 'Admin',
              senderRole: UserRole.ADMIN,
              receiverId: this.currentUser.id,
              receiverName: this.currentUser.firstName + ' ' + this.currentUser.lastName,
              receiverRole: UserRole.TENANT,
              content: 'Your issue has been resolved',
              timestamp: new Date('2026-01-08T15:00:00'),
              read: true
            }
          ]
        }
      ];
    }

    this.updateUnreadCount();
  }

  updateUnreadCount() {
    this.unreadMessagesCount = this.conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
  }

  toggleMessagesModal() {
    this.showMessagesModal = !this.showMessagesModal;
    if (!this.showMessagesModal) {
      this.selectedConversation = null;
    }
  }

  selectConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
    // Mark messages as read
    conversation.messages.forEach(msg => {
      if (msg.receiverId === this.currentUser?.id) {
        msg.read = true;
      }
    });
    conversation.unreadCount = 0;
    this.updateUnreadCount();
  }

  backToConversations() {
    this.selectedConversation = null;
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedConversation || !this.currentUser) return;

    const newMsg: Message = {
      id: Date.now(),
      senderId: this.currentUser.id,
      senderName: this.currentUser.firstName + ' ' + this.currentUser.lastName,
      senderRole: this.currentUser.role,
      receiverId: this.selectedConversation.userId,
      receiverName: this.selectedConversation.userName,
      receiverRole: this.selectedConversation.userRole,
      content: this.newMessage,
      timestamp: new Date(),
      read: false
    };

    this.selectedConversation.messages.push(newMsg);
    this.selectedConversation.lastMessage = this.newMessage;
    this.selectedConversation.lastMessageTime = new Date();
    
    this.newMessage = '';
    
    // Scroll to bottom of messages
    setTimeout(() => {
      const messagesContainer = document.querySelector('.messages-list');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return new Date(date).toLocaleDateString();
  }

  getRoleBadgeClass(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN: return 'badge-admin';
      case UserRole.LANDLORD: return 'badge-landlord';
      case UserRole.TENANT: return 'badge-tenant';
      default: return '';
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getDashboardLink(): string {
    if (!this.currentUser) return '/';
    
    switch (this.currentUser.role) {
      case UserRole.ADMIN:
        return '/admin/dashboard';
      case UserRole.LANDLORD:
        return '/landlord/dashboard';
      case UserRole.TENANT:
        return '/tenant/dashboard';
      default:
        return '/';
    }
  }
}
