import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { usersApi } from '../../api/users';
import { followsApi } from '../../api/follows';
import { UserSearchItem } from '../../types/user';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { Skeleton } from '../common/Skeleton';

export const SuggestedUsers: React.FC = () => {
  const [users, setUsers] = useState<UserSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user: authUser } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    let isMounted = true;
    const fetchSuggestions = async () => {
      try {
        const res = await usersApi.getSuggestedUsers(5);
        if (isMounted) setUsers(res);
      } catch {
        // silent fail
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchSuggestions();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleFollow = async (targetUser: UserSearchItem) => {
    if (!authUser) {
      showToast('Please sign in to follow creators', 'info');
      return;
    }

    const isCurrentlyFollowing = targetUser.is_following;
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
        showToast(`Following @${targetUser.username}`, 'success');
      }
    } catch {
      setUsers((prev) =>
        prev.map((u) =>
          u._id === targetUser._id ? { ...u, is_following: isCurrentlyFollowing } : u
        )
      );
      showToast('Failed to update follow status', 'error');
    }
  };

  if (isLoading) {
    return (
      <aside className="suggested-sidebar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Skeleton width="140px" height="18px" />
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Skeleton width="38px" height="38px" borderRadius="50%" />
              <div
                style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}
              >
                <Skeleton width="100px" height="12px" />
                <Skeleton width="60px" height="10px" />
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  if (users.length === 0) return null;

  return (
    <aside className="suggested-sidebar">
      {authUser && (
        <div className="suggested-current-user">
          <NavLink
            to={`/profile/${authUser.username}`}
            style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <Avatar
              src={authUser.avatar_url}
              name={authUser.display_name || authUser.username}
              size={44}
              hasRing={true}
            />
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                }}
              >
                {authUser.display_name || authUser.username}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                @{authUser.username}
              </div>
            </div>
          </NavLink>
        </div>
      )}

      <div className="suggested-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={16} color="var(--primary-from)" />
          <span>Suggested For You</span>
        </div>
        <NavLink to="/explore" className="suggested-see-all">
          See All
        </NavLink>
      </div>

      <div className="suggested-list">
        {users.map((u) => (
          <div key={u._id} className="suggested-user-item">
            <NavLink to={`/profile/${u.username}`} className="suggested-user-info">
              <Avatar src={u.avatar_url} name={u.display_name || u.username} size={36} />
              <div style={{ minWidth: 0 }}>
                <div className="suggested-user-name">{u.display_name || u.username}</div>
                <div className="suggested-user-sub">@{u.username}</div>
              </div>
            </NavLink>

            <Button
              variant={u.is_following ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleToggleFollow(u)}
              style={{
                fontSize: '12px',
                padding: '4px 10px',
                fontWeight: 600,
                color: u.is_following ? 'var(--text-secondary)' : 'var(--primary-from)',
              }}
            >
              {u.is_following ? 'Following' : 'Follow'}
            </Button>
          </div>
        ))}
      </div>

      <div className="suggested-footer">
        <p>© 2026 VibeGram • Express Your Aesthetic</p>
      </div>
    </aside>
  );
};
