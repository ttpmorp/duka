import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MediaItem {
  id: string;
  filename: string;
  original_name: string;
  file_type: string;
  mime_type: string;
  duration_seconds: number;
  file_size: number;
  url: string;
  created_at: string;
  position?: number;
}

export interface Playlist {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  media_count: number;
  player_url: string;
}

export interface PlaylistDetail {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  media_items: MediaItem[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = '';

  // Media
  getMedia(): Observable<MediaItem[]> {
    return this.http.get<MediaItem[]>(`${this.baseUrl}/api/media`);
  }

  uploadMedia(file: File, duration: number): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('duration', duration.toString());
    return this.http.post<any>(`${this.baseUrl}/api/media/upload`, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }

  deleteMedia(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/media/${id}`);
  }

  // Playlists
  getPlaylists(): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(`${this.baseUrl}/api/playlists`);
  }

  getPlaylist(id: number): Observable<PlaylistDetail> {
    return this.http.get<PlaylistDetail>(`${this.baseUrl}/api/playlists/${id}`);
  }

  createPlaylist(name: string, description: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/playlists`, { name, description });
  }

  deletePlaylist(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/playlists/${id}`);
  }

  addMediaToPlaylist(playlistId: number, mediaId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/playlists/${playlistId}/media/${mediaId}`, {});
  }

  removeMediaFromPlaylist(playlistId: number, mediaId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/playlists/${playlistId}/media/${mediaId}`);
  }

  getFullMediaUrl(url: string): string {
    return `${this.baseUrl}${url}`;
  }
}
