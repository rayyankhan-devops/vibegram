export interface UserCompact {
  _id: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  created_at: string;
}

export interface UserProfile extends User {
  is_following: boolean;
  is_self: boolean;
}

export interface UserSearchItem {
  _id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio?: string;
  followers_count: number;
  is_following: boolean;
  is_self?: boolean;
}

export interface UserUpdateRequest {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
}

export type UserUpdatePayload = UserUpdateRequest;
