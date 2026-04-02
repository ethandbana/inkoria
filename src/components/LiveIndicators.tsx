import React, { useState, useEffect } from 'react';
import { useActivity } from '../contexts/ActivityContext';

interface Activity {
  user_name: string;
  action: string;
  location?: string;
}

const LiveIndicators: React.FC = () => {
  const { liveActivities, friendActivityCount } = useActivity();
  const [showCounter, setShowCounter] = useState(true);

  useEffect(() => {
    if (friendActivityCount > 0) {
      setShowCounter(true);
      const timer = setTimeout(() => setShowCounter(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [friendActivityCount]);

  const getActivityEmoji = (action: string): string => {
    const emojis: Record<string, string> = {
      'browsing': '📱',
      'posting': '✍️',
      'chatting': '💬',
      'viewing stories': '📸',
      'in village': '🏘️',
      'commenting': '💭',
      'liking': '❤️',
      'sharing': '🔄'
    };
    return emojis[action] || '✨';
  };

  const getActivityText = (activity: Activity): string => {
    const templates: Record<string, string> = {
      'browsing': `is browsing ${activity.location || 'trending posts'}`,
      'posting': `just posted in ${activity.location || 'their village'}`,
      'chatting': `is chatting in ${activity.location || 'DMs'}`,
      'viewing stories': `is watching stories in ${activity.location || 'Inkoria'}`,
      'in village': `is active in ${activity.location || 'a village'}`,
      'commenting': `just commented on a post`,
      'liking': `liked something in ${activity.location || 'the feed'}`,
      'sharing': `shared something with friends`
    };
    return templates[activity.action] || `is ${activity.action} on Inkoria`;
  };

  return (
    <>
      {showCounter && friendActivityCount > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '40px',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <span>🔔</span>
          <span>{friendActivityCount} friend{friendActivityCount !== 1 ? 's have' : ' has'} joined new conversations today</span>
        </div>
      )}

      <div style={{
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '16px',
        border: '1px solid rgba(255,255,255,0.1)',
        width: '280px'
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#fff'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            background: '#ff3366',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'pulse 1.5s infinite'
          }}></span>
          Live Now
        </h3>
        
        {liveActivities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.5)' }}>
            No friends active right now. Be the first! 🚀
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {liveActivities.slice(0, 5).map((activity, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  {activity.user_name?.[0]?.toUpperCase() || '👤'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: 'white' }}>{activity.user_name}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{getActivityText(activity)}</div>
                </div>
                <span style={{ fontSize: '20px' }}>{getActivityEmoji(activity.action)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </>
  );
};

export default LiveIndicators;