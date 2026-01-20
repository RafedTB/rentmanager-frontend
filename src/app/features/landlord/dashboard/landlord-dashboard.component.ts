import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { PropertyService } from '../../../core/services/property.service';
import { PaymentService } from '../../../core/services/payment.service';
import { MaintenanceService } from '../../../core/services/maintenance.service';
import { TenantService } from '../../../core/services/tenant.service';
import { MessageService } from '../../../core/services/message.service';
import { RentalRequestService } from '../../../core/services/rental_request.service';
import { Property, PropertyStatus, PropertyType } from '../../../core/models/property.model';
import { Payment, PaymentSummary, PaymentStatus, PaymentMethod, PaymentCreateRequest } from '../../../core/models/payment.model';
import { MaintenanceRequest, MaintenanceStatus, MaintenancePriority, MaintenanceCreateRequest } from '../../../core/models/maintenance.model';
import { User as Tenant } from '../../../core/models/user.model';
import { Message } from '../../../core/models/message.model';
import { RentalRequest, RentalRequestStatus } from '../../../core/models/rental_request.model';



@Component({
  selector: 'app-landlord-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './landlord-dashboard.component.html',
  styleUrls: ['./landlord-dashboard.component.css']
})
export class LandlordDashboardComponent implements OnInit {
  activeSection: string = 'dashboard';
  landlordName = 'John Landlord';
  landlordEmail = 'landlord@rentmanager.com';
  landlordInitials = 'JL';

  // Expose Math and enums for template
  Math = Math;
  MaintenanceStatus = MaintenanceStatus;
  PaymentStatus = PaymentStatus;
  PaymentMethod = PaymentMethod;
  MaintenancePriority = MaintenancePriority;
  RentalRequestStatus = RentalRequestStatus;

  // UI State
  sidebarOpen: boolean = false;
  isMobile: boolean = false;
  showNotifications: boolean = false;
  showProfileMenu: boolean = false;
  showAddPropertyModal: boolean = false;
  showAddTenantModal: boolean = false;
  showRecordPaymentModal: boolean = false;
  showAddMaintenanceModal: boolean = false;
  showViewPaymentModal: boolean = false;
  showViewTenantModal: boolean = false;
  showViewMaintenanceModal: boolean = false;
  showEditPropertyModal: boolean = false;
  showEditTenantModal: boolean = false;
  showEditMaintenanceModal: boolean = false;

  // Selected items for viewing/editing
  selectedPayment: Payment | null = null;
  selectedTenant: Tenant | null = null;
  selectedMaintenance: MaintenanceRequest | null = null;
  selectedProperty: Property | null = null;

  // Edit mode data
  editTenantData: any = {};
  editPropertyData: any = {};
  editMaintenanceData: any = {};

  // New maintenance request
  newMaintenance = {
    propertyId: 0,
    title: '',
    description: '',
    priority: MaintenancePriority.MEDIUM,
    tenantId: 0
  };

  // Notifications
  notifications = [
    { id: 1, title: 'New Payment Received', message: 'John Smith paid $2,500', time: '5 min ago', read: false },
    { id: 2, title: 'Maintenance Request', message: 'Water heater repair needed', time: '1 hour ago', read: false },
    { id: 3, title: 'Lease Renewal', message: 'Sarah Johnson renewed lease', time: '2 hours ago', read: true },
    { id: 4, title: 'Property Listed', message: 'REF-2026-005 is now available', time: '1 day ago', read: true }
  ];

  // Search & Filters
  searchQuery: string = '';
  paymentSearchQuery: string = '';
  paymentFilter: string = 'all';
  tenantSearchQuery: string = '';
  tenantFilter: string = 'all';
  maintenanceSearchQuery: string = '';
  maintenanceStatusFilter: string = 'all';
  maintenancePriorityFilter: string = 'all';

  // Pagination
  itemsPerPage: number = 10;
  currentPage: number = 1;
  paymentCurrentPage: number = 1;
  paymentItemsPerPage: number = 10;
  tenantCurrentPage: number = 1;
  tenantItemsPerPage: number = 10;
  maintenanceCurrentPage: number = 1;
  maintenanceItemsPerPage: number = 10;

  // Helper for template

  // Messages
  unreadMessagesCount: number = 0;
  selectedMessage: Message | null = null;

  stats = {
    totalProperties: 0,
    occupiedProperties: 0,
    vacantProperties: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    activeTenants: 0,
    occupancyRate: 0,
    pendingRequests: 0,
    pendingPayments: 0,
    urgentRequests: 0,
    maintenanceRequests: 0
  };

  properties: Property[] = [];
  payments: Payment[] = [];
  maintenanceRequests: MaintenanceRequest[] = [];
  tenants: Tenant[] = [];
  messages: Message[] = [];
  rentalRequests: RentalRequest[] = [];

  newPayment = {
    tenantId: 0,
    propertyId: 0,
    amount: 0,
    date: '',
    method: 'bank_transfer'
  };

  newTenant = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    propertyId: 0
  };

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
    status: PropertyStatus.AVAILABLE
  };

  // File upload
  fileToUpload: Array<File> = [];
  selectedPhotos: Array<{ file: File; preview: string }> = [];
  photoError: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private propertyService: PropertyService,
    private paymentService: PaymentService,
    private maintenanceService: MaintenanceService,
    private tenantService: TenantService,
    private messageService: MessageService,
    private rentalRequestService: RentalRequestService
  ) { }

  async ngOnInit() {
    this.checkMobile();
    const user = this.authService.getCurrentUser();
    if (user) {
      this.landlordName = `${user.firstName ?? ''} ${user.lastName ?? ''}`;
      this.landlordEmail = user.email;
      this.landlordInitials = `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`;

      // Load all data
      await Promise.all([
        this.loadProperties(),
        this.loadPayments(),
        this.loadMaintenanceRequests(),
        this.loadTenants(),
        this.loadMessages(),
        this.loadRentalRequests(),
        this.loadPaymentSummary() // Load stats
      ]);
    }
  }

  async loadPayments() {
    try {
      const user = this.authService.getCurrentUser();
      if (user && user.id) {
        this.payments = await this.paymentService.getPaymentsByLandlord(user.id);

        // Hydrate payments with extra data for view
        this.payments.forEach(p => {
          const tenant = this.tenants.find(t => t.id === p.tenantId);
          if (tenant) {
            p.tenantName = this.getTenantName(tenant);
          }
          const property = this.properties.find(prop => prop.id === p.propertyId);
          if (property) {
            p.property = property.reference;
          }
        });

        this.stats.pendingPayments = this.payments.filter(p => p.status === PaymentStatus.PENDING).length;
      } else {
        this.payments = [];
      }
    } catch (error: any) {
      // Service handles most errors, this is for unexpected errors
      console.warn('Unexpected error loading payments:', error?.message || error);
      this.payments = [];
    }
  }

  async loadPaymentSummary() {
    try {
      const user = this.authService.getCurrentUser();
      if (user && user.id) {
        const summary = await this.paymentService.getPaymentSummary(user.id, true); // true for landlord
        this.stats.totalRevenue = summary.totalPaid;
        // You might want to add other summary fields to your stats object
      } else {
        this.stats.totalRevenue = 0;
      }
    } catch (error: any) {
      // Service handles most errors, this is for unexpected errors
      console.warn('Unexpected error loading payment summary:', error?.message || error);
      this.stats.totalRevenue = 0;
    }
  }

  async loadMaintenanceRequests() {
    try {
      const user = this.authService.getCurrentUser();
      if (user && user.id) {
        this.maintenanceRequests = await this.maintenanceService.getMaintenanceRequestsByLandlord(user.id);

        // Hydrate maintenance requests
        this.maintenanceRequests.forEach(r => {
          const tenant = this.tenants.find(t => t.id === r.tenantId);
          if (tenant) {
            r.tenant = this.getTenantName(tenant);
          }
          const property = this.properties.find(p => p.id === r.propertyId);
          if (property) {
            r.property = property.reference;
          }
          // Map created date to date if needed for view
          r.date = r.createdAt;
        });

        this.stats.maintenanceRequests = this.maintenanceRequests.length;
        this.stats.pendingRequests = this.maintenanceRequests.filter((r: any) => r.status === 'PENDING' || r.status === 'Pending').length;
      } else {
        this.maintenanceRequests = [];
        this.stats.maintenanceRequests = 0;
        this.stats.pendingRequests = 0;
      }
    } catch (error: any) {
      // Service handles most errors, this is for unexpected errors
      console.warn('Unexpected error loading maintenance requests:', error?.message || error);
      this.maintenanceRequests = [];
      this.stats.maintenanceRequests = 0;
      this.stats.pendingRequests = 0;
    }
  }

  async loadTenants() {
    try {
      const user = this.authService.getCurrentUser();
      if (user && user.id) {
        this.tenants = await this.tenantService.getTenantsByLandlord(user.id);

        // Hydrate tenants with view helpers
        this.tenants.forEach(t => {
          t.initials = `${t.firstName?.charAt(0) || ''}${t.lastName?.charAt(0) || ''}`;
          t.name = `${t.firstName} ${t.lastName}`;
          t.rent = 0; // Default or fetch real data if available
          t.paymentStatus = 'Current'; // Logic to determine status could go here
          // Find property logic if one tenant -> one property relation exists
          // t.property = '...'; 
        });

        this.stats.activeTenants = this.tenants.length;
      } else {
        this.tenants = [];
        this.stats.activeTenants = 0;
      }
    } catch (error: any) {
      // Service handles most errors, this is for unexpected errors
      console.warn('Unexpected error loading tenants:', error?.message || error);
      this.tenants = [];
      this.stats.activeTenants = 0;
    }
  }

  async loadMessages() {
    try {
      const user = this.authService.getCurrentUser();
      if (user && user.id) {
        this.messages = await this.messageService.getMessages(user.id);
        // Hydrate messages
        this.messages.forEach(m => {
          // Set sender initials if not provided
          if (!m.senderInitials && m.senderName) {
            m.senderInitials = m.senderName.charAt(0).toUpperCase();
          }
        });
        this.unreadMessagesCount = this.messages.filter(m => !m.read).length;
      } else {
        this.messages = [];
        this.unreadMessagesCount = 0;
      }
    } catch (error: any) {
      // Service handles most errors, this is for unexpected errors
      console.warn('Unexpected error loading messages:', error?.message || error);
      this.messages = [];
      this.unreadMessagesCount = 0;
    }
  }




  async loadProperties() {
    try {
      const user = this.authService.getCurrentUser();
      if (user && user.id) {
        console.log(`Loading properties for landlord ID: ${user.id}`);
        this.properties = await this.propertyService.getPropertiesByLandlord(user.id);
        console.log(`Loaded ${this.properties.length} properties`);

        // Update property stats
        this.stats.totalProperties = this.properties.length;
        this.stats.occupiedProperties = this.properties.filter(p => p.status === PropertyStatus.RENTED).length;
        this.stats.vacantProperties = this.properties.filter(p => p.status === PropertyStatus.AVAILABLE).length;
        
        if (this.properties.length === 0) {
          console.log('No properties found for this landlord');
        }
      } else {
        console.warn('User not found or ID missing', { user });
        this.properties = [];
        this.stats.totalProperties = 0;
        this.stats.occupiedProperties = 0;
        this.stats.vacantProperties = 0;
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      this.properties = [];
      this.stats.totalProperties = 0;
      this.stats.occupiedProperties = 0;
      this.stats.vacantProperties = 0;
    }
  }

  async loadRentalRequests() {
    try {
      const user = this.authService.getCurrentUser();
      if (user && user.id) {
        console.log(`Loading rental requests for landlord ID: ${user.id}`);
        this.rentalRequests = await this.rentalRequestService.getRentalRequests(user.id);
        console.log(`Loaded ${this.rentalRequests.length} rental requests`);

        // Update stats
        this.stats.pendingRequests = this.rentalRequests.filter(r => r.status === RentalRequestStatus.PENDING).length;
      } else {
        console.warn('User not found or ID missing for rental requests', { user });
        this.rentalRequests = [];
        this.stats.pendingRequests = 0;
      }
    } catch (error: any) {
      console.warn('Unexpected error loading rental requests:', error?.message || error);
      this.rentalRequests = [];
      this.stats.pendingRequests = 0;
    }
  }

  setActiveSection(section: string) {
    this.activeSection = section;
    if (this.isMobile) {
      this.closeSidebar();
    }
    // Scroll to top when changing sections
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getSectionTitle(): string {
    const titles: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'properties': 'My Properties',
      'payments': 'Payments',
      'maintenance': 'Maintenance',
      'tenants': 'Tenants',
      'messages': 'Messages',
      'rental-requests': 'Rental Requests'
    };
    return titles[this.activeSection] || 'Dashboard';
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

  // Notifications
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

  // Properties
  get filteredProperties(): Property[] {
    if (!this.searchQuery) return this.properties;
    const query = this.searchQuery.toLowerCase();
    return this.properties.filter(p =>
      p.address.toLowerCase().includes(query) ||
      p.reference.toLowerCase().includes(query) ||
      p.city.toLowerCase().includes(query)
    );
  }

  get rentedProperties(): Property[] {
    return this.properties.filter(p => p.status === PropertyStatus.RENTED);
  }

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
      status: PropertyStatus.AVAILABLE
    };
    // Reset file upload state
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
      this.photoError = `Vous ne pouvez télécharger que 8 photos au maximum. Vous avez sélectionné ${totalPhotos} photos.`;
      return;
    }

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.photoError = `Le fichier "${file.name}" n'est pas une image valide.`;
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.photoError = `Le fichier "${file.name}" est trop volumineux. Taille maximale: 5MB.`;
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
    // Validate at least one photo
    if (this.fileToUpload.length === 0) {
      this.photoError = 'Vous devez télécharger au moins 1 photo.';
      return;
    }

    this.addProperty();
  }

  async addProperty() {
    try {
      // Get current user to get landlord ID
      const user = this.authService.getCurrentUser();
      if (!user || !user.id) {
        this.photoError = 'Erreur: Utilisateur non connecté.';
        return;
      }

      console.log('Adding property for landlord:', user.id);

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
      formData.append('landlordId', user.id.toString());

      // Add photos
      console.log('Adding photos:', this.fileToUpload.length);
      this.fileToUpload.forEach((file, index) => {
        formData.append('photos', file, file.name);
        console.log(`Photo ${index}: ${file.name}, size: ${file.size} bytes`);
      });

      // Send to backend API
      console.log('Sending request to backend...');
      const savedProperty = await this.propertyService.createPropertyWithPhotos(formData);

      // Add to local properties list
      const property: Property = {
        id: savedProperty.id || this.properties.length + 1,
        reference: savedProperty.reference || this.newProperty.reference || `REF-2026-${String(this.properties.length + 1).padStart(3, '0')}`,
        address: this.newProperty.address,
        city: this.newProperty.city,
        type: this.newProperty.type as PropertyType,
        beds: this.newProperty.beds,
        bathroom: this.newProperty.bathroom,
        surfaceArea: this.newProperty.surfaceArea,
        price: this.newProperty.price,
        status: this.newProperty.status,
        photos: savedProperty.photos || this.fileToUpload.map(f => f.name),
        description: this.newProperty.description,
        isAvailable: true,
        constructionYear: new Date().getFullYear(),
        garage: 0,
        country: this.newProperty.country,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        houseRules: '',
        publicationDate: new Date()
      };

      this.properties.unshift(property);
      this.stats.totalProperties++;

      console.log('Property saved successfully:', savedProperty);

      this.closeAddPropertyModal();
    } catch (error: any) {
      console.error('Error adding property:', error);
      
      // Extract more detailed error information
      let errorMessage = 'Erreur lors de l\'ajout de la propriété.';
      
      if (error?.error) {
        if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error.message) {
          errorMessage = error.error.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      if (error?.status) {
        errorMessage += ` (Status: ${error.status})`;
      }
      
      console.error('Detailed error:', errorMessage);
      this.photoError = errorMessage;
    }
  }

  viewProperty(id: number) {
    this.router.navigate(['/property-details', id]);
  }

  editProperty(property: Property) {
    this.selectedProperty = property;
    this.editPropertyData = {
      reference: property.reference,
      address: property.address,
      city: property.city,
      type: property.type,
      beds: property.beds,
      bathroom: property.bathroom,
      surfaceArea: property.surfaceArea,
      price: property.price,
      status: property.status
    };
    this.showEditPropertyModal = true;
  }

  closeEditPropertyModal() {
    this.showEditPropertyModal = false;
    this.selectedProperty = null;
    this.editPropertyData = {};
  }

  saveEditProperty() {
    if (this.selectedProperty) {
      this.selectedProperty.reference = this.editPropertyData.reference;
      this.selectedProperty.address = this.editPropertyData.address;
      this.selectedProperty.city = this.editPropertyData.city;
      this.selectedProperty.type = this.editPropertyData.type;
      this.selectedProperty.beds = this.editPropertyData.beds;
      this.selectedProperty.bathroom = this.editPropertyData.bathroom;
      this.selectedProperty.surfaceArea = this.editPropertyData.surfaceArea;
      this.selectedProperty.price = this.editPropertyData.price;
      this.selectedProperty.status = this.editPropertyData.status;

      this.closeEditPropertyModal();
    }
  }

  async deleteProperty(id: number) {
    if (confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        await this.propertyService.deleteProperty(id);
        // Remove from local array
        this.properties = this.properties.filter(p => p.id !== id);
        // Update stats
        this.stats.totalProperties--;
        this.stats.occupiedProperties = this.properties.filter(p => p.status === PropertyStatus.RENTED).length;
        this.stats.vacantProperties = this.properties.filter(p => p.status === PropertyStatus.AVAILABLE).length;
        console.log('Property deleted successfully');
      } catch (error: any) {
        console.error('Error deleting property:', error);
        alert('Failed to delete property. Please try again.');
      }
    }
  }

  // Payments
  get paginatedPayments(): Payment[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.payments.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.payments.length / this.itemsPerPage);
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

  exportPayments() {
    const headers = ['ID', 'Tenant', 'Property', 'Amount', 'Date', 'Status'];
    const rows = this.payments.map(p => [
      p.id,
      this.tenants.find(t => t.id === p.tenantId) ? this.getTenantName(this.tenants.find(t => t.id === p.tenantId)!) : 'Unknown',
      this.properties.find(prop => prop.id === p.propertyId)?.address || 'Unknown',
      p.amount,
      new Date(p.createdAt).toLocaleDateString(),
      p.status
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

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

  // Payment methods
  setPaymentFilter(filter: string) {
    this.paymentFilter = filter;
    this.paymentCurrentPage = 1; // Reset to first page
  }

  getPaymentTenantName(payment: Payment): string {
    const tenant = this.tenants.find(t => t.id === payment.tenantId);
    return tenant ? this.getTenantName(tenant) : 'Unknown Tenant';
  }

  getPaymentPropertyAddress(payment: Payment): string {
    const property = this.properties.find(p => p.id === payment.propertyId);
    return property ? property.address : 'Unknown Property';
  }

  getCompletedPayments(): Payment[] {
    return this.payments.filter(p => p.status === PaymentStatus.COMPLETED);
  }

  getPendingPayments(): Payment[] {
    return this.payments.filter(p => p.status === PaymentStatus.PENDING);
  }

  getOverduePayments(): Payment[] {
    // Check pending and due date passed
    return this.payments.filter(p => p.status === PaymentStatus.PENDING && new Date(p.dueDate) < new Date());
  }

  getFilteredPayments(): Payment[] {
    let filtered = this.payments;

    // Apply search filter (limited to ID search as we don't have joined names here efficiently yet)
    if (this.paymentSearchQuery.trim()) {
      const query = this.paymentSearchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.id.toString().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (this.paymentFilter !== 'all') {
      const pFilter = this.paymentFilter.toUpperCase();
      if (pFilter === 'OVERDUE') {
        filtered = filtered.filter(p => p.status === PaymentStatus.PENDING && new Date(p.dueDate) < new Date());
      } else {
        filtered = filtered.filter(p => p.status.toString().toUpperCase() === pFilter);
      }
    }

    return filtered;
  }

  getPaginatedPayments(): Payment[] {
    const filtered = this.getFilteredPayments();
    const start = (this.paymentCurrentPage - 1) * this.paymentItemsPerPage;
    const end = start + this.paymentItemsPerPage;
    return filtered.slice(start, end);
  }

  getPaymentTotalPages(): number {
    return Math.ceil(this.getFilteredPayments().length / this.paymentItemsPerPage);
  }

  getPaymentPageNumbers(): number[] {
    const total = this.getPaymentTotalPages();
    if (total <= 0) return [1];
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  goToPaymentPage(page: number) {
    if (page >= 1 && page <= this.getPaymentTotalPages()) {
      this.paymentCurrentPage = page;
    }
  }

  nextPaymentPage() {
    if (this.paymentCurrentPage < this.getPaymentTotalPages()) {
      this.paymentCurrentPage++;
    }
  }

  previousPaymentPage() {
    if (this.paymentCurrentPage > 1) {
      this.paymentCurrentPage--;
    }
  }

  getTotalCollected(): number {
    return this.payments
      .filter(p => p.status === PaymentStatus.COMPLETED)
      .reduce((sum, p) => sum + p.amount, 0);
  }

  getTotalPending(): number {
    return this.payments
      .filter(p => p.status === PaymentStatus.PENDING)
      .reduce((sum, p) => sum + p.amount, 0);
  }

  getTotalOverdue(): number {
    return this.payments
      .filter(p => p.status === PaymentStatus.PENDING && new Date(p.dueDate) < new Date())
      .reduce((sum, p) => sum + p.amount, 0);
  }

  openRecordPaymentModal() {
    this.showRecordPaymentModal = true;
    this.newPayment = {
      tenantId: 0,
      propertyId: 0,
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      method: PaymentMethod.BANK_TRANSFER
    };
  }

  closeRecordPaymentModal() {
    this.showRecordPaymentModal = false;
  }

  async savePayment() {
    // Basic validation
    if (!this.newPayment.tenantId || !this.newPayment.propertyId || !this.newPayment.amount) {
      alert('Please fill in all required fields');
      return;
    }

    const paymentData: PaymentCreateRequest = {
      tenantId: Number(this.newPayment.tenantId),
      propertyId: Number(this.newPayment.propertyId),
      amount: this.newPayment.amount,
      dueDate: new Date(this.newPayment.date), // Using date as dueDate for simplified entry
      method: this.newPayment.method as PaymentMethod,
      description: 'Manual payment entry'
    };

    try {
      const saved = await this.paymentService.createPayment(paymentData);
      this.payments.unshift(saved);
      // Update stats
      this.loadPaymentSummary();
      this.closeRecordPaymentModal();
      console.log('Payment recorded:', saved);
    } catch (err) {
      console.error('Error saving payment:', err);
    }
  }

  getFilteredPaymentsCount(): number {
    return this.getFilteredPayments().length;
  }

  setTenantFilter(filter: string) {
    this.tenantFilter = filter;
    this.tenantCurrentPage = 1;
  }


  viewPaymentDetails(id: number) {
    const payment = this.payments.find(p => p.id === id);
    if (payment) {
      this.selectedPayment = payment;
      this.showViewPaymentModal = true;
    }
  }

  closeViewPaymentModal() {
    this.showViewPaymentModal = false;
    this.selectedPayment = null;
  }

  downloadReceipt(id: number) {
    const payment = this.payments.find(p => p.id === id);
    if (payment) {
      const tenant = this.tenants.find(t => t.id === payment.tenantId);
      const tenantName = tenant ? this.getTenantName(tenant) : 'Unknown Tenant';
      const propertyAddress = this.properties.find(p => p.id === payment.propertyId)?.address || 'Unknown Property';

      const receiptContent = `
PAYMENT RECEIPT
================
Receipt #: REC-${payment.id.toString().padStart(5, '0')}
Date: ${new Date(payment.createdAt).toLocaleDateString()}

Tenant: ${tenantName}
Property: ${propertyAddress}
Amount: $${payment.amount.toFixed(2)}
Status: ${payment.status}

Thank you for your payment!
      `.trim();

      // Create and download the file
      const blob = new Blob([receiptContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${payment.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  }

  markAsPaid(id: number) {
    const payment = this.payments.find(p => p.id === id);
    if (payment) {
      payment.status = PaymentStatus.COMPLETED;
      console.log('Payment marked as paid:', id);
    }
  }

  // Old Maintenance methods (kept for backwards compatibility)
  viewRequest(id: number) {
    console.log('View request:', id);
  }

  updateRequestStatus(request: MaintenanceRequest) {
    console.log('Update request status:', request);
  }

  getTenantProperty(tenant: Tenant): Property | undefined {
    // Look up property by tenant's ID
    return this.properties.find(p => p.currentTenantId === tenant.id);
  }

  getTenantRent(tenant: Tenant): number {
    // Rent would typically be on the lease or property, assuming 0 if not available directly on user
    return this.getTenantProperty(tenant)?.price || 0; // Assuming property price is rent
  }

  getTenantPaymentStatus(tenant: Tenant): string {
    // This should be calculated based on payments
    const tenantPayments = this.payments.filter(p => p.tenantId === tenant.id);
    if (tenantPayments.some(p => p.status === PaymentStatus.PENDING && new Date(p.dueDate) < new Date())) {
      return 'Overdue';
    }
    if (tenantPayments.some(p => p.status === PaymentStatus.PENDING)) {
      return 'Pending';
    }
    return 'Current';
  }

  // Tenant methods
  getTenantInitials(tenant: Tenant): string {
    if (tenant.firstName && tenant.lastName) {
      return (tenant.firstName.charAt(0) + tenant.lastName.charAt(0)).toUpperCase();
    }
    return (tenant.username || tenant.email || '?').substring(0, 2).toUpperCase();
  }

  getTenantName(tenant: Tenant): string {
    if (tenant.firstName && tenant.lastName) {
      return `${tenant.firstName} ${tenant.lastName}`;
    }
    return tenant.username || tenant.email;
  }

  getCurrentTenants(): Tenant[] {
    return this.tenants.filter(t => t.isActive);
  }

  getPendingTenants(): Tenant[] {
    // Assuming inactive for pending or based on specific status field
    return this.tenants.filter(t => !t.isActive);
  }

  getOverdueTenants(): Tenant[] {
    return this.tenants.filter(user => {
      // Find payments for this tenant
      const tenantPayments = this.payments.filter(p => p.tenantId === user.id);
      const userProperty = this.getTenantProperty(user);

      // Ensure payment belongs to the correct property if known
      if (userProperty) {
        // This check might be redundant if we just trust tenantId on payment, 
        // but strictly we check if payment matches tenant AND property.
        // However, tenantId should be unique enough.
      }

      // Basic logic: if they have any OVERDUE payment
      return tenantPayments.some(p => p.status === PaymentStatus.PENDING && new Date(p.dueDate) < new Date());
    });
  }

  getFilteredTenants(): Tenant[] {
    const filtered = this.getAllFilteredTenants();
    const start = (this.tenantCurrentPage - 1) * this.tenantItemsPerPage;
    const end = start + this.tenantItemsPerPage;
    return filtered.slice(start, end);
  }

  openAddTenantModal() {
    this.showAddTenantModal = true;
    // Reset form
    this.newTenant = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      propertyId: 0
    };
  }

  closeAddTenantModal() {
    this.showAddTenantModal = false;
  }

  async saveTenant() {
    // Basic validation
    if (!this.newTenant.firstName || !this.newTenant.lastName || !this.newTenant.email || !this.newTenant.propertyId) {
      alert('Please fill in all required fields');
      return;
    }

    // Prepare tenant data for API
    // Note: In a real app, you'd likely have a specific createTenant endpoint
    // or use auth service to register a new user with TENANT role.
    // For now assuming we just close modal as we implemented the service but maybe not the UI form fully.
    console.log('Saving tenant:', this.newTenant);

    // Reset form
    this.closeAddTenantModal();
  }

  editTenant(id: number) {
    const tenant = this.tenants.find(t => t.id === id);
    if (tenant) {
      this.selectedTenant = tenant;
      const tenantAny = tenant as any;
      this.editTenantData = {
        firstName: tenant.firstName,
        lastName: tenant.lastName,
        email: tenant.email,
        phone: tenant.phone,
        propertyId: tenantAny.propertyId,
        leaseStart: tenantAny.leaseStart,
        leaseEnd: tenantAny.leaseEnd,
        deposit: tenantAny.deposit
      };
      this.showEditTenantModal = true;
    }
  }

  closeEditTenantModal() {
    this.showEditTenantModal = false;
    this.selectedTenant = null;
    this.editTenantData = {};
  }

  saveEditTenant() {
    if (this.selectedTenant) {
      // Verify tenant
      if (!this.editTenantData.firstName || !this.editTenantData.lastName || !this.editTenantData.email) {
        alert('Please fill in all required fields');
        return;
      }

      // Prepare update object
      const updatedTenant: any = {
        ...this.selectedTenant,
        firstName: this.editTenantData.firstName,
        lastName: this.editTenantData.lastName,
        email: this.editTenantData.email,
        phone: this.editTenantData.phone,
        propertyId: this.editTenantData.propertyId
      };

      // Update tenant name helper
      updatedTenant.name = `${updatedTenant.firstName} ${updatedTenant.lastName}`;
      updatedTenant.initials = `${updatedTenant.firstName?.charAt(0) || ''}${updatedTenant.lastName?.charAt(0) || ''}`;

      // Update the selected tenant in the array
      const index = this.tenants.findIndex(t => t.id === this.selectedTenant?.id);
      if (index !== -1) {
        this.tenants[index] = updatedTenant;
      }

      this.closeEditTenantModal();
    }
  }

  contactTenant(id: number) {
    const tenant = this.tenants.find(t => t.id === id);
    if (tenant) {
      // Navigate to messages and pre-select tenant
      this.activeSection = 'messages';
      // You could also open a compose message modal here
      window.location.href = `mailto:${tenant.email}?subject=Regarding Rent - ${this.getTenantProperty(tenant)?.address || ''}`;
    }
  }

  viewTenantDetails(id: number) {
    const tenant = this.tenants.find(t => t.id === id);
    if (tenant) {
      this.selectedTenant = tenant;
      this.showViewTenantModal = true;
    }
  }

  closeViewTenantModal() {
    this.showViewTenantModal = false;
    this.selectedTenant = null;
  }

  deleteTenant(id: number) {
    if (confirm('Are you sure you want to remove this tenant?')) {
      this.tenants = this.tenants.filter(t => t.id !== id);
      this.closeViewTenantModal();
    }
  }

  // Messages methods
  updateUnreadMessagesCount() {
    this.unreadMessagesCount = this.messages.filter(m => !m.read).length;
  }

  isPaymentOverdue(payment: Payment): boolean {
    return payment.status === PaymentStatus.PENDING && new Date(payment.dueDate) < new Date();
  }

  selectMessage(message: Message) {
    this.selectedMessage = message;
    if (!message.read) {
      message.read = true;
      this.updateUnreadMessagesCount();
    }
  }

  markAsRead(message: Message) {
    message.read = true;
    this.updateUnreadMessagesCount();
  }

  deleteMessage(message: Message) {
    const index = this.messages.findIndex(m => m.id === message.id);
    if (index > -1) {
      this.messages.splice(index, 1);
      this.updateUnreadMessagesCount();
    }
  }

  // Helper functions
  getStatusClass(status: string | PropertyStatus): string {
    const statusStr = status.toString().toUpperCase();
    switch (statusStr) {
      case 'RENTED': return 'status-success';
      case 'AVAILABLE': return 'status-success';
      case 'MAINTENANCE': return 'status-warning';
      case 'PENDING': return 'status-warning';
      case 'UNAVAILABLE': return 'status-error';
      case 'ARCHIVED': return 'status-info';
      case 'COMPLETED': return 'status-success';
      case 'IN_PROGRESS': return 'status-info';
      case 'CANCELLED': return 'status-error';
      default: return '';
    }
  }

  getPriorityClass(priority: string | MaintenancePriority): string {
    const p = priority.toString().toUpperCase();
    switch (p) {
      case 'LOW': return 'priority-low';
      case 'MEDIUM': return 'priority-medium';
      case 'HIGH': return 'priority-high';
      case 'URGENT': return 'priority-urgent';
      default: return 'priority-medium';
    }
  }

  getMaintenanceStatusClass(status: string | MaintenanceStatus): string {
    // Re-use generic status class logic or define specific
    const s = status.toString().toUpperCase();
    switch (s) {
      case 'COMPLETED': return 'status-success';
      case 'IN_PROGRESS': return 'status-info';
      case 'PENDING': return 'status-warning';
      case 'CANCELLED': return 'status-error';
      default: return '';
    }
  }

  // ===== MAINTENANCE SECTION METHODS =====

  // Maintenance Filter Methods
  setMaintenanceStatusFilter(filter: string) {
    this.maintenanceStatusFilter = filter;
    this.maintenanceCurrentPage = 1;
  }

  setMaintenancePriorityFilter(filter: string) {
    this.maintenancePriorityFilter = filter;
    this.maintenanceCurrentPage = 1;
  }

  getPendingMaintenance(): MaintenanceRequest[] {
    return this.maintenanceRequests.filter(r => r.status === MaintenanceStatus.PENDING);
  }

  getInProgressMaintenance(): MaintenanceRequest[] {
    return this.maintenanceRequests.filter(r => r.status === MaintenanceStatus.IN_PROGRESS);
  }

  getCompletedMaintenance(): MaintenanceRequest[] {
    return this.maintenanceRequests.filter(r => r.status === MaintenanceStatus.COMPLETED);
  }

  getAllFilteredMaintenance(): MaintenanceRequest[] {
    let filtered = this.maintenanceRequests;

    // Apply status filter
    if (this.maintenanceStatusFilter !== 'all') {
      filtered = filtered.filter(r => r.status.toString().toUpperCase() === this.maintenanceStatusFilter.toUpperCase());
    }

    // Apply priority filter
    if (this.maintenancePriorityFilter !== 'all') {
      filtered = filtered.filter(r => r.priority.toString().toUpperCase() === this.maintenancePriorityFilter.toUpperCase());
    }

    // Apply search filter
    if (this.maintenanceSearchQuery.trim()) {
      const query = this.maintenanceSearchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query)
        // Note: searching property/tenant name requires lookup which we skip for now
      );
    }

    return filtered;
  }

  getFilteredMaintenanceCount(): number {
    return this.getAllFilteredMaintenance().length;
  }

  getFilteredMaintenance(): MaintenanceRequest[] {
    const filtered = this.getAllFilteredMaintenance();
    const start = (this.maintenanceCurrentPage - 1) * this.maintenanceItemsPerPage;
    const end = start + this.maintenanceItemsPerPage;
    return filtered.slice(start, end);
  }

  // Maintenance Pagination Methods
  getMaintenanceTotalPages(): number {
    return Math.ceil(this.getFilteredMaintenanceCount() / this.maintenanceItemsPerPage);
  }

  getMaintenancePageNumbers(): number[] {
    const totalPages = this.getMaintenanceTotalPages();
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  goToMaintenancePage(page: number) {
    if (page >= 1 && page <= this.getMaintenanceTotalPages()) {
      this.maintenanceCurrentPage = page;
    }
  }

  nextMaintenancePage() {
    if (this.maintenanceCurrentPage < this.getMaintenanceTotalPages()) {
      this.maintenanceCurrentPage++;
    }
  }

  previousMaintenancePage() {
    if (this.maintenanceCurrentPage > 1) {
      this.maintenanceCurrentPage--;
    }
  }

  // Maintenance Action Methods
  openAddMaintenanceModal() {
    this.showAddMaintenanceModal = true;
    this.newMaintenance = {
      propertyId: 0,
      title: '',
      description: '',
      priority: MaintenancePriority.MEDIUM,
      tenantId: 0
    };
  }

  closeAddMaintenanceModal() {
    this.showAddMaintenanceModal = false;
  }

  saveMaintenance() {
    // Basic validation
    if (!this.newMaintenance.title || !this.newMaintenance.propertyId) {
      return;
    }

    const request: MaintenanceCreateRequest = {
      propertyId: Number(this.newMaintenance.propertyId),
      title: this.newMaintenance.title,
      description: this.newMaintenance.description,
      priority: this.newMaintenance.priority,
      tenantId: Number(this.newMaintenance.tenantId),
      category: 'General', // Default or add field
      images: []
    };

    this.maintenanceService.createMaintenanceRequest(request).then(newRequest => {
      this.maintenanceRequests.unshift(newRequest);
      this.stats.maintenanceRequests++;
      this.stats.pendingRequests++;
      this.closeAddMaintenanceModal();
    }).catch(err => console.error('Error creating maintenance request', err));
  }

  viewMaintenanceDetails(id: number) {
    const request = this.maintenanceRequests.find(r => r.id === id);
    if (request) {
      this.selectedMaintenance = request;
      this.showViewMaintenanceModal = true;
    }
  }

  closeViewMaintenanceModal() {
    this.showViewMaintenanceModal = false;
    this.selectedMaintenance = null;
  }

  editMaintenance(id: number) {
    const request = this.maintenanceRequests.find(r => r.id === id);
    if (request) {
      this.selectedMaintenance = request;
      this.editMaintenanceData = {
        propertyId: request.propertyId,
        title: request.title,
        description: request.description,
        priority: request.priority,
        status: request.status,
        tenantId: request.tenantId
      };
      this.showEditMaintenanceModal = true;
    }
  }

  closeEditMaintenanceModal() {
    this.showEditMaintenanceModal = false;
    this.selectedMaintenance = null;
    this.editMaintenanceData = {};
  }

  saveEditMaintenance() {
    if (this.selectedMaintenance) {
      this.selectedMaintenance.propertyId = this.editMaintenanceData.propertyId;
      this.selectedMaintenance.title = this.editMaintenanceData.title;
      this.selectedMaintenance.description = this.editMaintenanceData.description;
      this.selectedMaintenance.priority = this.editMaintenanceData.priority;
      this.selectedMaintenance.status = this.editMaintenanceData.status;
      this.selectedMaintenance.tenantId = this.editMaintenanceData.tenantId;

      this.closeEditMaintenanceModal();
    }
  }

  deleteMaintenance(id: number) {
    if (confirm('Are you sure you want to delete this maintenance request?')) {
      this.maintenanceRequests = this.maintenanceRequests.filter(r => r.id !== id);
      this.closeViewMaintenanceModal();
    }
  }

  startMaintenance(id: number) {
    const request = this.maintenanceRequests.find(r => r.id === id);
    if (request) {
      request.status = MaintenanceStatus.IN_PROGRESS;
    }
  }

  completeMaintenance(id: number) {
    const request = this.maintenanceRequests.find(r => r.id === id);
    if (request) {
      request.status = MaintenanceStatus.COMPLETED;
    }
  }

  // ===== TENANT PAGINATION METHODS =====

  getAllFilteredTenants(): Tenant[] {
    let filtered = this.tenants;

    // Note: Payment status filter removed as it requires joining with Payment data
    // which is not currently efficient here.

    // Apply search filter
    if (this.tenantSearchQuery.trim()) {
      const query = this.tenantSearchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        this.getTenantName(t).toLowerCase().includes(query) ||
        t.email.toLowerCase().includes(query)
      );
    }

    return filtered;
  }


  getFilteredTenantsCount(): number {
    return this.getAllFilteredTenants().length;
  }

  getTenantTotalPages(): number {
    return Math.ceil(this.getFilteredTenantsCount() / this.tenantItemsPerPage);
  }

  getTenantPageNumbers(): number[] {
    const totalPages = this.getTenantTotalPages();
    if (totalPages <= 0) return [1];
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  goToTenantPage(page: number) {
    if (page >= 1 && page <= this.getTenantTotalPages()) {
      this.tenantCurrentPage = page;
    }
  }

  nextTenantPage() {
    if (this.tenantCurrentPage < this.getTenantTotalPages()) {
      this.tenantCurrentPage++;
    }
  }

  previousTenantPage() {
    if (this.tenantCurrentPage > 1) {
      this.tenantCurrentPage--;
    }
  }

  /**
   * Get property image URL with fallback
   */
  getPropertyImageUrl(property: Property): string {
    if (property.photos && property.photos.length > 0) {
      const firstPhoto = property.photos[0];
      // Ensure the URL is properly formatted
      if (firstPhoto && firstPhoto.trim()) {
        // If the URL doesn't start with http, it's a relative path from the backend
        const imageUrl = firstPhoto.startsWith('http') 
          ? firstPhoto 
          : firstPhoto;
        return `url(${imageUrl})`;
      }
    }
    // Fallback to a simple gray background
    return 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=)';
  }

  // Rental Request Methods
  getPropertyAddress(propertyId: number): string {
    const property = this.properties.find(p => p.id === propertyId);
    return property ? `${property.address}, ${property.city}` : `Property #${propertyId}`;
  }

  getTenantNameById(tenantId: number): string {
    const tenant = this.tenants.find(t => t.id === tenantId);
    return tenant ? `${tenant.firstName} ${tenant.lastName}` : `Tenant #${tenantId}`;
  }

  getRentalRequestStatusClass(status: RentalRequestStatus): string {
    switch (status) {
      case RentalRequestStatus.PENDING:
        return 'warning';
      case RentalRequestStatus.APPROVED:
        return 'success';
      case RentalRequestStatus.REJECTED:
        return 'danger';
      case RentalRequestStatus.CANCELLED:
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  async approveRentalRequest(request: RentalRequest) {
    try {
      await this.rentalRequestService.updateRentalRequest(request.id, {
        status: RentalRequestStatus.APPROVED,
        responseMessage: 'Your rental request has been approved!'
      });
      // Update local state
      request.status = RentalRequestStatus.APPROVED;
      request.responseDate = new Date();
      this.stats.pendingRequests = this.rentalRequests.filter(r => r.status === RentalRequestStatus.PENDING).length;
      // You could show a success message here
    } catch (error) {
      console.error('Error approving rental request:', error);
      // You could show an error message here
    }
  }

  async rejectRentalRequest(request: RentalRequest) {
    try {
      const responseMessage = prompt('Enter rejection reason (optional):') || 'Your rental request has been rejected.';
      await this.rentalRequestService.updateRentalRequest(request.id, {
        status: RentalRequestStatus.REJECTED,
        responseMessage: responseMessage
      });
      // Update local state
      request.status = RentalRequestStatus.REJECTED;
      request.responseDate = new Date();
      this.stats.pendingRequests = this.rentalRequests.filter(r => r.status === RentalRequestStatus.PENDING).length;
      // You could show a success message here
    } catch (error) {
      console.error('Error rejecting rental request:', error);
      // You could show an error message here
    }
  }

  viewRentalRequest(request: RentalRequest) {
    // For now, just log the request. You could open a modal or navigate to a detail page
    console.log('Viewing rental request:', request);
    alert(`Rental Request Details:\n\nProperty: ${this.getPropertyAddress(request.propertyId)}\nTenant: ${this.getTenantNameById(request.tenantId)}\nMessage: ${request.message || 'No message'}\nStatus: ${request.status}\nRequested: ${request.requestedDate}`);
  }
}
