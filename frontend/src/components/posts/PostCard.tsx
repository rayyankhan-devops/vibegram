import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Bookmark, Heart, MessageCircle, Share2, Trash2 } from 'lucide-react';
import { likesApi } from '../../api/likes';
import { postsApi } from '../../api/posts';
import { Post } from '../../types/post';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Avatar } from '../common/Avatar';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { CommentSection } from './CommentSection';
import { formatTimeAgo } from '../../utils/date';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80';

interface PostCardProps {
  post: Post;
  onPostDeleted?: (postId: string) => void;
  _onPostUpdated?: (updated: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPostDeleted }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [isBookmarked, setIsBookmarked] = useState(Boolean(post.is_bookmarked));
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [showComments, setShowComments] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const [imageSrc, setImageSrc] = useState(post.image_url);

  const isAuthor =
    user &&
    (user._id === post.author_id || (post.author && user._id === post.author._id));

  const handleToggleLike = async () => {
    if (!user) {
      showToast('Please sign in to like posts', 'info');
      navigate('/login');
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    const nextLiked = !isLiked;
    const nextCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    setIsLiked(nextLiked);
    setLikesCount(nextCount);

    try {
      if (nextLiked) {
        const res = await likesApi.likePost(post._id);
        setLikesCount(res.likes_count);
        setIsLiked(res.is_liked);
      } else {
        const res = await likesApi.unlikePost(post._id);
        setLikesCount(res.likes_count);
        setIsLiked(res.is_liked);
      }
    } catch {
      setIsLiked(isLiked);
      setLikesCount(likesCount);
      showToast('Failed to update reaction', 'error');
    } finally {
      setIsLiking(false);
    }
  };

  const handleDoubleTap = async () => {
    setShowHeartOverlay(true);
    setTimeout(() => setShowHeartOverlay(false), 900);

    if (!isLiked && user) {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
      try {
        const res = await likesApi.likePost(post._id);
        setLikesCount(res.likes_count);
        setIsLiked(res.is_liked);
      } catch {
        // silent
      }
    }
  };

  const handleToggleBookmark = async () => {
    if (!user) {
      showToast('Please sign in to save posts', 'info');
      navigate('/login');
      return;
    }

    if (isBookmarkLoading) return;
    setIsBookmarkLoading(true);

    const nextBookmarked = !isBookmarked;
    setIsBookmarked(nextBookmarked);

    try {
      if (nextBookmarked) {
        await postsApi.bookmarkPost(post._id);
        showToast('Post saved to your collection', 'success');
      } else {
        await postsApi.unbookmarkPost(post._id);
        showToast('Post removed from saved', 'info');
      }
    } catch {
      setIsBookmarked(isBookmarked);
      showToast('Failed to update bookmark', 'error');
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      await postsApi.deletePost(post._id);
      showToast('Post deleted successfully', 'success');
      setShowDeleteConfirm(false);
      onPostDeleted?.(post._id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete post';
      showToast(message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(postUrl);
      showToast('Link copied to clipboard!', 'info');
    }
  };

  const authorName = post.author?.display_name || post.author?.username || 'Creator';
  const authorUsername = post.author?.username || 'user';

  return (
    <article className="post-card">
      {/* Post Header */}
      <header className="post-header">
        <NavLink to={`/profile/${authorUsername}`} className="post-author-info">
          <Avatar
            src={post.author?.avatar_url}
            name={authorName}
            size={38}
            hasRing={true}
          />
          <div>
            <div className="post-author-name">{authorName}</div>
            <div className="post-time">
              @{authorUsername} • {formatTimeAgo(post.created_at)}
            </div>
          </div>
        </NavLink>

        {isAuthor && (
          <button
            className="btn-icon"
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete Post"
            aria-label="Delete Post"
          >
            <Trash2 size={18} color="var(--text-muted)" />
          </button>
        )}
      </header>

      {/* Post Image with Double-Tap heart overlay */}
      <div className="post-image-container" onDoubleClick={handleDoubleTap}>
        <img
          src={imageSrc}
          alt={post.caption || 'VibeGram post image'}
          className="post-image"
          loading="lazy"
          onError={() => setImageSrc(FALLBACK_IMAGE)}
        />

        {showHeartOverlay && (
          <div className="heart-overlay-animation">
            <Heart size={80} fill="#fff" color="#fff" />
          </div>
        )}
      </div>

      {/* Post Action Buttons */}
      <div className="post-actions">
        <div className="post-action-group">
          <button
            className={`btn-icon like-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleToggleLike}
            aria-label={isLiked ? 'Unlike post' : 'Like post'}
          >
            <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
          </button>

          <button
            className="btn-icon"
            onClick={() => setShowComments(!showComments)}
            aria-label="Toggle comments"
          >
            <MessageCircle size={24} />
          </button>

          <button className="btn-icon" onClick={handleShare} aria-label="Share post">
            <Share2 size={22} />
          </button>
        </div>

        <button
          className={`btn-icon bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
          onClick={handleToggleBookmark}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Save post'}
          title={isBookmarked ? 'Remove bookmark' : 'Save post'}
        >
          <Bookmark size={22} fill={isBookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Likes Count */}
      <div className="post-likes-count">
        {likesCount} {likesCount === 1 ? 'like' : 'likes'}
      </div>

      {/* Post Caption */}
      {post.caption && (
        <div className="post-caption-section">
          <NavLink to={`/profile/${authorUsername}`} className="post-caption-author">
            {authorUsername}
          </NavLink>
          <span>{post.caption}</span>
        </div>
      )}

      {/* Comments Toggle Link */}
      <div style={{ padding: '0 18px 14px 18px' }}>
        <button
          className="btn-ghost"
          style={{
            padding: 0,
            fontSize: '13px',
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}
          onClick={() => setShowComments(!showComments)}
        >
          {showComments
            ? 'Hide comments'
            : commentsCount > 0
              ? `View all ${commentsCount} comments`
              : 'Add a comment...'}
        </button>

        {showComments && (
          <div style={{ marginTop: '14px' }}>
            <CommentSection
              postId={post._id}
              onCommentCountChange={(count) => setCommentsCount(count)}
            />
          </div>
        )}
      </div>

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeletePost}
        title="Delete Post"
        message="Are you sure you want to permanently delete this post? This action cannot be undone."
        confirmText="Delete Post"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </article>
  );
};
