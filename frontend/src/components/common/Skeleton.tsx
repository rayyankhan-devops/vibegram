import React from 'react';

export const Skeleton: React.FC<{
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--radius-sm)',
  className = '',
  style,
}) => {
  return (
    <div
      className={`skeleton-pulse ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
};

export const SkeletonPostCard: React.FC = () => {
  return (
    <div className="post-card" style={{ marginBottom: '24px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 18px',
        }}
      >
        <Skeleton width="40px" height="40px" borderRadius="50%" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <Skeleton width="120px" height="14px" />
          <Skeleton width="80px" height="12px" />
        </div>
      </div>
      {/* Image box */}
      <Skeleton width="100%" height="450px" borderRadius="0" />
      {/* Actions & Caption */}
      <div
        style={{
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', gap: '12px' }}>
          <Skeleton width="28px" height="28px" borderRadius="50%" />
          <Skeleton width="28px" height="28px" borderRadius="50%" />
          <Skeleton width="28px" height="28px" borderRadius="50%" />
        </div>
        <Skeleton width="100px" height="14px" />
        <Skeleton width="85%" height="14px" />
        <Skeleton width="50%" height="14px" />
      </div>
    </div>
  );
};

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 9 }) => {
  return (
    <div className="post-grid">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="post-grid-item">
          <Skeleton width="100%" height="100%" borderRadius="var(--radius-md)" />
        </div>
      ))}
    </div>
  );
};

export const SkeletonStories: React.FC = () => {
  return (
    <div style={{ display: 'flex', gap: '14px', overflowX: 'hidden', padding: '14px 0' }}>
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Skeleton width="58px" height="58px" borderRadius="50%" />
          <Skeleton width="45px" height="10px" />
        </div>
      ))}
    </div>
  );
};
