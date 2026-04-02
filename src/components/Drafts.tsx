import React, { useState, useEffect } from 'react';
import { X, Trash2, Edit2, Plus, Save, BookOpen } from 'lucide-react';

interface Draft {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface DraftsProps {
  onClose: () => void;
}

export const Drafts: React.FC<DraftsProps> = ({ onClose }) => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');

  useEffect(() => {
    const savedDrafts = localStorage.getItem('inkoria_drafts');
    if (savedDrafts) {
      setDrafts(JSON.parse(savedDrafts));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('inkoria_drafts', JSON.stringify(drafts));
  }, [drafts]);

  const createNewDraft = () => {
    const newDraft: Draft = {
      id: Date.now(),
      title: 'Untitled Draft',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setDrafts([newDraft, ...drafts]);
    setSelectedDraft(newDraft);
    setEditingTitle(newDraft.title);
    setEditingContent(newDraft.content);
  };

  const saveDraft = () => {
    if (selectedDraft) {
      const updatedDrafts = drafts.map(draft =>
        draft.id === selectedDraft.id
          ? {
              ...draft,
              title: editingTitle || 'Untitled Draft',
              content: editingContent,
              updatedAt: new Date().toISOString()
            }
          : draft
      );
      setDrafts(updatedDrafts);
      setSelectedDraft(null);
      alert('Draft saved!');
    }
  };

  const deleteDraft = (id: number) => {
    if (window.confirm('Delete this draft?')) {
      setDrafts(drafts.filter(draft => draft.id !== id));
      if (selectedDraft?.id === id) {
        setSelectedDraft(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
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
        maxWidth: '1000px',
        height: '85vh',
        background: 'rgba(20,30,45,0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        display: 'flex',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.2)'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Left Sidebar - Drafts List */}
        <div style={{
          width: '300px',
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
              <Save size={20} color="white" />
              <span style={{ color: 'white', fontWeight: 'bold' }}>My Drafts</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>({drafts.length})</span>
            </div>
            <button
              onClick={createNewDraft}
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                borderRadius: '20px',
                padding: '6px 12px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px'
              }}
            >
              <Plus size={14} /> New
            </button>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {drafts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'rgba(255,255,255,0.5)'
              }}>
                <BookOpen size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <p>No drafts yet</p>
                <p style={{ fontSize: '12px' }}>Click "New" to start writing</p>
              </div>
            ) : (
              drafts.map(draft => (
                <div
                  key={draft.id}
                  onClick={() => {
                    setSelectedDraft(draft);
                    setEditingTitle(draft.title);
                    setEditingContent(draft.content);
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    background: selectedDraft?.id === draft.id ? 'rgba(100,150,255,0.2)' : 'rgba(255,255,255,0.05)',
                    border: selectedDraft?.id === draft.id ? '1px solid rgba(100,150,255,0.3)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                      {draft.title.length > 30 ? draft.title.substring(0, 30) + '...' : draft.title}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDraft(draft.id);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} color="#ff6b6b" />
                    </button>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
                    Updated {formatDate(draft.updatedAt)}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '8px' }}>
                    {draft.content.substring(0, 60)}...
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Right Side - Editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h3 style={{ color: 'white', margin: 0 }}>
              {selectedDraft ? 'Edit Draft' : 'Select a draft'}
            </h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} color="white" />
            </button>
          </div>
          
          {selectedDraft ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px' }}>
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                placeholder="Story title"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  outline: 'none',
                  marginBottom: '16px'
                }}
              />
              <textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                placeholder="Start writing your story..."
                style={{
                  flex: 1,
                  width: '100%',
                  padding: '16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  outline: 'none',
                  resize: 'none'
                }}
              />
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  onClick={saveDraft}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Save Draft
                </button>
                <button
                  onClick={() => {
                    alert('Story published!');
                    deleteDraft(selectedDraft.id);
                    setSelectedDraft(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '24px',
                    background: 'rgba(100,150,255,0.2)',
                    border: '1px solid rgba(100,150,255,0.5)',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Publish Story
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '16px',
              color: 'rgba(255,255,255,0.5)'
            }}>
              <BookOpen size={48} />
              <p>Select a draft to edit or create a new one</p>
              <button
                onClick={createNewDraft}
                style={{
                  padding: '10px 24px',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Create New Draft
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};