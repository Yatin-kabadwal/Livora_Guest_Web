'use client';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@/store/auth';
import { api } from '@/lib/api';
import type { User } from '@/types';

/** Hydrates the persisted auth store on the client only, then refreshes the user. */
function AuthHydrator() {
  useEffect(() => {
    Promise.resolve(useAuth.persist.rehydrate()).then(async () => {
      useAuth.getState().setHydrated();
      if (useAuth.getState().accessToken) {
        try {
          const { data } = await api.get<User>('/auth/me');
          useAuth.getState().setUser({ ...data, id: data.id || data._id });
        } catch { /* interceptor handles refresh; ignore offline */ }
      }
    });
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthHydrator />
      {children}
      <Toaster position="top-center" toastOptions={{ duration: 4500, style: { background: '#10261b', color: '#f4efe2', border: '1px solid rgba(217,183,106,.35)', borderRadius: '14px', fontSize: '.9rem' }, iconTheme: { primary: '#d9b76a', secondary: '#07110c' } }} />
    </>
  );
}
