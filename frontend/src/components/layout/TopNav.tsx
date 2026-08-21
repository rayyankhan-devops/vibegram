import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../common/Avatar';

export const TopNav: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="mobile-top-nav">
      <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            background: 'var(--primary-gradient)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          <Sparkles size={16} />
        </div>
        <span
          className="gradient-text"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px' }}
        >
          VibeGram
        </span>
      </NavLink>

      {user ? (
        <NavLink to={`/profile/${user.username}`}>
          <Avatar
            src={user.avatar_url}
            name={user.display_name || user.username}
            size={32}
          />
        </NavLink>
      ) : (
        <NavLink to="/login" className="btn-icon">
          <LogIn size={20} />
        </NavLink>
      )}
    </header>
  );
};
