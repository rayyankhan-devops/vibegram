import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PostCard } from '../src/components/posts/PostCard';
import { AuthContext } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';
import { likesApi } from '../src/api/likes';

vi.mock('../src/api/likes', () => ({
  likesApi: {
    likePost: vi.fn(),
    unlikePost: vi.fn(),
  },
}));

vi.mock('../src/api/comments', () => ({
  commentsApi: {
    getComments: vi.fn().mockResolvedValue({ comments: [], total: 0 }),
    createComment: vi.fn(),
    deleteComment: vi.fn(),
  },
}));

const mockPost = {
  _id: 'post_1',
  author_id: 'user_1',
  author: {
    _id: 'user_1',
    username: 'alex_design',
    display_name: 'Alex Rivera',
    avatar_url: 'https://example.com/avatar.jpg',
  },
  image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
  caption: 'Vibrant UI design exploration',
  likes_count: 5,
  comments_count: 2,
  is_liked: false,
  created_at: new Date().toISOString(),
};

const mockUser = {
  _id: 'user_1',
  username: 'alex_design',
  email: 'alex@vibegram.app',
  display_name: 'Alex Rivera',
  bio: '',
  avatar_url: '',
  followers_count: 0,
  following_count: 0,
  posts_count: 1,
  created_at: new Date().toISOString(),
};

describe('PostCard Component', () => {
  it('renders post details, author, caption, and likes count', () => {
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
            <PostCard post={mockPost} />
          </ToastProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
    expect(screen.getByText('@alex_design', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Vibrant UI design exploration')).toBeInTheDocument();
    expect(screen.getByText('5 likes')).toBeInTheDocument();
    expect(screen.getByText(/View all 2 comments/i)).toBeInTheDocument();
  });

  it('optimistically likes post on heart button click', async () => {
    vi.mocked(likesApi.likePost).mockResolvedValue({
      post_id: 'post_1',
      likes_count: 6,
      is_liked: true,
      message: 'Post liked',
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
            <PostCard post={mockPost} />
          </ToastProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const likeButton = screen.getByLabelText(/Like post/i);
    fireEvent.click(likeButton);

    expect(screen.getByText('6 likes')).toBeInTheDocument();
    await waitFor(() => {
      expect(likesApi.likePost).toHaveBeenCalledWith('post_1');
    });
  });

  it('toggles comment section visibility on comments button click', () => {
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
            <PostCard post={mockPost} />
          </ToastProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const toggleCommentsBtn = screen.getByText(/View all 2 comments/i);
    fireEvent.click(toggleCommentsBtn);

    expect(screen.getByText(/Hide comments/i)).toBeInTheDocument();
  });
});
