import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AuthContext } from '../context/AuthContext';

function renderWithAuth(user: null | { id: number; username: string; email: string }) {
  const mockAuthValue = {
    user,
    token: user ? 'fake-token' : null,
    loading: false,
    login: async () => {},
    register: async () => {},
    logout: async () => {},
  };

  return render(
    <AuthContext.Provider value={mockAuthValue}>
      <MemoryRouter initialEntries={['/posts/new']}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route
            path="/posts/new"
            element={
              <ProtectedRoute>
                <div>Protected content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to /login', () => {
    renderWithAuth(null);
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('renders children for authenticated users', () => {
    renderWithAuth({ id: 1, username: 'michelle', email: 'michelle@example.com' });
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });
});