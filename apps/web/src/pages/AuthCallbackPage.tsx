import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth-store';
import { api } from '../lib/api-client';
import type { User } from '@kaigo-ide/types';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    // URLフラグメントからトークンを取得（サーバーログに残らない）
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get('token');
    const refresh = params.get('refresh');

    // フラグメントを即座にクリア（履歴に残さない）
    window.history.replaceState(null, '', window.location.pathname);

    if (token && refresh) {
      localStorage.setItem('access_token', token);
      api
        .get<{ user: User }>('/auth/me')
        .then((res) => {
          setAuth(res.user, token, refresh);
          navigate('/');
        })
        .catch(() => {
          localStorage.removeItem('access_token');
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [navigate, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">認証処理中...</p>
    </div>
  );
}
