import React, { useState, useEffect } from 'react';
import { Bookmark, BookOpen, Trash2, FolderPlus, X, Check } from 'lucide-react';

interface SavedPost {
  id: number;
  postId: number;
  title: string;
  author: string;
  image: string;
  savedAt: string;
  collectionId: number;
}

interface Collection {
  id: number;
  name: string;
  icon: string;
  count: number;
}

export const Bookmarks: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [collections, setCollections] = useState<Collection[]>([
    { id: 1, name: 'Read Later', icon: '📖', count: 3 },
    { id: 2, name: 'Inspiration', icon: '✨', count: 2 },
    { id: 3, name: 'Writing Tips', icon: '✍️', count: 1 },
  ]);
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([
    { id: 1, postId: 1, title: 'Sunset hike at Battery Hill', author: 'jav.e', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&auto=format', savedAt: '2024-03-26', collectionId: 1 },
    { id: 2, postId: 2, title: 'Walking through ancient trees', author: 'travelwithlena', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=100&auto=format', savedAt: '2024-03-25', collectionId: 1 },
  ]);
  const [selectedCollection, setSelectedCollection] = useState<number>(1);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const addCollection = () => {
    if (newCollectionName.trim()) {
      const newCollection: Collection = {
        id: collections.length + 1,
        name: newCollectionName,
        icon: '📚',
        count: 0
      };
      setCollections([...collections, newCollection]);
      setNewCollectionName('');
      setShowNewCollection(false);
    }
  };

  const removeFromBookmarks = (postId: number) => {
    setSavedPosts(savedPosts.filter(p => p.id !== postId));
    // Update collection count
    setCollections(collections.map(c => 
      c.id === selectedCollection 
        ? { ...c, count: c.count - 1 }
        : c
    ));
  };

  const moveToCollection = (postId: number, toCollectionId: number) => {
    setSavedPosts(savedPosts.map(post => 
      post.id === postId ? { ...post, collectionId: toCollectionId } : post
    ));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.9)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }} onClick={onClose}>
      <div style={{
        width: '90%',
        maxWidth: '900px',
        height: '80vh',
        background: 'rgba(20,30,45,0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        display: 'flex',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.2)'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Left Sidebar - Collections */}
        <div style={{
          width: '250px',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bookmark size={20} color="white" />
              <span style={{ color: 'white', fontWeight: 'bold' }}>Bookmarks</span>
            </div>
            <button
              onClick={() => setShowNewCollection(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <FolderPlus size={18} color="white" />
            </button>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {collections.map(collection => (
              <div
                key={collection.id}
                onClick={() => setSelectedCollection(collection.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '12px',
                  marginBottom: '4px',
                  cursor: 'pointer',
                  background: selectedCollection === collection.id ? 'rgba(100,150,255,0.2)' : 'transparent'
                }}
              >
                <span style={{ fontSize: '20px' }}>{collection.icon}</span>
                <span style={{ color: 'white', flex: 1 }}>{collection.name}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{collection.count}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Main Content - Saved Posts */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h3 style={{ color: 'white', margin: 0 }}>
              {collections.find(c => c.id === selectedCollection)?.name || 'Saved Posts'}
            </h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} color="white" />
            </button>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {savedPosts.filter(p => p.collectionId === selectedCollection).length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: 'rgba(255,255,255,0.5)'
              }}>
                <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p>No saved posts in this collection</p>
                <p style={{ fontSize: '12px' }}>Save posts from your feed to read later</p>
              </div>
            ) : (
              savedPosts.filter(p => p.collectionId === selectedCollection).map(post => (
                <div key={post.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    backgroundImage: `url(${post.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '4px' }}>{post.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>by {post.author}</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', marginTop: '4px' }}>Saved {post.savedAt}</div>
                  </div>
                  <select
                    value={post.collectionId}
                    onChange={(e) => moveToCollection(post.id, parseInt(e.target.value))}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      color: 'white',
                      fontSize: '12px'
                    }}
                  >
                    {collections.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeFromBookmarks(post.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <Trash2 size={18} color="#ff6b6b" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* New Collection Modal */}
      {showNewCollection && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2001
        }} onClick={() => setShowNewCollection(false)}>
          <div style={{
            background: '#1a1a2e',
            borderRadius: '20px',
            padding: '24px',
            width: '320px'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: 'white', marginBottom: '16px' }}>New Collection</h3>
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Collection name"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                outline: 'none',
                marginBottom: '16px'
              }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowNewCollection(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={addCollection}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};