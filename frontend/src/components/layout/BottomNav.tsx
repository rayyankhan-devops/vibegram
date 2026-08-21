import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, PlusSquare, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface BottomNavProps {
  onOpenCreateModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenCreateModal }) => {
  const { user } = useAuth();

  return (
    <nav className="mobile-bottom-nav">
      <NavLink
        to="/"
        className={({ isActive }) => `mobile-nav-icon ${isActive ? 'active' : ''}`}
        end
      >
        <Home size={24} />
      </NavLink>

      <NavLink
        to="/explore"
        className={({ isActive }) => `mobile-nav-icon ${isActive ? 'active' : ''}`}
      >
        <Compass size={24} />
      </NavLink>

      <button className="mobile-nav-icon" onClick={onOpenCreateModal}>
        <PlusSquare size={24} />
      </button>

      {user ? (
        <NavLink
          to={`/profile/${user.username}`}
          className={({ isActive }) => `mobile-nav-icon ${isActive ? 'active' : ''}`}
        >
          <UserIcon size={24} />
        </NavLink>
      ) : (
        <NavLink
          to="/login"
          className={({ isActive }) => `mobile-nav-icon ${isActive ? 'active' : ''}`}
        >
          <UserIcon size={24} />
        </NavLink>
      )}
    </nav>
  );
};
