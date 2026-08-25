import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HomePage from './HomePage';
import * as postsService from '../services/posts';

describe('HomePage — rendering', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders posts given mock data', async () => {
    render(<HomePage />);

    // Loading state should appear first
    expect(screen.getByText(/loading posts/i)).toBeInTheDocument();

    // Then posts should appear once the mock resolves
    const post = await screen.findByText('Understanding useEffect');
    expect(post).toBeInTheDocument();
  });

  it('shows empty state when scenario returns no posts', async () => {
    vi.spyOn(postsService, 'getPosts').mockResolvedValueOnce([]);

    render(<HomePage />);

    const emptyMessage = await screen.findByText(/no posts found/i);
    expect(emptyMessage).toBeInTheDocument();
  });

  it('shows error state (+ Retry) when the fetch fails', async () => {
    vi.spyOn(postsService, 'getPosts').mockRejectedValueOnce(
      new Error('Failed to fetch posts')
    );

    render(<HomePage />);

    const errorMessage = await screen.findByText(/something went wrong/i);
    expect(errorMessage).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });
});