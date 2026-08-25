import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HomePage from './HomePage';
import * as postsService from '../services/posts';

describe('HomePage — rendering', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders posts given mock data', async () => {
    render(<HomePage />);

    expect(screen.getByText(/loading posts/i)).toBeInTheDocument();

    const post = await screen.findByText(
      'Why Do We Remember Some Things and Forget Others?'
    );
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

    await screen.findByText('Why Do We Remember Some Things and Forget Others?');

    const searchInput = screen.getByPlaceholderText(/search posts/i);
    await user.type(searchInput, 'goosebumps');

    expect(screen.getByText('Why Do We Get Goosebumps?')).toBeInTheDocument();

    expect(
      screen.queryByText('Why Do We Remember Some Things and Forget Others?')
    ).not.toBeInTheDocument();
  });

  it('clicking Next shows the next page', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    // PAGE_SIZE is 4, so page 1 shows posts 1–4
    await screen.findByText('Why Do We Remember Some Things and Forget Others?');
    expect(
      screen.getByText('What Would Happen If the Moon Disappeared?')
    ).toBeInTheDocument();

    // post 5 should not be visible yet
    expect(
      screen.queryByText('Why Some Ideas Spread Faster Than Others')
    ).not.toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // page 2 should show posts 5–8
    expect(
      screen.getByText('Why Some Ideas Spread Faster Than Others')
    ).toBeInTheDocument();

    // post 1 should no longer be visible
    expect(
      screen.queryByText('Why Do We Remember Some Things and Forget Others?')
    ).not.toBeInTheDocument();
  });

  it('resets to page 1 when search term changes', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await screen.findByText('Why Do We Remember Some Things and Forget Others?');

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);
    expect(
      screen.getByText('Why Some Ideas Spread Faster Than Others')
    ).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/search posts/i);
    await user.type(searchInput, 'goosebumps');

    expect(screen.getByText('Why Do We Get Goosebumps?')).toBeInTheDocument();
  });
});

describe('HomePage — loading timing', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading state before data resolves, then replaces it', async () => {
    render(<HomePage />);

    expect(screen.getByText(/loading posts/i)).toBeInTheDocument();

    expect(
      screen.queryByText('Why Do We Remember Some Things and Forget Others?')
    ).not.toBeInTheDocument();

    await screen.findByText('Why Do We Remember Some Things and Forget Others?');

    expect(screen.queryByText(/loading posts/i)).not.toBeInTheDocument();
  });
});