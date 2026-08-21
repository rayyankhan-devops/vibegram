import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bookmark, Camera, Image as ImageIcon } from 'lucide-react';
import { usersApi } from '../api/users';
import { postsApi } from '../api/posts';
import { User, UserProfile } from '../types/user';
import { Post } from '../types/post';
import { useAuth } from '../hooks/useAuth';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { PostGrid } from '../components/posts/PostGrid';
import { SkeletonGrid } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { Button } from '../components/common/Button';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { user: authUser } = useAuth();

  const fetchProfileAndPosts = useCallback(async () => {
    if (!username) return;
    setIsLoadingProfile(true);
    setIsLoadingPosts(true);
    setError(null);
    setActiveTab('posts');

    try {
      const userProfile = await usersApi.getProfile(username);
      setProfile(userProfile);

      const postsRes = await postsApi.getUserPosts(username, 1, 15);
      setPosts(postsRes.posts);
      setHasMore(postsRes.has_more);
      setPage(1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load user profile';
      setError(message);
    } finally {
      setIsLoadingProfile(false);
      setIsLoadingPosts(false);
    }
  }, [username]);

  useEffect(() => {
    fetchProfileAndPosts();
  }, [fetchProfileAndPosts]);

  const fetchSavedPosts = async () => {
    setIsLoadingSaved(true);
    try {
      const res = await postsApi.getSavedPosts(1, 30);
      setSavedPosts(res.posts);
    } catch {
      // silent
    } finally {
      setIsLoadingSaved(false);
    }
  };

  const handleTabChange = (tab: 'posts' | 'saved') => {
    setActiveTab(tab);
    if (tab === 'saved' && savedPosts.length === 0) {
      fetchSavedPosts();
    }
  };

  const handleProfileUpdated = (updated: User) => {
    setProfile((prev) => (prev ? { ...prev, ...updated } : null));
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
    setSavedPosts((prev) => prev.filter((p) => p._id !== postId));
    setProfile((prev) =>
      prev ? { ...prev, posts_count: Math.max(0, prev.posts_count - 1) } : null
    );
  };

  const handleLoadMore = async () => {
    if (!username || isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const res = await postsApi.getUserPosts(username, page + 1, 15);
      setPosts((prev) => [...prev, ...res.posts]);
      setHasMore(res.has_more);
      setPage((p) => p + 1);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="profile-container" style={{ paddingTop: '24px' }}>
        <SkeletonGrid count={6} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="content-full">
        <ErrorAlert message={error || 'User not found'} onRetry={fetchProfileAndPosts} />
      </div>
    );
  }

  const isOwnProfile =
    profile.is_self || (authUser && authUser.username === profile.username);

  return (
    <div className="profile-container">
      <ProfileHeader profile={profile} onProfileUpdated={handleProfileUpdated} />

      {/* Tabs Navigation */}
      <div className="profile-tabs-bar">
        <button
          className={`profile-tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => handleTabChange('posts')}
        >
          <Camera size={16} />
          <span>POSTS</span>
        </button>

        {isOwnProfile && (
          <button
            className={`profile-tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => handleTabChange('saved')}
          >
            <Bookmark size={16} />
            <span>SAVED</span>
          </button>
        )}
      </div>

      {/* Posts Section */}
      {activeTab === 'posts' ? (
        <div>
          {isLoadingPosts ? (
            <SkeletonGrid count={6} />
          ) : posts.length === 0 ? (
            <EmptyState
              icon={<ImageIcon size={32} />}
              title="No Posts Yet"
              description={`@${profile.username} hasn't published any posts.`}
            />
          ) : (
            <>
              <PostGrid posts={posts} onPostDeleted={handlePostDeleted} />

              {hasMore && (
                <div
                  style={{ display: 'flex', justifyContent: 'center', margin: '28px 0' }}
                >
                  <Button
                    variant="secondary"
                    onClick={handleLoadMore}
                    isLoading={isLoadingMore}
                  >
                    Load More Posts
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* Saved Posts Section */
        <div>
          {isLoadingSaved ? (
            <SkeletonGrid count={6} />
          ) : savedPosts.length === 0 ? (
            <EmptyState
              icon={<Bookmark size={32} />}
              title="No Saved Posts"
              description="Save photos and vibes you love to revisit them anytime."
            />
          ) : (
            <PostGrid posts={savedPosts} onPostDeleted={handlePostDeleted} />
          )}
        </div>
      )}
    </div>
  );
};
