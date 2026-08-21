import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastType } from '../../context/ToastContext';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color="var(--accent-emerald)" />;
      case 'error':
        return <AlertCircle size={18} color="var(--accent-rose)" />;
      default:
        return <Info size={18} color="var(--primary-from)" />;
    }
  };

  return (
    <div className={`toast ${type}`}>
      {getIcon()}
      <span style={{ flex: 1, fontSize: '13px', fontWeight: 500 }}>{message}</span>
      <button className="btn-icon" onClick={onClose} style={{ padding: '4px' }}>
        <X size={14} />
      </button>
    </div>
  );
};
