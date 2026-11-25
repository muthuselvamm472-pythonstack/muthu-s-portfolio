import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  return (
    <div className={`toast-notification toast-${type}`}>
      <div className="toast-content">
        {type === 'success' && <CheckCircle size={18} />}
        {type === 'warning' && <AlertTriangle size={18} />}
        {(type === 'error' || type === 'danger') && <AlertCircle size={18} />}
        {type === 'info' && <Info size={18} />}
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="toast-close-btn">
          <X size={16} />
        </button>
      )}
    </div>
  );
};
