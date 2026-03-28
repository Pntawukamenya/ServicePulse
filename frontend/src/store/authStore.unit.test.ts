import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

describe('authStore (unit)', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ user: null, token: null });
  });

  it('setAuth stores user and token and reports authenticated', () => {
    useAuthStore.getState().setAuth(
      { id: 'u1', fullName: 'Test User', role: 'citizen' },
      'jwt-token'
    );
    expect(useAuthStore.getState().token).toBe('jwt-token');
    expect(useAuthStore.getState().user?.role).toBe('citizen');
    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
    expect(useAuthStore.getState().isCitizen()).toBe(true);
    expect(useAuthStore.getState().isAgency()).toBe(false);
  });

  it('isAgency reflects agency roles; isAdmin only for platform admins', () => {
    useAuthStore.getState().setAuth(
      { id: 'a1', fullName: 'Agency', role: 'agency_admin', agencyCode: 'REG' },
      't2'
    );
    expect(useAuthStore.getState().isAgency()).toBe(true);
    expect(useAuthStore.getState().isAdmin()).toBe(false);
    useAuthStore.getState().setAuth({ id: 's1', fullName: 'Admin', role: 'super_admin' }, 't3');
    expect(useAuthStore.getState().isAdmin()).toBe(true);
  });

  it('logout clears state and localStorage keys', () => {
    useAuthStore.getState().setAuth({ id: 'u', fullName: 'X', role: 'citizen' }, 't');
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('updateUserAvatar updates user when logged in', () => {
    useAuthStore.getState().setAuth({ id: 'u', fullName: 'X', role: 'citizen' }, 't');
    useAuthStore.getState().updateUserAvatar('https://example.com/a.png');
    expect(useAuthStore.getState().user?.avatarUrl).toBe('https://example.com/a.png');
  });
});
