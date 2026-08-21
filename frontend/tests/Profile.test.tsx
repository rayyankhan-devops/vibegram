import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProfilePage } from '../src/pages/ProfilePage';
import { AuthContext } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';
import { usersApi } from '../src/api/users';
import { postsApi } from '../src/api/posts';

vi.mock('../src/api/users', () => ({
  usersApi: {
    getProfile: vi.fn(),
    updateMe: vi.fn(),
  },
}));

vi.mock('../src/api/posts', () => ({
  postsApi: {
    getUserPosts: vi.fn(),
  },
}));

const mockAuthUser = {
  _id: 'user_1',
  username: 'alex_design',
  email: 'alex@vibegram.app',
  display_name: 'Alex Rivera',
  bio: 'Product designer',
  avatar_url: '',
  followers_count: 2,
  following_count: 3,
  posts_count: 1,
  created_at: new Date().toISOString(),
};

describe('ProfilePage Component', () => {
  it('renders user profile details and post grid', async () => {
    vi.mocked(usersApi.getProfile).mockResolvedValue({
      _id: 'user_1',
      username: 'alex_design',
      email: 'alex@vibegram.app',
      display_name: 'Alex Rivera',
      bio: 'Product designer & creative technologist',
      avatar_url: '',
      followers_count: 42,
      following_count: 18,
      posts_count: 1,
      created_at: new Date().toISOString(),
      is_following: false,
      is_self: true,
    });

    vi.mocked(postsApi.getUserPosts).mockResolvedValue({
      posts: [
        {
          _id: 'user_post_1',
          author_id: 'user_1',
          image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
          caption: 'My work in progress',
          likes_count: 8,
          comments_count: 3,
          is_liked: false,
          created_at: new Date().toISOString(),
        },
      ],
      total: 1,
      page: 1,
      limit: 15,
      has_more: false,
    });

    render(
      <MemoryRouter initialEntries={['/profile/alex_design']}>
        <AuthContext.Provider
          value={{
            user: mockAuthUser,
            token: 'test_token',
            isLoading: false,
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn(),
            updateUser: vi.fn(),
          }}
        >
          <ToastProvider>
            <Routes>
              <Route path="/profile/:username" element={<ProfilePage />} />
            </Routes>
          </ToastProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /@alex_design/i })).toBeInTheDocument();
      expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
      expect(screen.getByText('Product designer & creative technologist')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument(); // followers
      expect(screen.getByText('18')).toBeInTheDocument(); // following
      expect(screen.getByRole('button', { name: /Edit Profile/i })).toBeInTheDocument();
    });
  });
});
