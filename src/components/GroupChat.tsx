import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, X, Crown, UserMinus, Edit2, Image, Check, 
  MoreHorizontal, Camera, Send 
} from 'lucide-react';

interface Member {
  id: number;
  name: string;
  avatar: string;
  isAdmin: boolean;
  online?: boolean;
}

interface GroupChatProps {
  groupId: number;
  onClose: () => void;
}

export const GroupChat: React.FC<GroupChatProps> = ({ groupId, onClose }) => {
  const [groupName, setGroupName] = useState('Writers Circle');
  const [groupPhoto, setGroupPhoto] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: 'LovableWriter', avatar: '🌙', isAdmin: true },
    { id: 2, name: 'jav.e', avatar: 'J', isAdmin: false },
    { id: 3, name: 'sarah.w', avatar: 'S', isAdmin: false },
  ]);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'LovableWriter', text: 'Welcome to the group!', time: '2:30 PM', isOwn: true },
    { id: 2, sender: 'jav.e', text: 'Excited to be here!', time: '2:31 PM', isOwn: false },
    { id: 3, sender: 'sarah.w', text: 'Let\'s share our stories!', time: '2:32 PM', isOwn: false },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [editingName, setEditingName] = useState('');
  const [showMemberMenu, setShowMemberMenu] = useState<number | null>(null);
  
  const currentUser = { id: 1, name: 'LovableWriter' };
  const isAdmin = members.find(m => m.id === currentUser.id)?.isAdmin || false;

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        sender: currentUser.name,
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true
      }]);
      setNewMessage('');
    }
  };

  const addMember = () => {
    if (newMemberName.trim()) {
      const newMember: Member = {
        id: members.length + 1,
        name: newMemberName,
        avatar: newMemberName[0].toUpperCase(),
        isAdmin: false
      };
      setMembers([...members, newMember]);
      setNewMemberName('');
      setShowAddMember(false);
      
      // Add system message
      setMessages([...messages, {
        id: messages.length + 1,
        sender: 'System',
        text: `${newMemberName} joined the group!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: false
      }]);
    }
  };

  const removeMember = (memberId: number, memberName: string) => {
    if (memberId !== currentUser.id) {
      setMembers(members.filter(m => m.id !== memberId));
      setMessages([...messages, {
        id: messages.length + 1,
        sender: 'System',
        text: `${memberName} was removed from the group.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: false
      }]);
    }
    setShowMemberMenu(null);
  };

  const makeAdmin = (memberId: number, memberName: string) => {
    setMembers(members.map(m => 
      m.id === memberId ? { ...m, isAdmin: true } : m
    ));
    setMessages([...messages, {
      id: messages.length + 1,
      sender: 'System',
      text: `${memberName} is now an admin.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: false
    }]);
    setShowMemberMenu(null);
  };

  const updateGroupName = () => {
    if (editingName.trim()) {
      setGroupName(editingName);
      setMessages([...messages, {
        id: messages.length + 1,
        sender: 'System',
        text: `Group name changed to "${editingName}"`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: false
      }]);
      setShowEditGroup(false);
    }
  };

  const handleGroupPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setGroupPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
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
        height: '80vh',
        background: 'rgba(20,30,45,0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        display: 'flex',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.2)'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Left Sidebar - Members */}
        <div style={{
          width: '280px',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(0,0,0,0.3)'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="white" />
              <span style={{ color: 'white', fontWeight: 'bold' }}>Members</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>({members.length})</span>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowAddMember(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <Plus size={18} color="white" />
              </button>
            )}
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {members.map(member => (
              <div
                key={member.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  background: member.id === currentUser.id ? 'rgba(100,150,255,0.2)' : 'transparent',
                  position: 'relative'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  color: 'white'
                }}>
                  {member.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'white', fontSize: '14px' }}>{member.name}</span>
                    {member.isAdmin && <Crown size={12} color="#fbbf24" />}
                  </div>
                  {member.id === currentUser.id && (
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>You</span>
                  )}
                </div>
                {isAdmin && member.id !== currentUser.id && (
                  <button
                    onClick={() => setShowMemberMenu(showMemberMenu === member.id ? null : member.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <MoreHorizontal size={16} color="white" />
                  </button>
                )}
                {showMemberMenu === member.id && (
                  <div style={{
                    position: 'absolute',
                    right: '40px',
                    top: '40px',
                    background: '#1a1a2e',
                    borderRadius: '12px',
                    padding: '8px',
                    zIndex: 100,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}>
                    {!member.isAdmin && (
                      <button
                        onClick={() => makeAdmin(member.id, member.name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          width: '100%'
                        }}
                      >
                        <Crown size={14} /> Make Admin
                      </button>
                    )}
                    <button
                      onClick={() => removeMember(member.id, member.name)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        background: 'none',
                        border: 'none',
                        color: '#ff6b6b',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      <UserMinus size={14} /> Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Main Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Group Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  {groupPhoto ? <img src={groupPhoto} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : '👥'}
                </div>
                {isAdmin && (
                  <label style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    background: '#7c9cff',
                    borderRadius: '50%',
                    padding: '4px',
                    cursor: 'pointer'
                  }}>
                    <Camera size={12} color="white" />
                    <input type="file" accept="image/*" onChange={handleGroupPhotoUpload} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>{groupName}</span>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setEditingName(groupName);
                        setShowEditGroup(true);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Edit2 size={14} color="rgba(255,255,255,0.6)" />
                    </button>
                  )}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                  {members.length} members • {members.filter(m => m.online).length} online
                </span>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} color="white" />
            </button>
          </div>
          
          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{
                display: 'flex',
                justifyContent: msg.isOwn ? 'flex-end' : 'flex-start',
                alignItems: 'flex-end',
                gap: '8px'
              }}>
                {!msg.isOwn && msg.sender !== 'System' && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    color: 'white'
                  }}>
                    {msg.sender[0]}
                  </div>
                )}
                <div style={{
                  maxWidth: '70%',
                  background: msg.sender === 'System' 
                    ? 'rgba(255,255,255,0.05)' 
                    : msg.isOwn 
                      ? 'rgba(100,150,255,0.3)' 
                      : 'rgba(255,255,255,0.1)',
                  padding: '10px 14px',
                  borderRadius: msg.sender === 'System' ? '12px' : (msg.isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px'),
                  textAlign: msg.sender === 'System' ? 'center' : 'left',
                  width: msg.sender === 'System' ? '100%' : 'auto'
                }}>
                  {msg.sender !== 'System' && msg.sender !== currentUser.name && (
                    <div style={{ fontSize: '12px', color: '#7c9cff', marginBottom: '4px' }}>{msg.sender}</div>
                  )}
                  <div style={{ color: 'white', fontSize: '14px' }}>{msg.text}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{msg.time}</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Message Input */}
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            gap: '12px',
            background: 'rgba(0,0,0,0.2)'
          }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Message ${groupName}...`}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '24px',
                padding: '12px 20px',
                color: 'white',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              onClick={handleSendMessage}
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                borderRadius: '24px',
                padding: '8px 20px',
                cursor: 'pointer',
                color: 'white'
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Add Member Modal */}
      {showAddMember && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2001
        }} onClick={() => setShowAddMember(false)}>
          <div style={{
            background: '#1a1a2e',
            borderRadius: '20px',
            padding: '24px',
            width: '320px'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: 'white', marginBottom: '16px' }}>Add Member</h3>
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="Username"
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
                onClick={() => setShowAddMember(false)}
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
                onClick={addMember}
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
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Group Name Modal */}
      {showEditGroup && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2001
        }} onClick={() => setShowEditGroup(false)}>
          <div style={{
            background: '#1a1a2e',
            borderRadius: '20px',
            padding: '24px',
            width: '320px'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: 'white', marginBottom: '16px' }}>Edit Group Name</h3>
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              placeholder="Group name"
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
                onClick={() => setShowEditGroup(false)}
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
                onClick={updateGroupName}
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
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};