import { apiClient } from './client';
import { LikeResponse } from '../types/api';

export const likesApi = {
  likePost: async (postId: string): Promise<LikeResponse> => {
    const res = await apiClient.post<LikeResponse>(`/posts/${postId}/like`);
    return res.data;
  },

  unlikePost: async (postId: string): Promise<LikeResponse> => {
    const res = await apiClient.delete<LikeResponse>(`/posts/${postId}/like`);
    return res.data;
  },
};
