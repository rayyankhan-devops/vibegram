import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles } from 'lucide-react';
import { postsApi } from '../../api/posts';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const { showToast } = useToast();

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    setPreviewError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      showToast('Please provide an image URL', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await postsApi.createPost({
        image_url: imageUrl.trim(),
        caption: caption.trim(),
      });
      showToast('Post published successfully!', 'success');
      setImageUrl('');
      setCaption('');
      onClose();
      onPostCreated?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create post';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Post" maxWidth="500px">
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <Input
          label="Image URL"
          placeholder="https://images.unsplash.com/..."
          value={imageUrl}
          onChange={(e) => handleImageUrlChange(e.target.value)}
          required
          disabled={isLoading}
          helperText="Paste any valid image link (Unsplash, Pexels, Imgur, etc.)"
        />

        {/* Live Preview Container */}
        <div
          style={{
            width: '100%',
            aspectRatio: '16 / 9',
            backgroundColor: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {imageUrl && !previewError ? (
            <img
              src={imageUrl}
              alt="Post preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setPreviewError(true)}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--text-muted)',
              }}
            >
              <ImageIcon size={32} />
              <span style={{ fontSize: '13px' }}>
                {previewError
                  ? 'Unable to load image from URL'
                  : 'Image preview will appear here'}
              </span>
            </div>
          )}
        </div>

        {/* Caption Field */}
        <div className="input-group">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <label className="input-label">Caption</label>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {caption.length} / 2200
            </span>
          </div>
          <textarea
            className="input-field textarea-field"
            placeholder="Write an inspiring caption, add #vibes, tell a story..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={2200}
            disabled={isLoading}
            rows={3}
          />
        </div>

        {/* Action Buttons */}
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
          <Button
            variant="primary"
            type="submit"
            isLoading={isLoading}
            disabled={!imageUrl.trim() || previewError}
            leftIcon={<Sparkles size={16} />}
          >
            Publish Post
          </Button>
        </div>
      </form>
    </Modal>
  );
};
