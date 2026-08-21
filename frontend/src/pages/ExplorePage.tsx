import React, { useCallback, useEffect, useState } from 'react';
import { Compass } from 'lucide-react';
import { postsApi } from '../api/posts';
import { Post } from '../types/post';
import { PostGrid } from '../components/posts/PostGrid';
import { SearchBar } from '../components/search/SearchBar';
import { SkeletonGrid } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { Button } from '../components/common/Button';

const CATEGORIES = [
  { id: 'all', label: '✨ All' },
  {
    id: 'design',
    label: '🎨 Design',
    keywords: ['design', 'gradient', 'minimal', 'ui', 'creative'],
  },
  {
    id: 'photography',
    label: '📸 Photography',
    keywords: ['photography', 'tokyo', 'street', 'architecture', 'neon'],
  },
  {
    id: 'tech',
    label: '💻 Tech',
    keywords: ['code', 'tech', 'coding', 'typescript', 'developer', 'workspace'],
  },
  {
    id: 'travel',
    label: '🏔️ Travel',
    keywords: ['mountain', 'hiking', 'nature', 'alps', 'forest', 'wanderlust'],
  },
  {
    id: 'music',
    label: '🎧 Music',
    keywords: ['synth', 'beats', 'music', 'lo-fi', 'audio', 'sound'],
  },
];

export const ExplorePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchExplorePosts = useCallback(async (pageNum: number, isInitial = false) => {
    if (isInitial) setIsLoading(true);
    else setIsLoadingMore(true);
    setError(null);

    try {
      const res = await postsApi.getExplore(pageNum, 18);
      if (pageNum === 1) {
        setPosts(res.posts);
      } else {
        setPosts((prev) => [...prev, ...res.posts]);
      }
      setHasMore(res.has_more);
      setPage(pageNum);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load explore feed';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchExplorePosts(1, true);
  }, [fetchExplorePosts]);

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchExplorePosts(page + 1);
    }
  };

  // Filter posts by category
  const filteredPosts = posts.filter((post) => {
    if (selectedCategory === 'all') return true;
    const cat = CATEGORIES.find((c) => c.id === selectedCategory);
    if (!cat || !cat.keywords) return true;
    const captionLower = (post.caption || '').toLowerCase();
    return cat.keywords.some((kw) => captionLower.includes(kw));
  });

  return (
    <div className="content-full">
      {/* Search Header */}
      <div className="explore-header">
        <SearchBar />
      </div>

      {/* Category Pills Bar */}
      <div className="category-pills-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {error && <ErrorAlert message={error} onRetry={() => fetchExplorePosts(1, true)} />}

      {isLoading ? (
        <div style={{ padding: '16px 0' }}>
          <SkeletonGrid count={9} />
        </div>
      ) : filteredPosts.length === 0 ? (
        <EmptyState
          icon={<Compass size={36} />}
          title="No Posts in this Category"
          description={
            selectedCategory !== 'all'
              ? `No posts found matching the ${selectedCategory} category.`
              : 'Be the first to share an aesthetic vibe on VibeGram!'
          }
          actionText={selectedCategory !== 'all' ? 'View All Posts' : undefined}
          onAction={
            selectedCategory !== 'all' ? () => setSelectedCategory('all') : undefined
          }
        />
      ) : (
        <>
          <PostGrid posts={filteredPosts} onPostDeleted={handlePostDeleted} />

          {hasMore && selectedCategory === 'all' && (
            <div style={{ display: 'flex', justifyContent: 'center', margin: '32px 0' }}>
              <Button
                variant="secondary"
                onClick={handleLoadMore}
                isLoading={isLoadingMore}
              >
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
