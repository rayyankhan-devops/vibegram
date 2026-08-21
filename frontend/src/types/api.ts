import { User } from './user';

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  error: ApiErrorDetail;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LikeResponse {
  post_id: string;
  likes_count: number;
  is_liked: boolean;
  message: string;
}

export interface BookmarkResponse {
  post_id: string;
  is_bookmarked: boolean;
  message: string;
}

export interface FollowResponse {
  user_id: string;
  is_following: boolean;
  followers_count: number;
  message: string;
}

export interface FollowUserItem {
  _id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  is_following: boolean;
  is_self: boolean;
}

export interface FollowListResponse {
  users: FollowUserItem[];
  total: number;
}
