export interface CommentAuthorSummary {
  _id: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

export interface Comment {
  _id: string;
  post_id: string;
  author_id: string;
  author?: CommentAuthorSummary;
  content: string;
  created_at: string;
  is_owner: boolean;
}

export interface CommentListResponse {
  comments: Comment[];
  total: number;
}
