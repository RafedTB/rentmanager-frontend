import { Component, signal, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { filter } from 'rxjs/operators';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('rentmanager');
  showLayout = signal(true);

  constructor(
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Scroll to top on route change
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Scroll to top using multiple methods for compatibility
      if (isPlatformBrowser(this.platformId)) {
        window.scrollTo(0, 0);
        this.document.body.scrollTop = 0;
        this.document.documentElement.scrollTop = 0;
      }
      
      // Hide header/footer on admin and landlord dashboard routes
      const isAdminDashboard = event.url.includes('/admin/dashboard');
      const isLandlordDashboard = event.url.includes('/landlord/dashboard');
      this.showLayout.set(!isAdminDashboard && !isLandlordDashboard);
    });
    
    // Set initial state
    const isAdminDashboard = this.router.url.includes('/admin/dashboard');
    const isLandlordDashboard = this.router.url.includes('/landlord/dashboard');
    this.showLayout.set(!isAdminDashboard && !isLandlordDashboard);
  }
}
