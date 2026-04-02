import React, { useState } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';

interface WhatsAppShareProps {
  postId: number;
  postTitle: string;
  postUrl?: string;
}

export const WhatsAppShare: React.FC<WhatsAppShareProps> = ({ postId, postTitle, postUrl }) => {
  const [showModal, setShowModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  
  const shareUrl = postUrl || `${window.location.origin}/post/${postId}`;
  
  const shareToWhatsApp = (number?: string) => {
    const message = customMessage || `Check out this post: ${postTitle}\n\n${shareUrl}`;
    let whatsappUrl = '';
    
    if (number && number.trim()) {
      // Share to specific number
      whatsappUrl = `https://wa.me/${number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    } else {
      // Share to any contact
      whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    }
    
    window.open(whatsappUrl, '_blank');
    setShowModal(false);
  };
  
  return (
    <>
      <button 
        onClick={() => setShowModal(true)} 
        style={{ 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '50%',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(37, 211, 102, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'none';
        }}
      >
        <MessageCircle size={22} color="#25D366" />
      </button>
      
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: '#1a1a2e',
            borderRadius: '24px',
            padding: '24px',
            width: '90%',
            maxWidth: '400px',
            border: '1px solid rgba(255,255,255,0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MessageCircle size={28} color="#25D366" />
                <h3 style={{ color: 'white', margin: 0 }}>Share to WhatsApp</h3>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="white" />
              </button>
            </div>
            
            {/* Post Preview */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '16px',
              padding: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginBottom: '8px' }}>Sharing:</div>
              <div style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>{postTitle}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '4px' }}>{shareUrl}</div>
            </div>
            
            {/* Custom Message */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                Add a message (optional)
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Say something..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  outline: 'none',
                  resize: 'none',
                  fontSize: '13px'
                }}
              />
            </div>
            
            {/* Send to Specific Number */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                Send to specific number (optional)
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., +1234567890"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  outline: 'none',
                  fontSize: '13px'
                }}
              />
            </div>
            
            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => shareToWhatsApp()}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, #25D366, #128C7E)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Send size={16} /> Share Now
              </button>
              <button
                onClick={() => shareToWhatsApp(phoneNumber)}
                disabled={!phoneNumber.trim()}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '24px',
                  background: phoneNumber.trim() ? 'rgba(37,211,102,0.3)' : 'rgba(255,255,255,0.1)',
                  border: phoneNumber.trim() ? '1px solid #25D366' : '1px solid rgba(255,255,255,0.2)',
                  color: phoneNumber.trim() ? 'white' : 'rgba(255,255,255,0.5)',
                  cursor: phoneNumber.trim() ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              >
                Send to Number
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};