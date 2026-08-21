import client from './client';
import { Post, PostCreatePayload, PostListResponse } from '../types/post';
import { BookmarkResponse } from '../types/api';

export const postsApi = {
  createPost: async (payload: PostCreatePayload): Promise<Post> => {
    const res = await client.post<Post>('/posts', payload);
    return res.data;
  },

  getFeed: async (page = 1, limit = 20): Promise<PostListResponse> => {
    const res = await client.get<PostListResponse>('/posts/feed', {
      params: { page, limit },
    });
    return res.data;
  },

  getExplore: async (page = 1, limit = 30): Promise<PostListResponse> => {
    const res = await client.get<PostListResponse>('/posts/explore', {
      params: { page, limit },
    });
    return res.data;
  },

  getSavedPosts: async (page = 1, limit = 30): Promise<PostListResponse> => {
    const res = await client.get<PostListResponse>('/posts/saved', {
      params: { page, limit },
    });
    return res.data;
  },

  getUserPosts: async (
    username: string,
    page = 1,
    limit = 30
  ): Promise<PostListResponse> => {
    const res = await client.get<PostListResponse>(`/posts/user/${username}`, {
      params: { page, limit },
    });
    return res.data;
  },

  getPost: async (postId: string): Promise<Post> => {
    const res = await client.get<Post>(`/posts/${postId}`);
    return res.data;
  },

  deletePost: async (postId: string): Promise<{ success: boolean; message: string }> => {
    const res = await client.delete<{ success: boolean; message: string }>(
      `/posts/${postId}`
    );
    return res.data;
  },

  bookmarkPost: async (postId: string): Promise<BookmarkResponse> => {
    const res = await client.post<BookmarkResponse>(`/posts/${postId}/bookmark`);
    return res.data;
  },

  unbookmarkPost: async (postId: string): Promise<BookmarkResponse> => {
    const res = await client.delete<BookmarkResponse>(`/posts/${postId}/bookmark`);
    return res.data;
  },
};
