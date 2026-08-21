import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="input-group">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input-field ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && (
        <span
          className="input-error-msg"
          style={{ color: 'var(--accent-rose)', fontSize: '12px' }}
        >
          {error}
        </span>
      )}
      {helperText && !error && (
        <span
          className="input-helper-text"
          style={{ color: 'var(--text-muted)', fontSize: '12px' }}
        >
          {helperText}
        </span>
      )}
    </div>
  );
};
