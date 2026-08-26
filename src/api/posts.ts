import type { Post } from '../types/post';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getToken(): string | null {
  return localStorage.getItem('authToken');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Token ${token}` } : {};
}

export async function getPosts(): Promise<Post[]> {
  const response = await fetch(`${BASE_URL}/posts/`);
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  return response.json();
}

export async function getPostBySlug(slug: string): Promise<Post> {
  const response = await fetch(`${BASE_URL}/posts/${slug}/`);
  if (!response.ok) {
    throw new Error('Failed to fetch post');
  }
  return response.json();
}

export async function createPost(data: {
  title: string;
  slug: string;
  content: string;
}): Promise<Post> {
  const response = await fetch(`${BASE_URL}/posts/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create post');
  }
  return response.json();
}

export async function updatePost(
  slug: string,
  data: Partial<{ title: string; slug: string; content: string }>
): Promise<Post> {
  const response = await fetch(`${BASE_URL}/posts/${slug}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update post');
  }
  return response.json();
}

export async function deletePost(slug: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/posts/${slug}/`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to delete post');
  }
}