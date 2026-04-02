import React, { useState } from 'react';
import { X, Mail } from 'lucide-react';

export const WaitlistPopup = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save to Supabase or localStorage
    const emails = JSON.parse(localStorage.getItem('waitlist') || '[]');
    emails.push({ email, date: new Date().toISOString() });
    localStorage.setItem('waitlist', JSON.stringify(emails));
    setSubmitted(true);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      maxWidth: '320px',
      background: 'linear-gradient(135deg, #1a472a, #0a2a1a)',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      zIndex: 1000,
      border: '1px solid rgba(255,255,255,0.2)'
    }}>
      <button
        onClick={() => setIsVisible(false)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.5)'
        }}
      >
        <X size={16} />
      </button>
      
      {!submitted ? (
        <>
          <h3 style={{ color: 'white', marginBottom: '8px', fontSize: '16px' }}>✨ Join Inkoria ✨</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginBottom: '16px' }}>
            Be the first to know when we launch new features!
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '24px',
                border: 'none',
                marginBottom: '12px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Join Waitlist
            </button>
          </form>
        </>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
          <h3 style={{ color: 'white', marginBottom: '4px', fontSize: '16px' }}>Thanks for joining!</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>We'll notify you when we launch</p>
        </div>
      )}
    </div>
  );
};