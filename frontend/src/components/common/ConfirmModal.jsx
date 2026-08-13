import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  title = "Do you want to delete this item?",
  message = "Do you want to delete this item permanently from your portfolio admin?",
  itemName = "",
  confirmText = "Yes, Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  danger = true
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="confirm-backdrop" onClick={onCancel}>
      <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-top">
          <div className={`confirm-icon-badge ${danger ? 'badge-danger' : 'badge-warning'}`}>
            {danger ? <Trash2 size={24} /> : <AlertTriangle size={24} />}
          </div>
          <button className="confirm-close-btn" onClick={onCancel} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="confirm-modal-content">
          <h3 className="confirm-title">{title}</h3>
          <p className="confirm-message">{message}</p>

          {itemName && (
            <div className="confirm-item-preview">
              <span className="confirm-item-label">ITEM TO DELETE:</span>
              <strong className="confirm-item-name">"{itemName}"</strong>
            </div>
          )}
        </div>

        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-btn confirm-btn-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`confirm-btn ${danger ? 'confirm-btn-danger' : 'confirm-btn-primary'}`}
            onClick={onConfirm}
            autoFocus
          >
            <Trash2 size={16} />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
