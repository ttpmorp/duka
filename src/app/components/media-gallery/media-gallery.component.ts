import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';
import { ApiService, MediaItem } from '../../services/api.service';

@Component({
  selector: 'app-media-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './media-gallery.component.html',
})
export class MediaGalleryComponent implements OnInit {
  private api = inject(ApiService);

  mediaList: MediaItem[] = [];
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  duration = 10;
  uploading = false;
  uploadProgress = 0;
  selectedMediaId: string | null = null;
  loading = false;

  ngOnInit() {
    this.loadMedia();
  }

  loadMedia() {
    this.loading = true;
    this.api.getMedia().subscribe({
      next: (data) => {
        this.mediaList = data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.previewUrl = URL.createObjectURL(this.selectedFile);
    }
  }

  uploadMedia() {
    if (!this.selectedFile) return;
    this.uploading = true;
    this.uploadProgress = 0;

    this.api.uploadMedia(this.selectedFile, this.duration).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round((event.loaded / event.total) * 100);
        }
        if (event.type === HttpEventType.Response) {
          this.uploading = false;
          this.selectedFile = null;
          this.previewUrl = null;
          this.uploadProgress = 0;
          this.loadMedia();
        }
      },
      error: () => {
        this.uploading = false;
        this.uploadProgress = 0;
      },
    });
  }

  deleteMedia(id: string) {
    if (!confirm('Tem certeza que deseja remover esta mídia?')) return;
    this.api.deleteMedia(id).subscribe(() => this.loadMedia());
  }

  toggleSelect(media: MediaItem) {
    this.selectedMediaId = this.selectedMediaId === media.id ? null : media.id;
  }

  getMediaUrl(url: string): string {
    return this.api.getFullMediaUrl(url);
  }

  isVideo(item: MediaItem): boolean {
    return item.file_type === 'video';
  }

  isGif(item: MediaItem): boolean {
    return item.file_type === 'gif';
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
