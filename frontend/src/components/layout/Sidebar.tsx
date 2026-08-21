import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Compass,
  PlusSquare,
  User as UserIcon,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';

interface SidebarProps {
  onOpenCreateModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenCreateModal }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="desktop-sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Sparkles size={18} />
        </div>
        <span className="gradient-text">VibeGram</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
          end
        >
          <Home size={22} />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/explore"
          className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
        >
          <Compass size={22} />
          <span>Explore</span>
        </NavLink>

        <button className="nav-link-item" onClick={onOpenCreateModal}>
          <PlusSquare size={22} />
          <span>Create Post</span>
        </button>

        {user ? (
          <NavLink
            to={`/profile/${user.username}`}
            className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
          >
            <UserIcon size={22} />
            <span>Profile</span>
          </NavLink>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
          >
            <UserIcon size={22} />
            <span>Sign In</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        {user ? (
          <>
            <NavLink to={`/profile/${user.username}`} className="user-snippet">
              <Avatar
                src={user.avatar_url}
                name={user.display_name || user.username}
                size={36}
              />
              <div className="user-snippet-details" style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                  }}
                  className="truncate"
                >
                  {user.display_name || user.username}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                  }}
                  className="truncate"
                >
                  @{user.username}
                </div>
              </div>
            </NavLink>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut size={16} />}
              style={{ justifyContent: 'flex-start' }}
            >
              <span>Logout</span>
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        )}
      </div>
    </aside>
  );
};
