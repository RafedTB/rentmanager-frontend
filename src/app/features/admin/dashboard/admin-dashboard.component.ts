import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { PropertyService } from '../../../core/services/property.service';
import { PaymentService } from '../../../core/services/payment.service';
import { User, UserRole, Property, Payment, PropertyStatus } from '../../../core/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  activeSection: string = 'dashboard';
  sidebarCollapsed: boolean = false;
  sidebarOpen: boolean = false;
  isMobile: boolean = false;
  
  // Expose Math for template
  Math = Math;
  
  // Notifications and Profile
  showNotifications: boolean = false;
  showProfileMenu: boolean = false;
  notifications = [
    { id: 1, title: 'New User Registration', message: 'John Doe registered as a tenant', time: '5 min ago', read: false },
    { id: 2, title: 'Payment Received', message: 'Payment of $2,500 received', time: '1 hour ago', read: false },
    { id: 3, title: 'Maintenance Request', message: 'New maintenance request for PROP-003', time: '2 hours ago', read: true },
    { id: 4, title: 'Lease Expiring', message: 'PROP-012 lease expires in 15 days', time: '1 day ago', read: true }
  ];
  
  // Add User Modal
  showAddUserModal: boolean = false;
  newUser = {
    firstName: '',
    lastName: '',
    email: '',
    role: UserRole.TENANT,
    password: ''
  };

  // Edit User Modal
  showEditUserModal: boolean = false;
  editUser: any = {
    id: 0,
    firstName: '',
    lastName: '',
    email: '',
    role: UserRole.TENANT,
    status: 'ACTIVE'
  };

  // Add Property Modal
  showAddPropertyModal: boolean = false;
  newProperty = {
    reference: '',
    address: '',
    city: '',
    country: '',
    type: '',
    beds: 0,
    bathroom: 0,
    garage: 0,
    surfaceArea: 0,
    constructionYear: 2020,
    price: 0,
    rentPeriod: 'monthly',
    description: '',
    status: 'AVAILABLE',
    landlordId: 0
  };
  fileToUpload: File[] = [];
  selectedPhotos: Array<{ file: File; preview: string }> = [];
  photoError: string = '';
  landlords: any[] = [];
  loadingProperties: boolean = false;
  propertiesSearchQuery: string = '';

  // Issues Filter & Pagination
  issuesFilter: string = 'all';
  issuesPerPage: number = 6;
  issuesCurrentPage: number = 1;
  
  // Pagination
  itemsPerPage: number = 10;
  currentPage: number = 1;
  
  stats = {
    totalUsers: 1234,
    totalProperties: 567,
    activeLeases: 432,
    monthlyRevenue: 125000,
    pendingPayments: 23,
    issues: 5
  };

  recentUsers: User[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: UserRole.TENANT,
      status: 'ACTIVE' as any,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date()
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      role: UserRole.LANDLORD,
      status: 'ACTIVE' as any,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date()
    },
    {
      id: 3,
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.johnson@example.com',
      role: UserRole.TENANT,
      status: 'ACTIVE' as any,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date()
    },
    {
      id: 4,
      firstName: 'Alice',
      lastName: 'Williams',
      email: 'alice.williams@example.com',
      role: UserRole.LANDLORD,
      status: 'INACTIVE' as any,
      createdAt: new Date('2023-12-28'),
      updatedAt: new Date()
    },
    {
      id: 5,
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'charlie.brown@example.com',
      role: UserRole.TENANT,
      status: 'ACTIVE' as any,
      createdAt: new Date('2023-12-20'),
      updatedAt: new Date()
    }
  ];

  recentPayments: any[] = [
    {
      id: 1,
      tenantName: 'John Doe',
      propertyRef: 'PROP-001',
      amount: 1500,
      status: 'completed',
      date: new Date('2026-01-08')
    },
    {
      id: 2,
      tenantName: 'Bob Johnson',
      propertyRef: 'PROP-003',
      amount: 1200,
      status: 'completed',
      date: new Date('2026-01-07')
    },
    {
      id: 3,
      tenantName: 'Sarah Wilson',
      propertyRef: 'PROP-005',
      amount: 1800,
      status: 'pending',
      date: new Date('2026-01-09')
    },
    {
      id: 4,
      tenantName: 'Mike Davis',
      propertyRef: 'PROP-007',
      amount: 2000,
      status: 'overdue',
      date: new Date('2025-12-28')
    },
    {
      id: 5,
      tenantName: 'Emily Clark',
      propertyRef: 'PROP-009',
      amount: 1600,
      status: 'completed',
      date: new Date('2026-01-06')
    },
    {
      id: 6,
      tenantName: 'David Lee',
      propertyRef: 'PROP-011',
      amount: 1400,
      status: 'completed',
      date: new Date('2026-01-05')
    },
    {
      id: 7,
      tenantName: 'Anna Kim',
      propertyRef: 'PROP-013',
      amount: 1700,
      status: 'pending',
      date: new Date('2026-01-09')
    },
    {
      id: 8,
      tenantName: 'James Martinez',
      propertyRef: 'PROP-015',
      amount: 1900,
      status: 'completed',
      date: new Date('2026-01-04')
    },
    {
      id: 9,
      tenantName: 'Laura Garcia',
      propertyRef: 'PROP-017',
      amount: 1550,
      status: 'completed',
      date: new Date('2026-01-03')  

    },
    {
      id: 10,
      tenantName: 'Chris Rodriguez',
      propertyRef: 'PROP-019',
      amount: 1750,
      status: 'pending',
      date: new Date('2026-01-09')
    },
    {
      id:11,
      tenantName: 'Patricia Hernandez',
      propertyRef: 'PROP-021',
      amount: 1650,
      status: 'completed',
      date: new Date('2026-01-02')
    }
  ];

  issues: any[] = [
    {
      id: 1,
      type: 'payment',
      severity: 'high',
      title: 'Overdue Payment - PROP-007',
      description: 'Mike Davis has an overdue payment of $2,000',
      date: new Date('2025-12-28')
    },
    {
      id: 2,
      type: 'maintenance',
      severity: 'medium',
      title: 'Maintenance Request Pending',
      description: 'Water heater repair at PROP-003 - pending for 5 days',
      date: new Date('2026-01-05')
    },
    {
      id: 3,
      type: 'user',
      severity: 'low',
      title: 'Incomplete Profile',
      description: 'Alice Williams has not completed profile verification',
      date: new Date('2026-01-01')
    },
    {
      id: 4,
      type: 'property',
      severity: 'medium',
      title: 'Property Expiring Soon',
      description: 'Lease for PROP-012 expires in 15 days',
      date: new Date('2026-01-08')
    },
    {
      id: 5,
      type: 'payment',
      severity: 'high',
      title: 'Multiple Failed Payment Attempts',
      description: 'Sarah Wilson - 3 failed payment attempts',
      date: new Date('2026-01-09')
    }
  ];

  properties: Property[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private propertyService: PropertyService,
    private paymentService: PaymentService,
    private http: HttpClient
  ) {}

  async ngOnInit() {
    this.checkMobile();
    await this.loadProperties();
    await this.loadLandlords();
  }

  async loadProperties() {
    try {
      this.loadingProperties = true;
      console.log('Admin: Loading properties...');
      this.properties = await this.propertyService.getProperties();
      console.log('Admin: Loaded properties:', this.properties);
      this.stats.totalProperties = this.properties.length;
      console.log('Admin: Total properties:', this.properties.length);
      this.loadingProperties = false;
    } catch (error: any) {
      console.error('Error loading properties:', error);
      console.error('Error details:', error?.error || error?.message || error);
      this.loadingProperties = false;
      this.properties = [];
    }
  }

  async loadLandlords() {
    try {
      const landlords = await firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/landlords`));
      this.landlords = landlords || [];
    } catch (error) {
      console.error('Error loading landlords:', error);
      this.landlords = [];
    }
  }

  setActiveSection(section: string) {
    this.activeSection = section;
    if (this.isMobile) {
      this.closeSidebar();
    }
    // Reload properties when switching to properties section
    if (section === 'properties' && this.properties.length === 0 && !this.loadingProperties) {
      this.loadProperties();
    }
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleSidebarMobile() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkMobile();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const isNotificationClick = target.closest('.notification-wrapper');
    const isProfileClick = target.closest('.profile-wrapper');
    
    if (!isNotificationClick) {
      this.showNotifications = false;
    }
    if (!isProfileClick) {
      this.showProfileMenu = false;
    }
  }

  checkMobile() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  logout() {
    this.authService.logout();
  }

  // Notifications Functions
  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    this.showProfileMenu = false;
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
    this.showNotifications = false;
  }

  markNotificationAsRead(notificationId: number) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  markAllNotificationsAsRead() {
    this.notifications.forEach(n => n.read = true);
  }

  get unreadNotificationsCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getSeverityClass(severity: string): string {
    return severity;
  }

  // Add User Functions
  openAddUserModal() {
    this.showAddUserModal = true;
  }

  closeAddUserModal() {
    this.showAddUserModal = false;
    this.newUser = {
      firstName: '',
      lastName: '',
      email: '',
      role: UserRole.TENANT,
      password: ''
    };
  }

  addUser() {
    // Add validation and API call here
    const user: User = {
      id: this.recentUsers.length + 1,
      firstName: this.newUser.firstName,
      lastName: this.newUser.lastName,
      email: this.newUser.email,
      role: this.newUser.role,
      status: 'ACTIVE' as any,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.recentUsers.unshift(user);
    this.stats.totalUsers++;
    this.closeAddUserModal();
  }

  // Edit User Functions
  openEditUserModal(user: User) {
    this.editUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status
    };
    this.showEditUserModal = true;
  }

  closeEditUserModal() {
    this.showEditUserModal = false;
    this.editUser = {
      id: 0,
      firstName: '',
      lastName: '',
      email: '',
      role: UserRole.TENANT,
      status: 'ACTIVE'
    };
  }

  updateUser() {
    // Add validation and API call here
    const index = this.recentUsers.findIndex(u => u.id === this.editUser.id);
    if (index !== -1) {
      this.recentUsers[index] = {
        ...this.recentUsers[index],
        firstName: this.editUser.firstName,
        lastName: this.editUser.lastName,
        email: this.editUser.email,
        role: this.editUser.role,
        status: this.editUser.status,
        updatedAt: new Date()
      };
    }
    this.closeEditUserModal();
  }

  // Issues Filter Functions
  filterIssues(filter: string) {
    this.issuesFilter = filter;
    this.issuesCurrentPage = 1; // Reset to first page when filtering
  }

  get filteredIssues() {
    if (this.issuesFilter === 'all') {
      return this.issues;
    }
    return this.issues.filter(issue => issue.severity === this.issuesFilter);
  }

  get paginatedIssues() {
    const filtered = this.filteredIssues;
    const start = (this.issuesCurrentPage - 1) * this.issuesPerPage;
    const end = start + this.issuesPerPage;
    return filtered.slice(start, end);
  }

  get totalIssuesPages(): number {
    return Math.ceil(this.filteredIssues.length / this.issuesPerPage);
  }

  nextIssuesPage() {
    if (this.issuesCurrentPage < this.totalIssuesPages) {
      this.issuesCurrentPage++;
    }
  }

  previousIssuesPage() {
    if (this.issuesCurrentPage > 1) {
      this.issuesCurrentPage--;
    }
  }

  goToIssuesPage(page: number) {
    this.issuesCurrentPage = page;
  }

  // Pagination Functions
  setItemsPerPage(count: number) {
    this.itemsPerPage = count;
    this.currentPage = 1;
  }

  get paginatedPayments() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.recentPayments.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.recentPayments.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  // Export Payments
  exportPayments() {
    // Create CSV content
    const headers = ['ID', 'Tenant Name', 'Property', 'Amount', 'Status', 'Date'];
    const rows = this.recentPayments.map(p => [
      p.id,
      p.tenantName,
      p.propertyRef,
      p.amount,
      p.status,
      new Date(p.date).toLocaleDateString()
    ]);
    
    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // Payment actions
  viewPaymentDetails(paymentId: number) {
    console.log('Viewing payment details for ID:', paymentId);
    alert(`Payment Details for ID: ${paymentId}\nThis will show full payment information.`);
  }

  downloadReceipt(paymentId: number) {
    console.log('Downloading receipt for payment ID:', paymentId);
    alert(`Downloading receipt for payment ID: ${paymentId}`);
  }

  // Issue actions
  resolveIssue(issueId: number) {
    const issue = this.issues.find(i => i.id === issueId);
    if (issue) {
      issue.status = 'Resolved';
      alert(`Issue #${issueId} has been marked as resolved.`);
    }
  }

  // Property actions
  viewPropertyDetails(propertyId: number) {
    console.log('Viewing property details for ID:', propertyId);
    this.router.navigate(['/property', propertyId]);
  }

  // User actions
  deleteUser(userId: number) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.recentUsers = this.recentUsers.filter(u => u.id !== userId);
      alert(`User ID ${userId} has been deleted.`);
    }
  }

  // Reports
  generateReport() {
    alert('Generate Report feature - This will create a comprehensive PDF/Excel report of all system data.');
  }

  // Property Management Functions
  openAddPropertyModal() {
    this.showAddPropertyModal = true;
  }

  closeAddPropertyModal() {
    this.showAddPropertyModal = false;
    this.newProperty = {
      reference: '',
      address: '',
      city: '',
      country: '',
      type: '',
      beds: 0,
      bathroom: 0,
      garage: 0,
      surfaceArea: 0,
      constructionYear: 2020,
      price: 0,
      rentPeriod: 'monthly',
      description: '',
      status: 'AVAILABLE',
      landlordId: 0
    };
    this.fileToUpload = [];
    this.selectedPhotos = [];
    this.photoError = '';
  }

  /**
   * Handle file input change
   */
  handleFileInput(event: any) {
    const files: FileList = event.target.files;
    this.photoError = '';

    if (!files || files.length === 0) {
      return;
    }

    // Validate total number of photos (existing + new)
    const totalPhotos = this.selectedPhotos.length + files.length;
    if (totalPhotos > 8) {
      this.photoError = `You can only upload a maximum of 8 photos. You have selected ${totalPhotos} photos.`;
      return;
    }

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.photoError = `The file "${file.name}" is not a valid image.`;
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.photoError = `The file "${file.name}" is too large. Maximum size: 5MB.`;
        continue;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedPhotos.push({
          file: file,
          preview: e.target.result
        });
      };
      reader.readAsDataURL(file);

      this.fileToUpload.push(file);
    }

    // Reset input
    event.target.value = '';
  }

  /**
   * Remove a photo from selection
   */
  removePhoto(index: number) {
    this.selectedPhotos.splice(index, 1);
    this.fileToUpload.splice(index, 1);
    this.photoError = '';
  }

  saveProperty() {
    // Validate landlord selection
    if (!this.newProperty.landlordId || this.newProperty.landlordId === 0) {
      this.photoError = 'Please select a landlord for this property.';
      return;
    }

    // Validate at least one photo
    if (this.fileToUpload.length === 0) {
      this.photoError = 'You must upload at least 1 photo.';
      return;
    }

    this.addProperty();
  }

  async addProperty() {
    try {
      // Create FormData object
      const formData = new FormData();
      
      // Add property data
      formData.append('reference', this.newProperty.reference || `REF-2026-${String(this.properties.length + 1).padStart(3, '0')}`);
      formData.append('address', this.newProperty.address);
      formData.append('city', this.newProperty.city);
      formData.append('country', this.newProperty.country);
      formData.append('type', this.newProperty.type);
      formData.append('beds', this.newProperty.beds.toString());
      formData.append('bathroom', this.newProperty.bathroom.toString());
      formData.append('garage', this.newProperty.garage.toString());
      formData.append('surfaceArea', this.newProperty.surfaceArea.toString());
      formData.append('constructionYear', this.newProperty.constructionYear.toString());
      formData.append('price', this.newProperty.price.toString());
      formData.append('rentPeriod', this.newProperty.rentPeriod);
      formData.append('description', this.newProperty.description);
      formData.append('status', this.newProperty.status);
      formData.append('landlordId', this.newProperty.landlordId.toString());

      // Add photos
      this.fileToUpload.forEach((file, index) => {
        formData.append('photos', file, file.name);
      });

      // Send to backend API
      const savedProperty = await this.propertyService.createPropertyWithPhotos(formData);
      
      // Reload properties list
      await this.loadProperties();
      
      console.log('Property saved successfully:', savedProperty);
      
      this.closeAddPropertyModal();
    } catch (error: any) {
      console.error('Error adding property:', error);
      this.photoError = error?.error?.message || error?.message || 'Error adding property. Please try again.';
    }
  }

  get filteredProperties() {
    if (!this.propertiesSearchQuery) return this.properties;
    const query = this.propertiesSearchQuery.toLowerCase();
    return this.properties.filter(p => 
      (p.address?.toLowerCase().includes(query)) ||
      (p.reference?.toLowerCase().includes(query)) ||
      (p.city?.toLowerCase().includes(query))
    );
  }
}
