import React, { useState, memo, useCallback } from 'react';
import { Smile, Paperclip, Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
}

const MessageInput = memo(({ onSendMessage }: MessageInputProps) => {
  const [text, setText] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  }, []);

  const handleSubmit = useCallback(() => {
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
  }, [text, onSendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <div style={{
      padding: '12px',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    }}>
      <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <Smile size={20} color="white" />
      </button>
      <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <Paperclip size={20} color="white" />
      </button>
      <input
        type="text"
        value={text}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        style={{
          flex: 1,
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: '24px',
          padding: '10px 16px',
          color: 'white',
          fontSize: '14px',
          outline: 'none'
        }}
      />
      <button
        onClick={handleSubmit}
        style={{
          background: text.trim() ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.2)',
          border: 'none',
          borderRadius: '24px',
          padding: '8px 20px',
          cursor: text.trim() ? 'pointer' : 'default',
          color: 'white'
        }}
      >
        <Send size={18} />
      </button>
    </div>
  );
});

export default MessageInput;