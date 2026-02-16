import { create } from 'zustand';

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

function getStoredAuth(): { user: User | null; token: string | null } {
  if (typeof window === 'undefined') return { user: null, token: null };
  try {
    let token = localStorage.getItem('token');
    let userStr = localStorage.getItem('user');
    if (!token && !userStr) {
      // Migrate from old persist key (auth-storage)
      const stored = localStorage.getItem('auth-storage');
      if (stored) {
        const parsed = JSON.parse(stored) as { state?: { user?: User; token?: string } };
        if (parsed?.state?.token && parsed?.state?.user) {
          token = parsed.state.token;
          userStr = JSON.stringify(parsed.state.user);
          localStorage.setItem('token', token);
          localStorage.setItem('user', userStr);
        }
      }
    }
    if (token && userStr) {
      const user = JSON.parse(userStr) as User;
      return { user, token };
    }
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  return { user: null, token: null };
}

const stored = getStoredAuth();

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: stored.user,
  token: stored.token,
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
    localStorage.removeItem('auth-storage');
    set({ user: null, token: null });
  },
  isAuthenticated: () => !!get().token && !!get().user,
  isCitizen: () => get().user?.role === 'citizen',
  isAgency: () => ['agency', 'agency_employee', 'agency_admin'].includes(get().user?.role || ''),
  isAdmin: () => ['admin', 'super_admin'].includes(get().user?.role || ''),
}));
