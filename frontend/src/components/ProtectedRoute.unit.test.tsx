import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuthStore } from '../store/authStore';

vi.mock('../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

const mockUseAuthStore = vi.mocked(useAuthStore);

/** Opt in to v7 behavior so tests don't print React Router future-flag warnings to stderr. */
const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const;

describe('ProtectedRoute (unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('redirects unauthenticated users to /login', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: () => false,
      user: null,
      token: null,
      setAuth: vi.fn(),
      logout: vi.fn(),
      updateUserAvatar: vi.fn(),
      isCitizen: () => false,
      isAgency: () => false,
      isAdmin: () => false,
    } as unknown as ReturnType<typeof useAuthStore>);

    render(
      <MemoryRouter initialEntries={['/secret']} future={routerFuture}>
        <Routes>
          <Route path="/login" element={<div>LoginPage</div>} />
          <Route
            path="/secret"
            element={
              <ProtectedRoute>
                <div>SecretContent</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('LoginPage')).toBeInTheDocument();
    expect(screen.queryByText('SecretContent')).not.toBeInTheDocument();
  });

  it('renders children when authenticated and role matches', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: () => true,
      user: { id: '1', fullName: 'A', role: 'citizen' },
      token: 't',
      setAuth: vi.fn(),
      logout: vi.fn(),
      updateUserAvatar: vi.fn(),
      isCitizen: () => true,
      isAgency: () => false,
      isAdmin: () => false,
    } as unknown as ReturnType<typeof useAuthStore>);

    render(
      <MemoryRouter initialEntries={['/dash']} future={routerFuture}>
        <Routes>
          <Route path="/login" element={<div>LoginPage</div>} />
          <Route
            path="/dash"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <div>CitizenDash</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('CitizenDash')).toBeInTheDocument();
  });

  it('redirects to home when role is not allowed', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: () => true,
      user: { id: '1', fullName: 'A', role: 'citizen' },
      token: 't',
      setAuth: vi.fn(),
      logout: vi.fn(),
      updateUserAvatar: vi.fn(),
      isCitizen: () => true,
      isAgency: () => false,
      isAdmin: () => false,
    } as unknown as ReturnType<typeof useAuthStore>);

    render(
      <MemoryRouter initialEntries={['/admin']} future={routerFuture}>
        <Routes>
          <Route path="/" element={<div>HomePage</div>} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <div>AdminOnly</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('HomePage')).toBeInTheDocument();
    expect(screen.queryByText('AdminOnly')).not.toBeInTheDocument();
  });
});
