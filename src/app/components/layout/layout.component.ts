import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';

interface MenuItem {
  key: string;
  label: string;
  link: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  @ViewChild('profileRef') profileRef!: ElementRef;

  private profileService = inject(ProfileService);
  private auth = inject(AuthService);
  private router = inject(Router);
  profile = this.profileService.get();

  profileOpen = false;

  menuItems: MenuItem[] = [
    { key: 'media', label: 'Mídias', link: '/media' },
    { key: 'playlists', label: 'Playlists', link: '/playlists' },
    { key: 'profile', label: 'Perfil', link: '/profile' },
  ];

  constructor() {
    if (!this.auth.getUser()) {
      this.router.navigate(['/login']);
    }
  }

  toggleProfile() {
    this.profileOpen = !this.profileOpen;
  }

  closeProfile() {
    this.profileOpen = false;
  }

  logout() {
    this.auth.logout();
    this.closeProfile();
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (
      this.profileOpen &&
      this.profileRef &&
      !this.profileRef.nativeElement.contains(event.target)
    ) {
      this.profileOpen = false;
    }
  }
}