import { create } from 'zustand';
import type { User } from '@kaigo-ide/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    // JWTのペイロードをデコード（署名検証はサーバー側）
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // トークン有効期限チェック
      if (payload.exp * 1000 < Date.now()) {
        // 期限切れ → refreshトークンで更新を試みる
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          })
            .then((res) => (res.ok ? res.json() : Promise.reject()))
            .then((data) => {
              localStorage.setItem('access_token', data.accessToken);
              localStorage.setItem('refresh_token', data.refreshToken);
              const p = JSON.parse(atob(data.accessToken.split('.')[1]));
              set({
                user: {
                  id: p.sub,
                  email: p.email,
                  name: p.email.split('@')[0],
                  tenantId: p.tenantId,
                  role: p.role,
                },
                isAuthenticated: true,
              });
            })
            .catch(() => {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
            });
        } else {
          localStorage.removeItem('access_token');
        }
        return;
      }
      set({
        user: {
          id: payload.sub,
          email: payload.email,
          name: payload.email.split('@')[0],
          tenantId: payload.tenantId,
          role: payload.role,
        },
        isAuthenticated: true,
      });
    } catch {
      localStorage.removeItem('access_token');
    }
  },
}));
