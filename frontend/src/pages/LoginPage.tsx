import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

interface LocationState {
  from?: {
    pathname?: string;
  };
}

export const LoginPage: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as LocationState | null;
  const from = locationState?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password) {
      showToast('Please enter your username/email and password', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await login(usernameOrEmail.trim(), password);
      showToast('Welcome back to VibeGram!', 'success');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid username or password';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoUsername: string) => {
    setUsernameOrEmail(demoUsername);
    setPassword('password123');
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
          <h1 className="auth-logo gradient-text">VibeGram</h1>
          <p className="auth-subtitle">
            Share your aesthetic vibes and connect with creators
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="Username or Email"
            type="text"
            placeholder="e.g. alex_design or alex@vibegram.app"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            required
            disabled={isLoading}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            leftIcon={<LogIn size={18} />}
            style={{ marginTop: '8px', width: '100%' }}
          >
            Sign In
          </Button>
        </form>

        {/* Demo Fast Login presets */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <span
            style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}
          >
            Quick Demo Accounts (pass: password123):
          </span>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              justifyContent: 'center',
            }}
          >
            {['alex_design', 'sarah_codes', 'mike_lens', 'elena_wander'].map((acc) => (
              <Button
                key={acc}
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => handleQuickLogin(acc)}
              >
                @{acc}
              </Button>
            ))}
          </div>
        </div>

        <div className="auth-footer-text">
          Don't have an account yet?
          <NavLink to="/register" className="auth-footer-link">
            Create Account
          </NavLink>
        </div>
      </div>
    </div>
  );
};
