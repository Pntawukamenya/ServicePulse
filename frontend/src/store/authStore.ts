import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email?: string;
  fullName: string;
  phoneNumber?: string;
  role: string;
  agencyId?: string;
  agencyCode?: string;
  avatarUrl?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  updateUserAvatar: (avatarUrl: string | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isCitizen: () => boolean;
  isAgency: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, token });
      },
      updateUserAvatar: (avatarUrl) => {
        const current = get().user;
        if (!current) return;
        const updated = { ...current, avatarUrl };
        localStorage.setItem('user', JSON.stringify(updated));
        set({ user: updated });
      },
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null });
      },
      isAuthenticated: () => !!get().token && !!get().user,
      isCitizen: () => get().user?.role === 'citizen',
      isAgency: () => ['agency', 'agency_employee', 'agency_admin'].includes(get().user?.role || ''),
      isAdmin: () => ['admin', 'super_admin'].includes(get().user?.role || ''),
    }),
    {
      name: 'auth-storage',
    }
  )
);
