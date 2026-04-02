import React, { useState, useRef } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Link, Image, List, Save } from 'lucide-react';

interface RichTextEditorProps {
  initialValue?: string;
  onSave: (content: string) => void;
  onSaveDraft?: (content: string) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialValue = '', onSave, onSaveDraft }) => {
  const [content, setContent] = useState(initialValue);
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) execCommand('createLink', url);
  };

  const handleImage = () => {
    const url = prompt('Enter image URL:');
    if (url) execCommand('insertImage', url);
  };

  return (
    <div style={{
      background: 'rgba(20,30,45,0.4)',
      backdropFilter: 'blur(12px)',
      borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.1)',
      overflow: 'hidden'
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        flexWrap: 'wrap',
        background: 'rgba(0,0,0,0.3)'
      }}>
        <button onClick={() => execCommand('bold')} style={toolbarButtonStyle}><Bold size={16} /></button>
        <button onClick={() => execCommand('italic')} style={toolbarButtonStyle}><Italic size={16} /></button>
        <button onClick={() => execCommand('underline')} style={toolbarButtonStyle}><Underline size={16} /></button>
        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />
        <button onClick={() => execCommand('justifyLeft')} style={toolbarButtonStyle}><AlignLeft size={16} /></button>
        <button onClick={() => execCommand('justifyCenter')} style={toolbarButtonStyle}><AlignCenter size={16} /></button>
        <button onClick={() => execCommand('justifyRight')} style={toolbarButtonStyle}><AlignRight size={16} /></button>
        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />
        <button onClick={() => execCommand('insertUnorderedList')} style={toolbarButtonStyle}><List size={16} /></button>
        <button onClick={handleLink} style={toolbarButtonStyle}><Link size={16} /></button>
        <button onClick={handleImage} style={toolbarButtonStyle}><Image size={16} /></button>
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        dangerouslySetInnerHTML={{ __html: content }}
        onInput={(e) => setContent(e.currentTarget.innerHTML)}
        style={{
          minHeight: '300px',
          padding: '16px',
          color: 'white',
          outline: 'none',
          lineHeight: '1.6',
          fontSize: '14px'
        }}
        data-placeholder="Start writing your story..."
      />
      
      {/* Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        padding: '16px',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <button
          onClick={() => onSave(content)}
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
          Publish Story
        </button>
        {onSaveDraft && (
          <button
            onClick={() => onSaveDraft(content)}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '24px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            <Save size={16} style={{ marginRight: '8px' }} />
            Save Draft
          </button>
        )}
      </div>
    </div>
  );
};

const toolbarButtonStyle = {
  background: 'rgba(255,255,255,0.1)',
  border: 'none',
  padding: '6px',
  borderRadius: '8px',
  cursor: 'pointer',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s'
};