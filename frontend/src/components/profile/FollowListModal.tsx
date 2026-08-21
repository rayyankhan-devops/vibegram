import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { followsApi } from '../../api/follows';
import { FollowUserItem } from '../../types/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
}

export const FollowListModal: React.FC<FollowListModalProps> = ({
  isOpen,
  onClose,
  userId,
  type,
}) => {
  const [users, setUsers] = useState<FollowUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user: authUser } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setIsLoading(true);

    const fetchList = async () => {
      try {
        const res =
          type === 'followers'
            ? await followsApi.getFollowers(userId)
            : await followsApi.getFollowing(userId);

        if (isMounted) {
          setUsers(res.users);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : `Could not load ${type}`;
          showToast(message, 'error');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchList();
    return () => {
      isMounted = false;
    };
  }, [isOpen, userId, type, showToast]);

  const handleToggleFollow = async (targetUser: FollowUserItem) => {
    if (!authUser) {
      showToast('Please sign in to follow creators', 'info');
      return;
    }

    const isCurrentlyFollowing = targetUser.is_following;
    // Optimistic toggle
    setUsers((prev) =>
      prev.map((u) =>
        u._id === targetUser._id ? { ...u, is_following: !isCurrentlyFollowing } : u
      )
    );

    try {
      if (isCurrentlyFollowing) {
        await followsApi.unfollowUser(targetUser._id);
      } else {
        await followsApi.followUser(targetUser._id);
      }
    } catch {
      // Revert on error
      setUsers((prev) =>
        prev.map((u) =>
          u._id === targetUser._id ? { ...u, is_following: isCurrentlyFollowing } : u
        )
      );
      showToast('Failed to update follow status', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === 'followers' ? 'Followers' : 'Following'}
      maxWidth="420px"
    >
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
          <Spinner />
        </div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
          No {type} yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {users.map((u) => (
            <div
              key={u._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 0',
              }}
            >
              <NavLink
                to={`/profile/${u.username}`}
                onClick={onClose}
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <Avatar
                  src={u.avatar_url}
                  name={u.display_name || u.username}
                  size={36}
                />
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {u.display_name || u.username}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    @{u.username}
                  </div>
                </div>
              </NavLink>

              {authUser && authUser._id !== u._id && (
                <Button
                  variant={u.is_following ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => handleToggleFollow(u)}
                >
                  {u.is_following ? 'Following' : 'Follow'}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};
