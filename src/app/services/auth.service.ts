import { Injectable } from '@angular/core';

export interface AuthUser {
  name: string;
  email: string;
}

const SESSION_KEY = 'duka-auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  getUser(): AuthUser | null {
    const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      const user = JSON.parse(raw);
      if (user && user.name) return user;
    } catch {
      /* ignore */
    }
    return null;
  }

  setUser(user: AuthUser, remember: boolean) {
    const raw = JSON.stringify(user);
    if (remember) {
      localStorage.setItem(SESSION_KEY, raw);
    } else {
      sessionStorage.setItem(SESSION_KEY, raw);
    }
  }

  logout() {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }
}