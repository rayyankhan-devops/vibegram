import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Trash2, Send } from 'lucide-react';
import { commentsApi } from '../../api/comments';
import { Comment } from '../../types/comment';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Avatar } from '../common/Avatar';
import { Spinner } from '../common/Spinner';
import { formatTimeAgo } from '../../utils/date';

const QUICK_EMOJIS = ['❤️', '🔥', '✨', '😍', '👏', '🙌', '🚀'];

interface CommentSectionProps {
  postId: string;
  onCommentCountChange?: (newCount: number) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  onCommentCountChange,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    let isMounted = true;
    const fetchComments = async () => {
      try {
        const res = await commentsApi.getComments(postId);
        if (isMounted) {
          setComments(res.comments);
          onCommentCountChange?.(res.total);
        }
      } catch {
        // silent error for preview
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchComments();
    return () => {
      isMounted = false;
    };
  }, [postId, onCommentCountChange]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newComment.trim();
    if (!clean) return;

    if (!user) {
      showToast('Please sign in to comment', 'info');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await commentsApi.createComment(postId, clean);
      setComments((prev) => [...prev, created]);
      setNewComment('');
      onCommentCountChange?.(comments.length + 1);
      showToast('Comment added', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add comment';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickEmoji = (emoji: string) => {
    setNewComment((prev) => prev + emoji);
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentsApi.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      onCommentCountChange?.(Math.max(0, comments.length - 1));
      showToast('Comment deleted', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete comment';
      showToast(message, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
          <Spinner size="sm" />
        </div>
      ) : comments.length === 0 ? (
        <div
          style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            textAlign: 'center',
            padding: '12px',
          }}
        >
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {comments.map((c) => (
            <div key={c._id} className="comment-item">
              <NavLink to={`/profile/${c.author?.username || ''}`}>
                <Avatar
                  src={c.author?.avatar_url}
                  name={c.author?.display_name || c.author?.username}
                  size={28}
                />
              </NavLink>
              <div className="comment-bubble">
                <div className="comment-header">
                  <NavLink
                    to={`/profile/${c.author?.username || ''}`}
                    className="comment-author-name"
                  >
                    {c.author?.display_name || c.author?.username}
                  </NavLink>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {formatTimeAgo(c.created_at)}
                    </span>
                    {c.is_owner && (
                      <button
                        className="comment-delete-btn"
                        onClick={() => handleDeleteComment(c._id)}
                        title="Delete comment"
                        aria-label="Delete comment"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                  {c.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {user && (
        <div
          style={{
            marginTop: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {/* Quick Emoji Bar */}
          <div className="quick-emoji-bar">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="quick-emoji-btn"
                onClick={() => handleQuickEmoji(emoji)}
                title={`Insert ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleAddComment}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <input
              type="text"
              className="input-field"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmitting}
              maxLength={500}
              style={{ padding: '8px 12px', fontSize: '13px' }}
            />
            <button
              type="submit"
              className="btn-icon"
              disabled={!newComment.trim() || isSubmitting}
              style={{
                color: newComment.trim() ? 'var(--primary-from)' : 'var(--text-muted)',
                cursor: newComment.trim() ? 'pointer' : 'default',
              }}
              aria-label="Submit comment"
            >
              {isSubmitting ? <Spinner size="sm" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
