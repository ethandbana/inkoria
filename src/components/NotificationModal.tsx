import React from 'react';
import { X, Bell, Heart, MessageCircle, UserPlus } from 'lucide-react';

interface NotificationModalProps {
  notifications: any[];
  unreadCount: number;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  notifications,
  unreadCount,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const getIcon = (type: string) => {
    switch(type) {
      case 'like': return <Heart size={16} color="#ff6b6b" />;
      case 'comment': return <MessageCircle size={16} color="#7c9cff" />;
      case 'follow': return <UserPlus size={16} color="#4ade80" />;
      default: return <Bell size={16} color="white" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }} onClick={onClose}>
      <div style={{
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        background: 'rgba(20,30,45,0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.2)'
      }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Bell size={20} color="white" />
            <h2 style={{ color: 'white', margin: 0 }}>Notifications</h2>
            {unreadCount > 0 && (
              <span style={{
                background: '#ff6b6b',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '12px',
                color: 'white'
              }}>
                {unreadCount} new
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#7c9cff',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Mark all read
              </button>
            )}
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} color="white" />
            </button>
          </div>
        </div>
        
        <div style={{ padding: '16px', maxHeight: '60vh', overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'rgba(255,255,255,0.5)'
            }}>
              <Bell size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>No notifications yet</p>
              <p style={{ fontSize: '12px' }}>When someone likes or comments, you'll see it here</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => onMarkAsRead(notif.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  background: notif.is_read ? 'transparent' : 'rgba(100,150,255,0.1)'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getIcon(notif.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontSize: '13px', marginBottom: '4px' }}>{notif.title}</div>
                  {notif.content && (
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{notif.content}</div>
                  )}
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginTop: '4px' }}>
                    {formatTime(notif.created_at)}
                  </div>
                </div>
                {!notif.is_read && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#7c9cff',
                    borderRadius: '50%'
                  }} />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};