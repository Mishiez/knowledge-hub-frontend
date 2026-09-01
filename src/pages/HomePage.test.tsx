import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import HomePage from './HomePage';
import * as postsApi from '../api/posts';
import type { Post } from '../types/post';

function renderHomePage() {
  return render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  );
}

const mockPosts: Post[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  title: `Test Post Title ${i + 1}`,
  slug: `test-post-title-${i + 1}`,
  content: `Content for post number ${i + 1}, used for search and pagination tests.`,
  author: 'Test Author',
  created_at: '2026-08-01T10:00:00Z',
  like_count: 0,
}));

describe('HomePage — rendering', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders posts given API data', async () => {
    vi.spyOn(postsApi, 'getPosts').mockResolvedValueOnce(mockPosts);

    renderHomePage();

    expect(screen.getByText(/loading posts/i)).toBeInTheDocument();

    const post = await screen.findByText('Test Post Title 1');
    expect(post).toBeInTheDocument();
  });

  it('shows empty state when API returns no posts', async () => {
    vi.spyOn(postsApi, 'getPosts').mockResolvedValueOnce([]);

    renderHomePage();

    const emptyMessage = await screen.findByText(/no posts found/i);
    expect(emptyMessage).toBeInTheDocument();
  });

  it('shows error state (+ Retry) when the fetch fails', async () => {
    vi.spyOn(postsApi, 'getPosts').mockRejectedValueOnce(new Error('Failed to fetch posts'));

    renderHomePage();

    const errorMessage = await screen.findByText(/something went wrong/i);
    expect(errorMessage).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });
});

describe('HomePage — interactions', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('typing in search filters the visible list', async () => {
    vi.spyOn(postsApi, 'getPosts').mockResolvedValueOnce(mockPosts);
    const user = userEvent.setup();
    renderHomePage();

    await screen.findByText('Test Post Title 1');

    const searchInput = screen.getByPlaceholderText(/search posts/i);
    await user.type(searchInput, 'Title 5');

    expect(screen.getByText('Test Post Title 5')).toBeInTheDocument();
    expect(screen.queryByText('Test Post Title 1')).not.toBeInTheDocument();
  });

  it('clicking Next shows the next page', async () => {
    vi.spyOn(postsApi, 'getPosts').mockResolvedValueOnce(mockPosts);
    const user = userEvent.setup();
    renderHomePage();

    // PAGE_SIZE is 4 → page 1 shows posts 1-4
    await screen.findByText('Test Post Title 1');
    expect(screen.getByText('Test Post Title 4')).toBeInTheDocument();
    expect(screen.queryByText('Test Post Title 5')).not.toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // page 2 shows posts 5-8
    expect(screen.getByText('Test Post Title 5')).toBeInTheDocument();
    expect(screen.queryByText('Test Post Title 1')).not.toBeInTheDocument();
  });

  it('resets to page 1 when search term changes', async () => {
    vi.spyOn(postsApi, 'getPosts').mockResolvedValueOnce(mockPosts);
    const user = userEvent.setup();
    renderHomePage();

    await screen.findByText('Test Post Title 1');

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);
    expect(screen.getByText('Test Post Title 5')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/search posts/i);
    await user.type(searchInput, 'Title 9');

    expect(screen.getByText('Test Post Title 9')).toBeInTheDocument();
  });
});

describe('HomePage — loading timing', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading state before data resolves, then replaces it', async () => {
    vi.spyOn(postsApi, 'getPosts').mockResolvedValueOnce(mockPosts);

    renderHomePage();

    expect(screen.getByText(/loading posts/i)).toBeInTheDocument();
    expect(screen.queryByText('Test Post Title 1')).not.toBeInTheDocument();

    await screen.findByText('Test Post Title 1');

    expect(screen.queryByText(/loading posts/i)).not.toBeInTheDocument();
  });
});
