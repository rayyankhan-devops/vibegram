import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';
import { CreatePostModal } from '../posts/CreatePostModal';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export const AppLayout: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleOpenCreateModal = () => {
    if (!user) {
      showToast('Please sign in to create a post', 'info');
      navigate('/login');
      return;
    }
    setIsCreateModalOpen(true);
  };

  return (
    <div className="app-container">
      <Sidebar onOpenCreateModal={handleOpenCreateModal} />

      <div className="main-wrapper">
        <TopNav />
        <main className="main-content">
          <Outlet />
        </main>
      </div>

      <BottomNav onOpenCreateModal={handleOpenCreateModal} />

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
