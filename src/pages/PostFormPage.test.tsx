import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PostFormPage from './PostFormPage';
import * as postsApi from '../api/posts';
import { AuthContext } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastProvider';

const mockAuthValue = {
  user: { id: 1, username: 'michelle', email: 'michelle@example.com' },
  token: 'fake-token',
  loading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
};

function renderForm() {
  return render(
    <ToastProvider>
      <AuthContext.Provider value={mockAuthValue}>
        <MemoryRouter initialEntries={['/posts/new']}>
          <Routes>
            <Route path="/posts/new" element={<PostFormPage />} />
            <Route path="/posts/:slug" element={<div>Post detail page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </ToastProvider>
  );
}

describe('PostFormPage — submission', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('valid submit: creates a post and navigates to its detail page', async () => {
    vi.spyOn(postsApi, 'createPost').mockResolvedValueOnce({
      id: 1,
      title: 'A Valid Title',
      slug: 'a-valid-title',
      content: 'Some content',
      author: 'michelle',
      created_at: '2026-08-27T10:00:00Z',
      like_count: 0,
    });

    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByPlaceholderText(/title/i), 'A Valid Title');
    await user.type(screen.getByPlaceholderText(/content/i), 'Some content');
    await user.click(screen.getByRole('button', { name: /publish/i }));

    expect(await screen.findByText('Post detail page')).toBeInTheDocument();
  });

  it('invalid submit (client): blocks submission when title is too short', async () => {
    const createSpy = vi.spyOn(postsApi, 'createPost');
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByPlaceholderText(/title/i), 'Hi');
    await user.type(screen.getByPlaceholderText(/content/i), 'Some content');
    await user.click(screen.getByRole('button', { name: /publish/i }));

    expect(screen.getAllByText(/at least 3 characters/i).length).toBeGreaterThan(0);
    expect(createSpy).not.toHaveBeenCalled();
  });

  it('server-rejected submit: surfaces the backend error message', async () => {
    vi.spyOn(postsApi, 'createPost').mockRejectedValueOnce(
      new Error('A post with this slug already exists.')
    );

    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByPlaceholderText(/title/i), 'Duplicate Title');
    await user.type(screen.getByPlaceholderText(/content/i), 'Some content');
    await user.click(screen.getByRole('button', { name: /publish/i }));

    const errorMessages = await screen.findAllByText('A post with this slug already exists.');
    expect(errorMessages.length).toBeGreaterThan(0);
  });
});
