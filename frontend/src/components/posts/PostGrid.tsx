import React, { useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { Post } from '../../types/post';
import { PostModal } from './PostModal';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80';

interface PostGridProps {
  posts: Post[];
  onPostDeleted?: (postId: string) => void;
}

export const PostGrid: React.FC<PostGridProps> = ({ posts, onPostDeleted }) => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  return (
    <>
      <div className="post-grid">
        {posts.map((post) => (
          <div
            key={post._id}
            className="grid-post-item"
            onClick={() => setSelectedPostId(post._id)}
          >
            <img
              src={post.image_url}
              alt={post.caption || 'Post preview'}
              className="grid-post-image"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
              }}
            />
            <div className="grid-post-overlay">
              <div className="grid-overlay-stat">
                <Heart size={18} fill="#fff" />
                <span>{post.likes_count}</span>
              </div>
              <div className="grid-overlay-stat">
                <MessageCircle size={18} fill="#fff" />
                <span>{post.comments_count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <PostModal
        postId={selectedPostId}
        onClose={() => setSelectedPostId(null)}
        onPostDeleted={(id) => {
          onPostDeleted?.(id);
          setSelectedPostId(null);
        }}
      />
    </>
  );
};
