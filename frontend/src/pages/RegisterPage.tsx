import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Sparkles, UserPlus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password || !displayName.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        username: username.trim().toLowerCase(),
        display_name: displayName.trim(),
        email: email.trim().toLowerCase(),
        password,
        bio: bio.trim(),
        avatar_url: avatarUrl.trim(),
      });
      showToast('Account created! Welcome to VibeGram', 'success');
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-brand">
          <div
            style={{
              width: '48px',
              height: '48px',
              background: 'var(--primary-gradient)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: 'var(--shadow-glow)',
              marginBottom: '4px',
            }}
          >
            <Sparkles size={24} />
          </div>
          <h1 className="auth-logo gradient-text">Join VibeGram</h1>
          <p className="auth-subtitle">
            Create your portfolio and share your creative aesthetic
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="Username"
            type="text"
            placeholder="e.g. creative_mind"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
            helperText="3-30 characters, letters, numbers, underscores"
          />

          <Input
            label="Display Name"
            type="text"
            placeholder="e.g. Jordan River"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            disabled={isLoading}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="jordan@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          <Input
            label="Avatar Image URL (Optional)"
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            disabled={isLoading}
          />

          <div className="input-group">
            <label className="input-label">Bio (Optional)</label>
            <textarea
              className="input-field textarea-field"
              placeholder="What inspires your vibe?"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={150}
              rows={2}
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            leftIcon={<UserPlus size={18} />}
            style={{ marginTop: '8px', width: '100%' }}
          >
            Create Account
          </Button>
        </form>

        <div className="auth-footer-text">
          Already have an account?
          <NavLink to="/login" className="auth-footer-link">
            Sign In
          </NavLink>
        </div>
      </div>
    </div>
  );
};
