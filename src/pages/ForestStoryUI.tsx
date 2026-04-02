import React from 'react';

const ForestStoryUI: React.FC = () => {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Background Image */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url("https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2070&auto=format")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        zIndex: 0
      }} />
      
      {/* Dark Overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1
      }} />
      
      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '20px',
        color: 'white'
      }}>
        <h1 style={{ textAlign: 'center' }}>Forest Theme - Testing Background</h1>
        <p style={{ textAlign: 'center' }}>If you see a forest background with dark overlay, it's working!</p>
      </div>
    </div>
  );
};

export default ForestStoryUI;