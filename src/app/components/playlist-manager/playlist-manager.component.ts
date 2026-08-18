import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Playlist, PlaylistDetail, MediaItem } from '../../services/api.service';

@Component({
  selector: 'app-playlist-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './playlist-manager.component.html',
})
export class PlaylistManagerComponent implements OnInit {
  private api = inject(ApiService);

  playlists: Playlist[] = [];
  mediaList: MediaItem[] = [];
  selectedMediaId: string | null = null;

  newPlaylistName = '';
  newPlaylistDescription = '';
  creating = false;

  expandedPlaylistId: number | null = null;
  playlistDetails: { [key: number]: PlaylistDetail } = {};

  copiedId: number | null = null;
  loading = false;

  ngOnInit() {
    this.loadPlaylists();
    this.loadMedia();
  }

  loadPlaylists() {
    this.loading = true;
    this.api.getPlaylists().subscribe({
      next: (data) => {
        this.playlists = data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  loadMedia() {
    this.api.getMedia().subscribe({
      next: (data) => (this.mediaList = data),
    });
  }

  createPlaylist() {
    if (!this.newPlaylistName.trim()) return;
    this.creating = true;
    this.api.createPlaylist(this.newPlaylistName, this.newPlaylistDescription).subscribe({
      next: () => {
        this.newPlaylistName = '';
        this.newPlaylistDescription = '';
        this.creating = false;
        this.loadPlaylists();
      },
      error: () => (this.creating = false),
    });
  }

  deletePlaylist(id: number) {
    if (!confirm('Tem certeza que deseja excluir esta playlist?')) return;
    this.api.deletePlaylist(id).subscribe(() => this.loadPlaylists());
  }

  toggleExpand(playlist: Playlist) {
    if (this.expandedPlaylistId === playlist.id) {
      this.expandedPlaylistId = null;
      return;
    }
    this.expandedPlaylistId = playlist.id;
    this.loadPlaylistDetail(playlist.id);
  }

  loadPlaylistDetail(id: number) {
    this.api.getPlaylist(id).subscribe({
      next: (detail) => {
        this.playlistDetails[id] = detail;
      },
    });
  }

  addSelectedMediaToPlaylist(playlistId: number) {
    if (!this.selectedMediaId) {
      alert('Selecione uma mídia na galeria primeiro. Vá até a aba Mídias e clique em uma mídia.');
      return;
    }
    this.api.addMediaToPlaylist(playlistId, this.selectedMediaId).subscribe({
      next: () => {
        this.selectedMediaId = null;
        this.loadPlaylistDetail(playlistId);
        this.loadPlaylists();
      },
      error: (err) => {
        if (err.status === 400) {
          alert('Esta mídia já está na playlist.');
        }
      },
    });
  }

  removeMediaFromPlaylist(playlistId: number, mediaId: string) {
    this.api.removeMediaFromPlaylist(playlistId, mediaId).subscribe({
      next: () => {
        this.loadPlaylistDetail(playlistId);
        this.loadPlaylists();
      },
    });
  }

  toggleSelectMedia(media: MediaItem) {
    this.selectedMediaId = this.selectedMediaId === media.id ? null : media.id;
  }

  getPlayerUrl(playlist: Playlist): string {
    return playlist.player_url || `${window.location.origin}/player?playlistId=${playlist.id}`;
  }

  copyPlayerUrl(playlist: Playlist) {
    const url = this.getPlayerUrl(playlist);
    navigator.clipboard.writeText(url).then(() => {
      this.copiedId = playlist.id;
      setTimeout(() => (this.copiedId = null), 2000);
    });
  }

  getMediaUrl(url: string): string {
    return this.api.getFullMediaUrl(url);
  }

  isVideo(item: MediaItem): boolean {
    return item.file_type === 'video';
  }

  getSelectedMediaName(): string {
    const m = this.mediaList.find((item) => item.id === this.selectedMediaId);
    return m ? m.original_name : '';
  }
}
