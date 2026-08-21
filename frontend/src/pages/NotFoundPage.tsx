import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: '24px',
        gap: '16px',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '72px',
          fontWeight: 800,
          background: 'var(--primary-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
        }}
      >
        404
      </h1>
      <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '14px' }}>
        The vibe you are looking for doesn't exist or has moved into another dimension.
      </p>
      <Button
        variant="primary"
        onClick={() => navigate('/')}
        leftIcon={<Home size={18} />}
        style={{ marginTop: '12px' }}
      >
        Return to Home Feed
      </Button>
    </div>
  );
};
