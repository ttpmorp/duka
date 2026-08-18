import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile-settings.component.html',
})
export class ProfileSettingsComponent {
  private profile = inject(ProfileService);

  tab: 'account' | 'security' = 'account';
  saved = false;

  avatarPreview: string = this.profile.get().avatar;
  avatarFile: File | null = null;

  form = {
    name: this.profile.get().name,
    email: this.profile.get().email,
    role: this.profile.get().role,
    location: this.profile.get().location,
    bio: this.profile.get().bio,
  };

  pass = { current: '', next: '', confirm: '' };

  get canSave(): boolean {
    return this.form.name.trim().length > 0 && this.form.email.includes('@');
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Selecione um arquivo de imagem.');
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreview = String(reader.result);
      this.avatarFile = file;
    };
    reader.readAsDataURL(file);
  }

  removeAvatar() {
    this.avatarPreview = this.profile.get().avatar;
    this.avatarFile = null;
  }

  saveAccount() {
    const current = this.profile.get();
    this.profile.set({
      ...current,
      name: this.form.name.trim(),
      email: this.form.email.trim(),
      role: this.form.role.trim(),
      location: this.form.location.trim(),
      bio: this.form.bio.trim(),
      avatar: this.avatarFile ? this.avatarPreview : current.avatar,
    });
    this.avatarFile = null;
    this.flashSaved();
  }

  saveSecurity() {
    if (!this.pass.current || this.pass.next.length < 6) return;
    if (this.pass.next !== this.pass.confirm) return;
    this.pass = { current: '', next: '', confirm: '' };
    this.flashSaved();
  }

  private flashSaved() {
    this.saved = true;
    setTimeout(() => (this.saved = false), 2500);
  }
}
