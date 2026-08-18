import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  inject,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService, PlaylistDetail, MediaItem } from '../../services/api.service';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player.component.html',
})
export class PlayerComponent implements OnInit, OnDestroy {
  @ViewChild('videoEl') videoEl!: ElementRef<HTMLVideoElement>;
  @ViewChild('playerContainer') playerContainer!: ElementRef<HTMLDivElement>;

  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private zone = inject(NgZone);

  playlist: PlaylistDetail | null = null;
  currentIndex = 0;
  currentMedia: MediaItem | null = null;
  fadeClass = 'opacity-100';
  loading = true;
  error = '';
  isFullscreen = false;
  fillScreen = false;
  showControls = true;
  videoSrc = '';

  private timer: any = null;
  private reloadTimer: any = null;
  private controlsTimer: any = null;
  playlistId = 0;

  ngOnInit() {
    document.addEventListener('fullscreenchange', this.onFullscreenChange);
    this.route.queryParams.subscribe((params) => {
      this.playlistId = +params['playlistId'] || 0;
      if (this.playlistId) {
        this.loadPlaylist();
        // Reload playlist every 30s to pick up changes
        this.reloadTimer = setInterval(() => this.loadPlaylistSilent(), 30000);
      } else {
        this.error = 'Nenhum playlistId fornecido. Use: /player?playlistId=1';
        this.loading = false;
      }
    });
  }

  ngOnDestroy() {
    clearTimeout(this.timer);
    clearInterval(this.reloadTimer);
    clearTimeout(this.controlsTimer);
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
  }

  loadPlaylist() {
    this.loading = true;
    this.api.getPlaylist(this.playlistId).subscribe({
      next: (data) => {
        this.playlist = data;
        this.loading = false;
        if (data.media_items.length > 0) {
          this.playCurrent();
        } else {
          this.error = 'Esta playlist está vazia.';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Playlist não encontrada.';
      },
    });
  }

  loadPlaylistSilent() {
    this.api.getPlaylist(this.playlistId).subscribe({
      next: (data) => {
        this.playlist = data;
      },
    });
  }

  playVideo() {
    if (!this.videoEl) return;
    const vid = this.videoEl.nativeElement;
    // Wait for video to be ready, then play
    const tryPlay = () => {
      vid.play().catch((err: any) => {
        console.warn('Video play failed:', err.message);
        // Fallback: advance to next media
        setTimeout(() => this.nextMedia(), 500);
      });
    };
    if (vid.readyState >= 3) {
      // HAVE_FUTURE_DATA
      vid.currentTime = 0;
      tryPlay();
    } else {
      vid.oncanplay = () => {
        vid.oncanplay = null;
        tryPlay();
      };
    }
  }

  playCurrent() {
    if (!this.playlist || this.playlist.media_items.length === 0) return;

    this.currentMedia = this.playlist.media_items[this.currentIndex];
    this.fadeClass = 'opacity-0';

    // Fade in
    setTimeout(() => {
      this.fadeClass = 'opacity-100';
    }, 50);

    // Handle video
    if (this.currentMedia.file_type === 'video') {
      // Set video source and trigger play after DOM update
      this.videoSrc = this.getMediaUrl(this.currentMedia.url);
      setTimeout(() => this.playVideo(), 150);
    } else {
      this.videoSrc = '';
      // Image or GIF: show for duration
      const duration = (this.currentMedia.duration_seconds || 10) * 1000;
      this.timer = setTimeout(() => this.nextMedia(), duration);
    }
  }

  nextMedia() {
    if (!this.playlist || this.playlist.media_items.length === 0) return;

    // Fade out
    this.fadeClass = 'opacity-0';
    setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % this.playlist!.media_items.length;
      this.playCurrent();
    }, 500);
  }

  getMediaUrl(url: string): string {
    return this.api.getFullMediaUrl(url);
  }

  isVideo(): boolean {
    return this.currentMedia?.file_type === 'video';
  }

  isGif(): boolean {
    return this.currentMedia?.file_type === 'gif';
  }

  get objectClass(): string {
    return this.fillScreen ? 'object-cover w-full h-full' : 'object-contain max-w-full max-h-full';
  }

  toggleBrowserFullscreen() {
    const el = this.playerContainer?.nativeElement;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  private onFullscreenChange = () => {
    this.isFullscreen = !!document.fullscreenElement;
  };

  toggleFillScreen() {
    this.fillScreen = !this.fillScreen;
  }

  onMouseMove() {
    this.showControls = true;
    clearTimeout(this.controlsTimer);
    this.controlsTimer = setTimeout(() => {
      this.showControls = false;
    }, 3000);
  }
}
