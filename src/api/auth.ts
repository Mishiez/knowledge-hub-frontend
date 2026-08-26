import type { AuthResponse, User } from '../types/auth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function register(data: {
  username: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Registration failed');
  }
  return response.json();
}

export async function login(data: {
  username: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Login failed');
  }
  return response.json();
}

export async function logout(token: string): Promise<void> {
  await fetch(`${BASE_URL}/auth/logout/`, {
    method: 'POST',
    headers: { Authorization: `Token ${token}` },
  });
}

export async function getCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${BASE_URL}/auth/me/`, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!response.ok) {
    throw new Error('Not authenticated');
  }
  return response.json();
}