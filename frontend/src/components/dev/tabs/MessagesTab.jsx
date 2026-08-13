import React, { useState, useEffect } from 'react';
import { Mail, Star, Trash2, Eye, X, Calendar, User, Inbox, AlertCircle } from 'lucide-react';
import { usePortfolio } from '../../../context/PortfolioContext';
import { ConfirmModal } from '../../common/ConfirmModal';

export const MessagesTab = ({ showToast }) => {
  const { messages, fetchMessages, markMessageRead, deleteMessage } = usePortfolio();
  const [filter, setFilter] = useState('all');
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [localMessages, setLocalMessages] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Load messages on mount
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Sync local state from context
  useEffect(() => {
    setLocalMessages(messages || []);
  }, [messages]);

  const allCount = localMessages.length;
  const unreadCount = localMessages.filter(m => !m.is_read).length;
  const starredCount = localMessages.filter(m => m.is_starred).length;

  const filteredMessages = localMessages.filter(msg => {
    if (filter === 'unread') return !msg.is_read;
    if (filter === 'starred') return msg.is_starred;
    return true;
  });

  const handleOpenMsg = async (msg) => {
    setSelectedMsg(msg);
    if (!msg.is_read) {
      setLocalMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
      await markMessageRead(msg.id);
    }
  };

  const toggleStar = (id) => {
    setLocalMessages(prev => prev.map(m =>
      m.id === id ? { ...m, is_starred: !m.is_starred } : m
    ));
  };

  const promptDelete = (id, name) => {
    setDeleteTarget({ id, name });
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      const targetId = deleteTarget.id;
      setLocalMessages(prev => prev.filter(m => String(m.id) !== String(targetId)));
      if (selectedMsg && String(selectedMsg.id) === String(targetId)) setSelectedMsg(null);
      await deleteMessage(targetId);
      showToast('Message deleted', 'info');
      setDeleteTarget(null);
    }
  };

  return (
    <div className="tab-pane">
      <div className="tab-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Private Messages Inbox</h2>
          <p className="tab-subtitle">View and manage contact form submissions from website visitors</p>
        </div>

        {/* Optimized Segmented Filter Pills */}
        <div className="filter-button-group">
          <button
            onClick={() => setFilter('all')}
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          >
            <Inbox size={15} /> All
            <span className="filter-count-badge">{allCount}</span>
          </button>

          <button
            onClick={() => setFilter('unread')}
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
          >
            <AlertCircle size={15} /> Unread
            <span className="filter-count-badge">{unreadCount}</span>
          </button>

          <button
            onClick={() => setFilter('starred')}
            className={`filter-btn ${filter === 'starred' ? 'active' : ''}`}
          >
            <Star size={15} /> Starred
            <span className="filter-count-badge">{starredCount}</span>
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>★</th>
              <th>Status</th>
              <th>Name</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredMessages.map((msg) => {
              const isUnread = !msg.is_read;
              const isStarred = msg.is_starred;

              return (
                <tr key={msg.id} className={isUnread ? 'row-unread' : ''}>
                  <td>
                    <button
                      onClick={() => toggleStar(msg.id)}
                      className={`btn-icon ${isStarred ? 'btn-icon-warning' : ''}`}
                      title={isStarred ? 'Unstar message' : 'Star message'}
                    >
                      <Star size={16} fill={isStarred ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                  <td>
                    {isUnread ? (
                      <span className="badge badge-warning">New</span>
                    ) : (
                      <span className="badge badge-neutral">Read</span>
                    )}
                  </td>
                  <td className="font-weight-600">{msg.name}</td>
                  <td>{msg.email}</td>
                  <td>{msg.subject || 'No Subject'}</td>
                  <td>{new Date(msg.received_at || msg.created_at || Date.now()).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleOpenMsg(msg)} className="btn-icon" title="View Message">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => promptDelete(msg.id, msg.name)} className="btn-icon btn-icon-danger" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredMessages.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center padding-large">
                  <div style={{ padding: '2rem', color: 'var(--admin-text-muted)' }}>
                    <Mail size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                    <p>No messages found in this category.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Message Modal */}
      {selectedMsg && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Message Details</h3>
              <button onClick={() => setSelectedMsg(null)} className="btn-icon">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="msg-detail-header">
                <div className="flex-center gap-2">
                  <User size={18} />
                  <div>
                    <strong>{selectedMsg.name}</strong>
                    <div className="text-muted">{selectedMsg.email}</div>
                  </div>
                </div>
                <div className="text-muted flex-center gap-1">
                  <Calendar size={14} />
                  {new Date(selectedMsg.received_at || selectedMsg.created_at || Date.now()).toLocaleString()}
                </div>
              </div>

              <div className="msg-subject-box margin-top">
                <strong>Subject:</strong> {selectedMsg.subject || 'No Subject'}
              </div>

              <div className="msg-body-box margin-top">
                <p>{selectedMsg.message}</p>
              </div>

              <div className="modal-actions margin-top">
                <button
                  onClick={() => promptDelete(selectedMsg.id, selectedMsg.name)}
                  className="btn btn-danger flex-center gap-1"
                >
                  <Trash2 size={16} /> Delete Message
                </button>
                <button onClick={() => setSelectedMsg(null)} className="btn btn-secondary">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Do you want to delete this message?"
        message="Do you want to delete this message permanently from your inbox?"
        itemName={deleteTarget?.name ? `Sender: ${deleteTarget.name}` : ''}
        confirmText="Yes, Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
