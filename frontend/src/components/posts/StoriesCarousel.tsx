import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { usersApi } from '../../api/users';
import { UserSearchItem } from '../../types/user';
import { Avatar } from '../common/Avatar';
import { SkeletonStories } from '../common/Skeleton';

export const StoriesCarousel: React.FC = () => {
  const [creators, setCreators] = useState<UserSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCreators = async () => {
      try {
        const users = await usersApi.getSuggestedUsers(10);
        if (isMounted) setCreators(users);
      } catch {
        // silent fail
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchCreators();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="stories-container">
        <SkeletonStories />
      </div>
    );
  }

  if (creators.length === 0) return null;

  return (
    <div className="stories-container">
      <div className="stories-scroll">
        {creators.map((c) => (
          <NavLink key={c._id} to={`/profile/${c.username}`} className="story-item">
            <div className="story-avatar-ring">
              <Avatar src={c.avatar_url} name={c.display_name || c.username} size={54} />
            </div>
            <span className="story-username">{c.username}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};
