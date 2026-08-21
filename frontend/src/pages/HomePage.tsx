import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Sparkles } from 'lucide-react';
import { postsApi } from '../api/posts';
import { Post } from '../types/post';
import { useAuth } from '../hooks/useAuth';
import { PostCard } from '../components/posts/PostCard';
import { StoriesCarousel } from '../components/posts/StoriesCarousel';
import { SkeletonPostCard } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { Button } from '../components/common/Button';

export const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchFeed = useCallback(async (pageNum: number, isInitial = false) => {
    if (isInitial) setIsLoading(true);
    else setIsLoadingMore(true);
    setError(null);

    try {
      const res = await postsApi.getFeed(pageNum, 10);
      if (pageNum === 1) {
        setPosts(res.posts);
      } else {
        setPosts((prev) => [...prev, ...res.posts]);
      }
      setHasMore(res.has_more);
      setPage(pageNum);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load home feed';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed(1, true);
  }, [fetchFeed]);

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchFeed(page + 1);
    }
  };

  return (
    <div className="content-feed">
      {/* Stories / Vibe Circles */}
      <StoriesCarousel />

      {/* Welcome Banner */}
      {user && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={18} color="var(--primary-from)" />
            <span style={{ fontWeight: 600, fontSize: '13px' }}>
              Welcome back, {user.display_name || user.username}!
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/explore')}
            leftIcon={<Compass size={15} />}
            style={{ fontSize: '12px' }}
          >
            Discover
          </Button>
        </div>
      )}

      {/* Error state */}
      {error && <ErrorAlert message={error} onRetry={() => fetchFeed(1, true)} />}

      {/* Loading state with Shimmer Skeletons */}
      {isLoading ? (
        <div>
          <SkeletonPostCard />
          <SkeletonPostCard />
        </div>
      ) : posts.length === 0 ? (
        /* Empty Feed state */
        <EmptyState
          icon={<Compass size={36} />}
          title="Your Feed is Quiet"
          description="Follow some inspiring creators or explore the trending gallery to see posts right here on your feed."
          actionText="Explore Trending Posts"
          onAction={() => navigate('/explore')}
        />
      ) : (
        /* Post Feed */
        <div>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onPostDeleted={handlePostDeleted} />
          ))}

          {hasMore && (
            <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0' }}>
              <Button
                variant="secondary"
                onClick={handleLoadMore}
                isLoading={isLoadingMore}
              >
                Load More Posts
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
