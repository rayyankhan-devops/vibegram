import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: number;
  hasRing?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'User',
  size = 40,
  hasRing = false,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  const avatarStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    fontSize: `${Math.max(11, Math.floor(size * 0.38))}px`,
  };

  const content =
    src && !imageError ? (
      <img
        src={src}
        alt={name}
        className={`avatar ${className}`}
        style={avatarStyle}
        onError={() => setImageError(true)}
      />
    ) : (
      <div className={`avatar ${className}`} style={avatarStyle}>
        {initials}
      </div>
    );

  if (hasRing) {
    return <div className="avatar-ring">{content}</div>;
  }

  return content;
};
