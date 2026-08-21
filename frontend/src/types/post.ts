import { UserCompact } from './user';

export interface Post {
  _id: string;
  author_id: string;
  author?: UserCompact;
  image_url: string;
  caption: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_bookmarked?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface PostCreatePayload {
  image_url: string;
  caption: string;
}

export interface PostListResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}
