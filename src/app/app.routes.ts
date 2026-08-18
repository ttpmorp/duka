import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { LoginComponent } from './components/login/login.component';
import { MediaGalleryComponent } from './components/media-gallery/media-gallery.component';
import { PlaylistManagerComponent } from './components/playlist-manager/playlist-manager.component';
import { PlayerComponent } from './components/player/player.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ProfileSettingsComponent } from './components/profile-settings/profile-settings.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'player',
    component: PlayerComponent,
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'media', pathMatch: 'full' },
      { path: 'media', component: MediaGalleryComponent },
      { path: 'playlists', component: PlaylistManagerComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'profile/edit', component: ProfileSettingsComponent },
    ],
  },
  { path: '**', redirectTo: 'media' },
];
