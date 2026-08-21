import client from './client';
import { User, UserProfile, UserSearchItem, UserUpdatePayload } from '../types/user';

export const usersApi = {
  getProfile: async (username: string): Promise<UserProfile> => {
    const res = await client.get<UserProfile>(`/users/${username}`);
    return res.data;
  },

  updateMe: async (payload: UserUpdatePayload): Promise<User> => {
    const res = await client.patch<User>('/users/me', payload);
    return res.data;
  },

  searchUsers: async (query: string, limit = 20): Promise<UserSearchItem[]> => {
    const res = await client.get<UserSearchItem[]>('/users/search', {
      params: { q: query, limit },
    });
    return res.data;
  },

  getSuggestedUsers: async (limit = 5): Promise<UserSearchItem[]> => {
    const res = await client.get<UserSearchItem[]>('/users/suggestions', {
      params: { limit },
    });
    return res.data;
  },
};
