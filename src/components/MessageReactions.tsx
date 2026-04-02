import React, { useState } from 'react';

interface MessageReactionsProps {
  messageId: number;
  chatName: string;
  onReact: (messageId: number, reaction: string) => void;
  currentReaction?: string;
}

const reactions = ['❤️', '👍', '😂', '😮', '😢', '😡'];

export const MessageReactions: React.FC<MessageReactionsProps> = ({ 
  messageId, 
  onReact, 
  currentReaction 
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleReaction = (reaction: string) => {
    onReact(messageId, reaction);
    setShowPicker(false);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {currentReaction ? (
        <button
          onClick={() => setShowPicker(!showPicker)}
          style={{
            background: 'rgba(100,150,255,0.2)',
            border: 'none',
            borderRadius: '20px',
            padding: '2px 8px',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {currentReaction}
        </button>
      ) : (
        <button
          onClick={() => setShowPicker(!showPicker)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '2px 4px'
          }}
        >
          😊
        </button>
      )}

      {showPicker && (
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '0',
            background: '#1a1a2e',
            borderRadius: '30px',
            padding: '8px 12px',
            display: 'flex',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 100,
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {reactions.map((reaction) => (
            <button
              key={reaction}
              onClick={() => handleReaction(reaction)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                padding: '4px'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {reaction}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};