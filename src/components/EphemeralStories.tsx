import React, { useState, useEffect } from 'react';

interface Story {
  id: number;
  content: string;
  author: string;
  timestamp: string;
  expiresAt: string;
}

const EphemeralStories: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    loadStories();
    const interval = setInterval(loadStories, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadStories = () => {
    const savedStories = JSON.parse(localStorage.getItem('inkoria_stories') || '[]');
    const now = new Date();
    const validStories = savedStories.filter((story: Story) => new Date(story.expiresAt) > now);
    setStories(validStories);
  };

  const addStory = (content: string) => {
    if (!content.trim()) return;
    
    const newStory: Story = {
      id: Date.now(),
      content,
      author: 'You',
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    const updatedStories = [newStory, ...stories];
    localStorage.setItem('inkoria_stories', JSON.stringify(updatedStories));
    setStories(updatedStories);
  };

  const getTimeRemaining = (expiresAt: string): string => {
    const remaining = new Date(expiresAt).getTime() - new Date().getTime();
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div style={{
      background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '16px',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{ fontSize: '16px', color: 'white', margin: 0 }}>📸 Stories</h3>
        <button
          onClick={() => {
            const content = prompt('What do you want to share? (disappears in 24h)');
            if (content) addStory(content);
          }}
          style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '20px',
            color: 'white',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          + Add Story
        </button>
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        paddingBottom: '8px'
      }}>
        {stories.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '13px',
            width: '100%'
          }}>
            No stories right now. Share something!
          </div>
        ) : (
          stories.map(story => (
            <div key={story.id} style={{
              minWidth: '200px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '12px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                fontSize: '12px'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  {story.author[0]}
                </div>
                <span style={{ fontWeight: '600', color: 'white' }}>{story.author}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginLeft: 'auto' }}>
                  {getTimeRemaining(story.expiresAt)} left
                </span>
              </div>
              <div style={{ fontSize: '14px', color: 'white' }}>{story.content}</div>
            </div>
          ))
        )}
      </div>

      <style>{`
        div::-webkit-scrollbar {
          height: 4px;
        }
        div::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        div::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default EphemeralStories;