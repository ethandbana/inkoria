import React, { useState, useEffect } from 'react';
import { X, Sparkles, Heart, Merge, MessageCircle, TrendingUp, Zap } from 'lucide-react';

interface Thought {
  id: string;
  username: string;
  user_avatar: string;
  content: string;
  reaction_type: string;
  merged_with: string | null;
  created_at: string;
  likes: number;
  sparks: number;
}

interface ThoughtStreamProps {
  onClose: () => void;
}

export const ThoughtStream: React.FC<ThoughtStreamProps> = ({ onClose }) => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [newThought, setNewThought] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'stream' | 'trending' | 'merged'>('stream');
  const [loading, setLoading] = useState(true);

  // Load thoughts from localStorage on mount
  useEffect(() => {
    loadThoughts();
    loadUser();
  }, []);

  const loadThoughts = () => {
    setLoading(true);
    const savedThoughts = localStorage.getItem('inkoria_thoughts');
    if (savedThoughts) {
      setThoughts(JSON.parse(savedThoughts));
    }
    setLoading(false);
  };

  const loadUser = () => {
    // Get from localStorage or use default
    const savedUser = localStorage.getItem('inkoria_current_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else {
      const defaultUser = {
        id: 'user1',
        username: 'You',
        avatar_url: '🌙'
      };
      setCurrentUser(defaultUser);
      localStorage.setItem('inkoria_current_user', JSON.stringify(defaultUser));
    }
  };

  const saveThoughts = (updatedThoughts: Thought[]) => {
    localStorage.setItem('inkoria_thoughts', JSON.stringify(updatedThoughts));
  };

  const submitThought = () => {
    if (!newThought.trim()) {
      alert('Please write something before dropping!');
      return;
    }

    setIsSubmitting(true);

    const newThoughtObj: Thought = {
      id: Date.now().toString(),
      username: currentUser?.username || 'You',
      user_avatar: currentUser?.avatar_url || '🌙',
      content: newThought,
      reaction_type: 'spark',
      merged_with: null,
      created_at: new Date().toISOString(),
      likes: 0,
      sparks: 0
    };

    const updatedThoughts = [newThoughtObj, ...thoughts];
    setThoughts(updatedThoughts);
    saveThoughts(updatedThoughts);
    setNewThought('');
    setIsSubmitting(false);
    
    // Show success feedback
    const dropButton = document.querySelector('.drop-button') as HTMLElement;
    if (dropButton) {
      dropButton.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (dropButton) dropButton.style.transform = 'scale(1)';
      }, 200);
    }
  };

  const addReaction = (thoughtId: string, reactionType: string) => {
    const updatedThoughts = thoughts.map(thought => {
      if (thought.id === thoughtId) {
        if (reactionType === 'like') {
          return { ...thought, likes: thought.likes + 1, reaction_type: 'like' };
        } else {
          return { ...thought, sparks: thought.sparks + 1, reaction_type: 'spark' };
        }
      }
      return thought;
    });
    setThoughts(updatedThoughts);
    saveThoughts(updatedThoughts);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const getTrendingThoughts = () => {
    return [...thoughts].sort((a, b) => (b.likes + b.sparks) - (a.likes + a.sparks)).slice(0, 10);
  };

  const getMergedThoughts = () => {
    return thoughts.filter(t => t.merged_with);
  };

  const displayedThoughts = () => {
    switch(activeTab) {
      case 'trending': return getTrendingThoughts();
      case 'merged': return getMergedThoughts();
      default: return thoughts;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.95)',
      backdropFilter: 'blur(20px)',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      animation: 'fadeIn 0.3s ease'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '28px',
            background: 'linear-gradient(135deg, #fff, #7c9cff)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent'
          }}>Thought Drop</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: '4px 0 0 0', fontSize: '13px' }}>
            Share your raw thoughts with the world.
          </p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={24} color="white" />
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        {[
          { id: 'stream', label: 'Thought Stream', icon: <MessageCircle size={16} /> },
          { id: 'trending', label: 'Trending', icon: <TrendingUp size={16} /> },
          { id: 'merged', label: 'Merged Threads', icon: <Merge size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '8px 20px',
              borderRadius: '40px',
              background: activeTab === tab.id ? 'rgba(100,150,255,0.2)' : 'transparent',
              border: activeTab === tab.id ? '1px solid rgba(100,150,255,0.5)' : '1px solid rgba(255,255,255,0.2)',
              color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '24px',
          padding: '20px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              {currentUser?.avatar_url || '🌙'}
            </div>
            <div style={{ flex: 1 }}>
              <textarea
                value={newThought}
                onChange={(e) => setNewThought(e.target.value)}
                placeholder="What's on your mind... right now?"
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontSize: '18px',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit',
                  minHeight: '80px'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submitThought();
                  }
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '12px'
              }}>
                <button
                  className="drop-button"
                  onClick={submitThought}
                  disabled={!newThought.trim() || isSubmitting}
                  style={{
                    padding: '10px 28px',
                    borderRadius: '40px',
                    background: newThought.trim() ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white',
                    cursor: newThought.trim() ? 'pointer' : 'not-allowed',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    transition: 'transform 0.2s'
                  }}
                >
                  {isSubmitting ? 'Dropping...' : 'Drop ✨'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thoughts Feed */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 24px'
      }}>
        <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginBottom: '16px', letterSpacing: '1px' }}>
          {activeTab === 'stream' && 'LATEST DROPS'}
          {activeTab === 'trending' && 'HOT DROPS'}
          {activeTab === 'merged' && 'MERGED CONVERSATIONS'}
        </h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>
            Loading thoughts...
          </div>
        ) : displayedThoughts().length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'rgba(255,255,255,0.5)'
          }}>
            <Sparkles size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>No thoughts yet. Be the first to drop one! 💭</p>
            <p style={{ fontSize: '12px', marginTop: '8px' }}>Type something above and click "Drop ✨"</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {displayedThoughts().map((thought) => (
              <div
                key={thought.id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '20px',
                  padding: '20px',
                  transition: 'all 0.2s',
                  border: thought.merged_with ? '1px solid rgba(124,156,255,0.3)' : '1px solid rgba(255,255,255,0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>
                    {thought.user_avatar}
                  </div>
                  <div>
                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>{thought.username}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                      {formatTime(thought.created_at)} ago
                    </div>
                  </div>
                </div>
                
                <p style={{ color: 'white', fontSize: '15px', lineHeight: '1.5', marginBottom: '16px' }}>
                  {thought.content}
                </p>
                
                <div style={{ display: 'flex', gap: '24px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <button
                    onClick={() => addReaction(thought.id, 'like')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'none',
                      border: 'none',
                      color: thought.reaction_type === 'like' ? '#ff6b6b' : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '20px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Heart size={16} />
                    <span style={{ fontSize: '12px' }}>{thought.likes}</span>
                  </button>
                  <button
                    onClick={() => addReaction(thought.id, 'spark')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'none',
                      border: 'none',
                      color: thought.reaction_type === 'spark' ? '#fbbf24' : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '20px'
                    }}
                  >
                    <Sparkles size={16} />
                    <span style={{ fontSize: '12px' }}>{thought.sparks}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};