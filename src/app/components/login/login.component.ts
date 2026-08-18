import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private router = inject(Router);
  private profileService = inject(ProfileService);
  private auth = inject(AuthService);

  name = '';
  email = '';
  remember = true;

  get canLogin(): boolean {
    return this.name.trim().length > 0 && this.email.includes('@');
  }

  login() {
    if (!this.canLogin) return;
    this.auth.setUser({ name: this.name.trim(), email: this.email.trim() }, this.remember);
    const current = this.profileService.get();
    this.profileService.set({ ...current, name: this.name.trim(), email: this.email.trim() });
    this.router.navigate(['/media']);
  }
}