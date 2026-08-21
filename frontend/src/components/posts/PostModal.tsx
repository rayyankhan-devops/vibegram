import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Bookmark, Heart, Share2, Trash2, X } from 'lucide-react';
import { postsApi } from '../../api/posts';
import { likesApi } from '../../api/likes';
import { Post } from '../../types/post';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Avatar } from '../common/Avatar';
import { Spinner } from '../common/Spinner';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { CommentSection } from './CommentSection';
import { formatTimeAgo } from '../../utils/date';

interface PostModalProps {
  postId: string | null;
  onClose: () => void;
  onPostDeleted?: (postId: string) => void;
}

export const PostModal: React.FC<PostModalProps> = ({
  postId,
  onClose,
  onPostDeleted,
}) => {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!postId) return;
    let isMounted = true;
    setIsLoading(true);

    const fetchPost = async () => {
      try {
        const data = await postsApi.getPost(postId);
        if (isMounted) {
          setPost(data);
          setIsLiked(data.is_liked);
          setIsBookmarked(Boolean(data.is_bookmarked));
          setLikesCount(data.likes_count);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Could not load post';
          showToast(message, 'error');
          onClose();
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchPost();
    return () => {
      isMounted = false;
    };
  }, [postId, showToast, onClose]);

  const handleToggleLike = async () => {
    if (!user) {
      showToast('Please sign in to like posts', 'info');
      return;
    }
    if (!post) return;

    const nextLiked = !isLiked;
    const nextCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    setIsLiked(nextLiked);
    setLikesCount(nextCount);

    try {
      if (nextLiked) {
        const res = await likesApi.likePost(post._id);
        setLikesCount(res.likes_count);
      } else {
        const res = await likesApi.unlikePost(post._id);
        setLikesCount(res.likes_count);
      }
    } catch {
      setIsLiked(isLiked);
      setLikesCount(likesCount);
      showToast('Failed to update reaction', 'error');
    }
  };

  const handleDoubleTap = async () => {
    setShowHeartOverlay(true);
    setTimeout(() => setShowHeartOverlay(false), 900);

    if (!isLiked && user && post) {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
      try {
        const res = await likesApi.likePost(post._id);
        setLikesCount(res.likes_count);
      } catch {
        // silent
      }
    }
  };

  const handleToggleBookmark = async () => {
    if (!user) {
      showToast('Please sign in to save posts', 'info');
      return;
    }
    if (!post) return;

    const nextBookmarked = !isBookmarked;
    setIsBookmarked(nextBookmarked);

    try {
      if (nextBookmarked) {
        await postsApi.bookmarkPost(post._id);
        showToast('Saved to your collection', 'success');
      } else {
        await postsApi.unbookmarkPost(post._id);
        showToast('Removed from saved', 'info');
      }
    } catch {
      setIsBookmarked(isBookmarked);
      showToast('Failed to update bookmark', 'error');
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;
    setIsDeleting(true);
    try {
      await postsApi.deletePost(post._id);
      showToast('Post deleted', 'success');
      setShowDeleteConfirm(false);
      onPostDeleted?.(post._id);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete post';
      showToast(message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!postId) return null;

  const isAuthor =
    user &&
    post &&
    (user._id === post.author_id || (post.author && user._id === post.author._id));
  const authorName = post?.author?.display_name || post?.author?.username || 'Creator';
  const authorUsername = post?.author?.username || 'user';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="post-split-modal" onClick={(e) => e.stopPropagation()}>
        {isLoading || !post ? (
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Spinner />
          </div>
        ) : (
          <>
            {/* Split Left: Media View */}
            <div className="post-split-image-container" onDoubleClick={handleDoubleTap}>
              <img
                src={post.image_url}
                alt={post.caption || 'VibeGram post'}
                className="post-split-image"
              />

              {showHeartOverlay && (
                <div className="heart-overlay-animation">
                  <Heart size={80} fill="#fff" color="#fff" />
                </div>
              )}
            </div>

            {/* Split Right: Social Activity */}
            <div className="post-split-sidebar">
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <NavLink
                  to={`/profile/${authorUsername}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                  onClick={onClose}
                >
                  <Avatar
                    src={post.author?.avatar_url}
                    name={authorName}
                    size={36}
                    hasRing={true}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{authorName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      @{authorUsername}
                    </div>
                  </div>
                </NavLink>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isAuthor && (
                    <button
                      className="btn-icon"
                      onClick={() => setShowDeleteConfirm(true)}
                      title="Delete post"
                    >
                      <Trash2 size={16} color="var(--accent-rose)" />
                    </button>
                  )}
                  <button className="btn-icon" onClick={onClose}>
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Caption & Comments */}
              <div className="post-split-comments">
                {post.caption && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      paddingBottom: '12px',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    <NavLink to={`/profile/${authorUsername}`} onClick={onClose}>
                      <Avatar src={post.author?.avatar_url} name={authorName} size={28} />
                    </NavLink>
                    <div>
                      <span
                        style={{ fontWeight: 700, fontSize: '13px', marginRight: '6px' }}
                      >
                        {authorUsername}
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {post.caption}
                      </span>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          marginTop: '4px',
                        }}
                      >
                        {formatTimeAgo(post.created_at)}
                      </div>
                    </div>
                  </div>
                )}

                <CommentSection postId={post._id} />
              </div>

              {/* Action Bar Footer */}
              <div
                style={{
                  padding: '12px 18px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      className={`btn-icon like-btn ${isLiked ? 'liked' : ''}`}
                      onClick={handleToggleLike}
                    >
                      <Heart size={22} fill={isLiked ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/post/${post._id}`
                        );
                        showToast('Link copied!', 'info');
                      }}
                    >
                      <Share2 size={20} />
                    </button>
                  </div>

                  <button
                    className={`btn-icon bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                    onClick={handleToggleBookmark}
                  >
                    <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <div style={{ fontWeight: 700, fontSize: '13px' }}>
                  {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeletePost}
        title="Delete Post"
        message="Are you sure you want to delete this post?"
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
