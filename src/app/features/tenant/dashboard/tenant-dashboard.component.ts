import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

interface Payment {
  id: number;
  date: Date;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
}

interface MaintenanceRequest {
  id: number;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  date: Date;
  priority: 'low' | 'medium' | 'high';
  description?: string;
}

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './tenant-dashboard.component.html',
  styleUrls: ['./tenant-dashboard.component.css']
})
export class TenantDashboardComponent implements OnInit {
  tenantName = '';
  currentProperty = {
    reference: 'REF-2026-001',
    address: '123 Main Street, New York',
    rentAmount: 2500,
    leaseEnd: new Date('2026-12-31'),
    landlordName: 'John Smith',
    landlordEmail: 'john.smith@email.com',
    landlordPhone: '+1 (555) 123-4567'
  };

  payments: Payment[] = [
    {
      id: 1,
      date: new Date('2026-01-01'),
      amount: 2500,
      status: 'paid',
      description: 'January Rent'
    },
    {
      id: 2,
      date: new Date('2026-02-01'),
      amount: 2500,
      status: 'pending',
      description: 'February Rent'
    },
    {
      id: 3,
      date: new Date('2025-12-01'),
      amount: 2500,
      status: 'paid',
      description: 'December Rent'
    }
  ];

  maintenanceRequests: MaintenanceRequest[] = [
    {
      id: 1,
      title: 'Leaking faucet in kitchen',
      status: 'in-progress',
      date: new Date('2026-01-05'),
      priority: 'medium',
      description: 'The kitchen faucet has been leaking for a few days.'
    },
    {
      id: 2,
      title: 'AC not cooling properly',
      status: 'pending',
      date: new Date('2026-01-08'),
      priority: 'high',
      description: 'Air conditioning unit is not cooling the apartment effectively.'
    }
  ];

  stats = {
    totalPaid: 0,
    nextPayment: 2500,
    nextPaymentDate: new Date('2026-02-01'),
    openRequests: 2,
    daysUntilRent: 0
  };

  // Modal states
  showPaymentModal = false;
  showMaintenanceModal = false;
  showContactModal = false;
  showSuccessModal = false;
  successMessage = '';

  // Payment form
  paymentForm = {
    amount: 2500,
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    saveCard: false
  };
  isProcessingPayment = false;

  // Maintenance form
  maintenanceForm = {
    title: '',
    category: 'plumbing',
    priority: 'medium',
    description: '',
    preferredDate: '',
    allowEntry: true
  };
  isSubmittingMaintenance = false;

  // Contact form
  contactForm = {
    subject: '',
    message: '',
    urgency: 'normal'
  };
  isSendingMessage = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.tenantName = user ? `${user.firstName} ${user.lastName}` : 'Tenant';
    
    this.calculateStats();
    this.paymentForm.amount = this.stats.nextPayment;
  }

  calculateStats() {
    this.stats.totalPaid = this.payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const today = new Date();
    const nextPayment = new Date('2026-02-01');
    this.stats.daysUntilRent = Math.ceil((nextPayment.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    this.stats.openRequests = this.maintenanceRequests.filter(
      r => r.status !== 'completed'
    ).length;
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'paid': 'status-success',
      'pending': 'status-warning',
      'overdue': 'status-danger',
      'completed': 'status-success',
      'in-progress': 'status-info'
    };
    return statusMap[status] || '';
  }

  getPriorityClass(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      'low': 'priority-low',
      'medium': 'priority-medium',
      'high': 'priority-high'
    };
    return priorityMap[priority] || '';
  }

  // Payment Modal Methods
  openPaymentModal() {
    this.showPaymentModal = true;
    this.paymentForm.amount = this.stats.nextPayment;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.resetPaymentForm();
  }

  resetPaymentForm() {
    this.paymentForm = {
      amount: this.stats.nextPayment,
      paymentMethod: 'card',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      saveCard: false
    };
  }

  processPayment() {
    this.isProcessingPayment = true;
    
    // Simulate payment processing
    setTimeout(() => {
      // Add the payment to the list
      const newPayment: Payment = {
        id: this.payments.length + 1,
        date: new Date(),
        amount: this.paymentForm.amount,
        status: 'paid',
        description: 'February Rent'
      };
      
      // Update pending payment to paid
      const pendingIndex = this.payments.findIndex(p => p.status === 'pending');
      if (pendingIndex !== -1) {
        this.payments[pendingIndex].status = 'paid';
      }
      
      this.calculateStats();
      this.isProcessingPayment = false;
      this.closePaymentModal();
      this.showSuccess('Payment processed successfully! You will receive a confirmation email shortly.');
    }, 2000);
  }

  // Maintenance Modal Methods
  openMaintenanceModal() {
    this.showMaintenanceModal = true;
  }

  closeMaintenanceModal() {
    this.showMaintenanceModal = false;
    this.resetMaintenanceForm();
  }

  resetMaintenanceForm() {
    this.maintenanceForm = {
      title: '',
      category: 'plumbing',
      priority: 'medium',
      description: '',
      preferredDate: '',
      allowEntry: true
    };
  }

  submitMaintenanceRequest() {
    this.isSubmittingMaintenance = true;
    
    // Simulate submission
    setTimeout(() => {
      const newRequest: MaintenanceRequest = {
        id: this.maintenanceRequests.length + 1,
        title: this.maintenanceForm.title,
        status: 'pending',
        date: new Date(),
        priority: this.maintenanceForm.priority as 'low' | 'medium' | 'high',
        description: this.maintenanceForm.description
      };
      
      this.maintenanceRequests.unshift(newRequest);
      this.calculateStats();
      this.isSubmittingMaintenance = false;
      this.closeMaintenanceModal();
      this.showSuccess('Maintenance request submitted successfully! Your landlord has been notified.');
    }, 1500);
  }

  // Contact Modal Methods
  openContactModal() {
    this.showContactModal = true;
  }

  closeContactModal() {
    this.showContactModal = false;
    this.resetContactForm();
  }

  resetContactForm() {
    this.contactForm = {
      subject: '',
      message: '',
      urgency: 'normal'
    };
  }

  sendMessage() {
    this.isSendingMessage = true;
    
    // Simulate sending
    setTimeout(() => {
      this.isSendingMessage = false;
      this.closeContactModal();
      this.showSuccess('Message sent successfully! Your landlord will respond shortly.');
    }, 1500);
  }

  // Success Modal
  showSuccess(message: string) {
    this.successMessage = message;
    this.showSuccessModal = true;
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
    this.successMessage = '';
  }
}
