import { apiClient } from './client';
import { FollowListResponse, FollowResponse } from '../types/api';

export const followsApi = {
  followUser: async (userId: string): Promise<FollowResponse> => {
    const res = await apiClient.post<FollowResponse>(`/users/${userId}/follow`);
    return res.data;
  },

  unfollowUser: async (userId: string): Promise<FollowResponse> => {
    const res = await apiClient.delete<FollowResponse>(`/users/${userId}/follow`);
    return res.data;
  },

  getFollowers: async (
    userId: string,
    skip = 0,
    limit = 50
  ): Promise<FollowListResponse> => {
    const res = await apiClient.get<FollowListResponse>(`/users/${userId}/followers`, {
      params: { skip, limit },
    });
    return res.data;
  },

  getFollowing: async (
    userId: string,
    skip = 0,
    limit = 50
  ): Promise<FollowListResponse> => {
    const res = await apiClient.get<FollowListResponse>(`/users/${userId}/following`, {
      params: { skip, limit },
    });
    return res.data;
  },
};
