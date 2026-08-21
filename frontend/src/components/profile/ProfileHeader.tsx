import React, { useState } from 'react';
import { Settings, UserPlus, UserCheck } from 'lucide-react';
import { followsApi } from '../../api/follows';
import { User, UserProfile } from '../../types/user';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { EditProfileModal } from './EditProfileModal';
import { FollowListModal } from './FollowListModal';

interface ProfileHeaderProps {
  profile: UserProfile;
  onProfileUpdated: (updated: User) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  onProfileUpdated,
}) => {
  const { user: authUser } = useAuth();
  const { showToast } = useToast();

  const [isFollowing, setIsFollowing] = useState(profile.is_following);
  const [followersCount, setFollowersCount] = useState(profile.followers_count);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState<
    'followers' | 'following' | null
  >(null);
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);

  const isSelf = profile.is_self || (authUser && authUser._id === profile._id);

  const handleToggleFollow = async () => {
    if (!authUser) {
      showToast('Please sign in to follow users', 'info');
      return;
    }

    if (isTogglingFollow) return;
    setIsTogglingFollow(true);

    const nextFollowing = !isFollowing;
    const nextCount = nextFollowing
      ? followersCount + 1
      : Math.max(0, followersCount - 1);
    setIsFollowing(nextFollowing);
    setFollowersCount(nextCount);

    try {
      if (nextFollowing) {
        const res = await followsApi.followUser(profile._id);
        setFollowersCount(res.followers_count);
      } else {
        const res = await followsApi.unfollowUser(profile._id);
        setFollowersCount(res.followers_count);
      }
    } catch {
      setIsFollowing(isFollowing);
      setFollowersCount(followersCount);
      showToast('Failed to update follow status', 'error');
    } finally {
      setIsTogglingFollow(false);
    }
  };

  return (
    <header className="profile-header-card">
      <div className="profile-avatar-wrapper">
        <Avatar
          src={profile.avatar_url}
          name={profile.display_name || profile.username}
          size={100}
          hasRing={true}
        />
      </div>

      <div className="profile-info">
        <div className="profile-title-row">
          <h1 className="profile-username">@{profile.username}</h1>

          {isSelf ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              leftIcon={<Settings size={16} />}
            >
              Edit Profile
            </Button>
          ) : (
            <Button
              variant={isFollowing ? 'secondary' : 'primary'}
              size="sm"
              onClick={handleToggleFollow}
              leftIcon={isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>

        <div className="profile-stats-row">
          <div className="stat-item">
            <span className="stat-number">{profile.posts_count}</span>
            <span className="stat-label">posts</span>
          </div>

          <button
            className="stat-item btn-ghost"
            style={{ padding: 0 }}
            onClick={() => setFollowModalType('followers')}
          >
            <span className="stat-number">{followersCount}</span>
            <span className="stat-label">followers</span>
          </button>

          <button
            className="stat-item btn-ghost"
            style={{ padding: 0 }}
            onClick={() => setFollowModalType('following')}
          >
            <span className="stat-number">{profile.following_count}</span>
            <span className="stat-label">following</span>
          </button>
        </div>

        <div>
          <div className="profile-display-name">{profile.display_name}</div>
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}
        </div>
      </div>

      {isSelf && authUser && (
        <EditProfileModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          currentUser={authUser}
          onProfileUpdated={onProfileUpdated}
        />
      )}

      <FollowListModal
        isOpen={followModalType !== null}
        onClose={() => setFollowModalType(null)}
        userId={profile._id}
        type={followModalType || 'followers'}
      />
    </header>
  );
};
