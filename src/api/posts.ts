import type { Post } from '../types/post';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getToken(): string | null {
  return localStorage.getItem('authToken');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Token ${token}` } : {};
}

/** Helper to turn DRF error bodies into a readable string */
async function parseError(response: Response, fallback: string): Promise<string> {
  try {
    const errorBody = await response.json();
    if (errorBody && typeof errorBody === 'object') {
      // DRF usually returns { field: ["message"] } or { detail: "..." }
      const messages = Object.values(errorBody).flat();
      if (messages.length > 0) {
        return messages.join(' ');
      }
    }
  } catch {
    // ignore JSON parse errors
  }
  return fallback;
}

export async function getPosts(): Promise<Post[]> {
  const response = await fetch(`${BASE_URL}/posts/`);
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  const data = await response.json();
  return data.results;
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
    const message = await parseError(response, 'Failed to create post');
    throw new Error(message);
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
    const message = await parseError(response, 'Failed to update post');
    throw new Error(message);
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
