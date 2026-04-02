import React, { useState, memo, useCallback } from 'react';
import { PlusSquare } from 'lucide-react';

interface CreatePostInputProps {
  onFocus: () => void;
}

const CreatePostInput = memo(({ onFocus }: CreatePostInputProps) => {
  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.2)',
      backdropFilter: 'blur(12px)',
      margin: '12px',
      padding: '12px',
      borderRadius: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      border: '1px solid rgba(255,255,255,0.15)',
      cursor: 'pointer'
    }} onClick={onFocus}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px'
      }}>🌙</div>
      <input
        type="text"
        placeholder="What's on your mind?"
        readOnly
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          color: 'white',
          fontSize: '14px',
          outline: 'none',
          cursor: 'pointer'
        }}
      />
      <PlusSquare size={22} style={{ color: 'rgba(255,255,255,0.7)' }} />
    </div>
  );
});

export default CreatePostInput;