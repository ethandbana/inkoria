import React, { useState, memo, useCallback } from 'react';
import { Smile, Gift } from 'lucide-react';

interface CommentInputProps {
  postId: number;
  onAddComment: (postId: number, text: string) => void;
}

const CommentInput = memo(({ postId, onAddComment }: CommentInputProps) => {
  const [text, setText] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  }, []);

  const handleSubmit = useCallback(() => {
    if (text.trim()) {
      onAddComment(postId, text);
      setText('');
    }
  }, [text, postId, onAddComment]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <div style={{
      padding: '10px 12px',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    }}>
      <Smile size={18} color="white" style={{ cursor: 'pointer' }} />
      <Gift size={18} color="white" style={{ cursor: 'pointer' }} />
      <input
        type="text"
        value={text}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder="Add a comment..."
        style={{
          flex: 1,
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: '20px',
          padding: '8px 12px',
          color: 'white',
          fontSize: '13px',
          outline: 'none'
        }}
      />
      <button
        onClick={handleSubmit}
        style={{
          background: 'none',
          border: 'none',
          color: text.trim() ? '#a0c0ff' : 'rgba(255,255,255,0.5)',
          cursor: text.trim() ? 'pointer' : 'default',
          fontSize: '13px'
        }}
      >
        Post
      </button>
    </div>
  );
});

export default CommentInput;