import React, { useState } from 'react';
import { Send, X, Facebook, Twitter, Link as LinkIcon } from 'lucide-react';

interface ShareButtonProps {
  postId: number;
  postTitle: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ postId, postTitle }) => {
  const [showModal, setShowModal] = useState(false);
  const postUrl = `${window.location.origin}/post/${postId}`;

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank');
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(postUrl)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(postUrl);
    alert('Link copied to clipboard!');
    setShowModal(false);
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <Send size={22} color="white" />
      </button>
      
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: '#1a1a2e', borderRadius: '20px', width: '320px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ color: 'white', margin: 0 }}>Share</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="white" />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={shareToFacebook} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#1877f2', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer' }}>
                <Facebook size={20} /> Share to Facebook
              </button>
              <button onClick={shareToTwitter} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#1da1f2', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer' }}>
                <Twitter size={20} /> Share to Twitter
              </button>
              <button onClick={copyLink} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#4a5568', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer' }}>
                <LinkIcon size={20} /> Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};