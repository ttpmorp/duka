import { Injectable } from '@angular/core';

export interface Profile {
  name: string;
  email: string;
  role: string;
  location: string;
  bio: string;
  skills: string[];
  avatar: string;
}

const DEFAULT: Profile = {
  name: 'Operador Duka',
  email: 'admin@duka.tv',
  role: 'Administrador',
  location: 'São Paulo, SP',
  bio: 'Responsável pela operação das TVs corporativas e pelo gerenciamento de conteúdo exibido nos painéis.',
  skills: ['TV Corporativa', 'Mídias', 'Playlists'],
  avatar: 'https://i.pravatar.cc/96?img=12',
};

const KEY = 'duka-profile';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  get(): Profile {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return { ...DEFAULT, ...JSON.parse(raw) };
    } catch {
      /* ignore */
    }
    return { ...DEFAULT };
  }

  set(profile: Profile) {
    localStorage.setItem(KEY, JSON.stringify(profile));
  }
}
