import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HomePage } from '../src/pages/HomePage';
import { AuthContext } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';
import { postsApi } from '../src/api/posts';

vi.mock('../src/api/posts', () => ({
  postsApi: {
    getFeed: vi.fn(),
  },
}));

vi.mock('../src/api/users', () => ({
  usersApi: {
    getSuggestedUsers: vi.fn().mockResolvedValue([
      {
        _id: 'suggested_1',
        username: 'elena_wander',
        display_name: 'Elena Rostova',
        avatar_url: '',
        followers_count: 5,
        is_following: false,
      },
    ]),
  },
}));

const mockUser = {
  _id: 'user_1',
  username: 'alex_design',
  email: 'alex@vibegram.app',
  display_name: 'Alex Rivera',
  bio: '',
  avatar_url: '',
  followers_count: 2,
  following_count: 3,
  posts_count: 1,
  created_at: new Date().toISOString(),
};

describe('HomePage Component', () => {
  it('renders feed posts and welcome message', async () => {
    const mockFeedResponse = {
      posts: [
        {
          _id: 'feed_post_1',
          author_id: 'user_2',
          author: {
            _id: 'user_2',
            username: 'sarah_codes',
            display_name: 'Sarah Chen',
            avatar_url: '',
          },
          image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
          caption: 'Clean code aesthetics',
          likes_count: 10,
          comments_count: 4,
          is_liked: false,
          is_bookmarked: false,
          created_at: new Date().toISOString(),
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      has_more: false,
    };

    vi.mocked(postsApi.getFeed).mockResolvedValue(mockFeedResponse);

    render(
      <BrowserRouter>
        <AuthContext.Provider
          value={{
            user: mockUser,
            token: 'test_token',
            isLoading: false,
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn(),
            updateUser: vi.fn(),
          }}
        >
          <ToastProvider>
            <HomePage />
          </ToastProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Welcome back, Alex Rivera!/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Clean code aesthetics')).toBeInTheDocument();
      expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    });
  });

  it('renders empty feed state when feed has no posts', async () => {
    vi.mocked(postsApi.getFeed).mockResolvedValue({
      posts: [],
      total: 0,
      page: 1,
      limit: 10,
      has_more: false,
    });

    render(
      <BrowserRouter>
        <AuthContext.Provider
          value={{
            user: mockUser,
            token: 'test_token',
            isLoading: false,
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn(),
            updateUser: vi.fn(),
          }}
        >
          <ToastProvider>
            <HomePage />
          </ToastProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Your Feed is Quiet/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Explore Trending Posts/i })).toBeInTheDocument();
    });
  });
});
