import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

export const WelcomePopup = ({ onClose }: { onClose: () => void }) => {
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'linear-gradient(135deg, #1a472a, #0a2a1a)',
      borderRadius: '24px',
      padding: '24px',
      maxWidth: '400px',
      width: '90%',
      zIndex: 2000,
      border: '1px solid rgba(255,255,255,0.2)',
      textAlign: 'center'
    }}>
      <button onClick={onClose} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>
        <X size={18} color="white" />
      </button>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
      <h2 style={{ color: 'white', marginBottom: '8px' }}>Welcome to Inkoria!</h2>
      <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '16px', fontSize: '14px' }}>
        Share your stories, connect with writers, and discover amazing content!
      </p>
      <button
        onClick={onClose}
        style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          border: 'none',
          padding: '10px 24px',
          borderRadius: '24px',
          color: 'white',
          cursor: 'pointer'
        }}
      >
        Start Writing ✨
      </button>
    </div>
  );
};