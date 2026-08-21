import { apiClient } from './client';
import { Comment, CommentListResponse } from '../types/comment';

export const commentsApi = {
  createComment: async (postId: string, content: string): Promise<Comment> => {
    const res = await apiClient.post<Comment>(`/posts/${postId}/comments`, { content });
    return res.data;
  },

  getComments: async (
    postId: string,
    skip = 0,
    limit = 50
  ): Promise<CommentListResponse> => {
    const res = await apiClient.get<CommentListResponse>(`/posts/${postId}/comments`, {
      params: { skip, limit },
    });
    return res.data;
  },

  deleteComment: async (
    commentId: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(
      `/comments/${commentId}`
    );
    return res.data;
  },
};
