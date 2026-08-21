import { apiClient } from './client';
import { AuthResponse } from '../types/api';
import { User } from '../types/user';

export const authApi = {
  register: async (data: {
    username: string;
    email: string;
    password: string;
    display_name: string;
    bio?: string;
    avatar_url?: string;
  }): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  login: async (data: {
    username_or_email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },
};
