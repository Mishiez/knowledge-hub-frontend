import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HomePage from './HomePage';
import * as postsService from '../services/posts';
import userEvent from '@testing-library/user-event';

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


describe('HomePage — interactions', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('typing in search filters the visible list', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    // wait for initial data to load
    await screen.findByText('Understanding useEffect');

    const searchInput = screen.getByPlaceholderText(/search posts/i);
    await user.type(searchInput, 'props');

    // matching post should remain
    expect(screen.getByText('Why Props Flow Down')).toBeInTheDocument();

    // non-matching post should be gone
    expect(
      screen.queryByText('Understanding useEffect')
    ).not.toBeInTheDocument();
  });

  it('clicking Next shows the next page', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    // page 1 should show the first two mock posts
    await screen.findByText('Understanding useEffect');
    expect(screen.getByText('Why Props Flow Down')).toBeInTheDocument();
    expect(
      screen.queryByText('TypeScript Interfaces vs Types')
    ).not.toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // page 2 should show the third post, and page 1's posts should be gone
    expect(
      screen.getByText('TypeScript Interfaces vs Types')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Understanding useEffect')
    ).not.toBeInTheDocument();
  });

  it('resets to page 1 when search term changes', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await screen.findByText('Understanding useEffect');

    // move to page 2 first
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);
    expect(
      screen.getByText('TypeScript Interfaces vs Types')
    ).toBeInTheDocument();

    // now search for something that only matches post 1
    const searchInput = screen.getByPlaceholderText(/search posts/i);
    await user.type(searchInput, 'useEffect');

    // should have reset to page 1 and show the matching post
    expect(screen.getByText('Understanding useEffect')).toBeInTheDocument();
  });
});

describe('HomePage — loading timing', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading state before data resolves, then replaces it', async () => {
    render(<HomePage />);

    // Loading should be visible immediately, synchronously, before any await
    expect(screen.getByText(/loading posts/i)).toBeInTheDocument();

    // Data hasn't arrived yet — post shouldn't be there
    expect(
      screen.queryByText('Understanding useEffect')
    ).not.toBeInTheDocument();

    // Wait for data to arrive
    await screen.findByText('Understanding useEffect');

    // Loading state should now be gone
    expect(screen.queryByText(/loading posts/i)).not.toBeInTheDocument();
  });
});