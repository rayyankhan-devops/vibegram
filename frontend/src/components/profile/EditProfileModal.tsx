import React, { useState } from 'react';
import { usersApi } from '../../api/users';
import { User } from '../../types/user';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onProfileUpdated: (updated: User) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
}) => {
  const [displayName, setDisplayName] = useState(currentUser.display_name || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar_url || '');
  const [isLoading, setIsLoading] = useState(false);
  const { updateUser } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updated = await usersApi.updateMe({
        display_name: displayName.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl.trim(),
      });
      updateUser(updated);
      onProfileUpdated(updated);
      showToast('Profile updated successfully', 'success');
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" maxWidth="480px">
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <Input
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          maxLength={50}
          disabled={isLoading}
        />

        <Input
          label="Avatar Image URL"
          placeholder="https://images.unsplash.com/..."
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          disabled={isLoading}
          helperText="Link to your avatar photo"
        />

        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label className="input-label">Bio</label>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {bio.length} / 150
            </span>
          </div>
          <textarea
            className="input-field textarea-field"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={150}
            rows={3}
            disabled={isLoading}
            placeholder="Tell the VibeGram community about yourself..."
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '8px',
          }}
        >
          <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
