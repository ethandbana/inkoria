import { SoundSettings } from '../components/SoundSettings';
import { OnboardingTour } from '../components/OnboardingTour';
import { supabase } from '../lib/supabase';
import { soundManager } from '../services/soundManager';
import React, { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { ShareButton } from '../components/ShareButton';
import CommentInput from '../components/CommentInput';
import MessageInput from '../components/MessageInput';
import { GroupChat } from '../components/GroupChat';
import { WhatsAppShare } from '../components/WhatsAppShare';
import { ThoughtStream } from '../components/ThoughtStream';
import { NotificationModal } from '../components/NotificationModal';
import { Drafts } from '../components/Drafts';
import WebRTCCallComponent from '../components/WebRTCCall';
import WebRTCIncomingCall from '../components/WebRTCIncomingCall';
import { useWebRTC } from '../hooks/useWebRTC';
import { Sparkles } from 'lucide-react';
import { 
  Home, Search, Compass, Heart, User, PlusSquare, 
  MessageCircle, Send, MoreHorizontal, Bookmark, 
  Phone, Video, Settings, LogOut, Palette, X,
  ArrowLeft, Check, Globe, Lock, Upload,
  Bell, HelpCircle, Camera, Image, Video as VideoIcon,
  Smile, Paperclip, Mic, Trash2, Edit2, CheckCircle,
  Clock, Users, TrendingUp, Calendar, Star, Zap,
  Eye, EyeOff, Shield, AlertTriangle, Download, Music,
  Gift, Flag, Volume2, VolumeX, Maximize2, Minimize2,
  Play, Pause, File, FileText, FileImage, FileVideo,
  Save, Award, Flame
} from 'lucide-react';
const getTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const ForestLayout: React.FC = () => {
  // ============ USER STATE ============
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showPostMenu, setShowPostMenu] = useState<string | null>(null);

  // ============ POSTS STATE ============
  const [posts, setPosts] = useState<any[]>([]);

  // ============ GROUP CHAT STATE ============
  const [showGroupChat, setShowGroupChat] = useState<number | null>(null);
  const [groups, setGroups] = useState([
    { id: 1, name: 'Writers Circle', members: 3, unread: 2, lastMessage: 'Let\'s share our stories!' }
  ]);

  // ============ STORIES STATE ============
  const [stories, setStories] = useState<Array<{
    id: number;
    username: string;
    avatar: string;
    isAdd?: boolean;
    viewed: boolean;
    image: string | null;
    time?: string;
    viewers: string[];
    likes: string[];
  }>>([
    { id: 1, username: 'Your Story', avatar: '🌙', isAdd: true, viewed: false, image: null, viewers: [], likes: [] },
    { id: 2, username: 'jav.e', avatar: 'J', image: null, viewed: false, time: '2h ago', viewers: ['sarah.w', 'mike_95'], likes: ['sarah.w'] },
    { id: 3, username: 'sarah.w', avatar: 'S', image: null, viewed: false, time: '3h ago', viewers: ['jav.e'], likes: [] },
    { id: 4, username: 'mike_95', avatar: 'M', image: null, viewed: true, time: '1d ago', viewers: [], likes: [] },
    { id: 5, username: 'travelwithlena', avatar: 'L', image: null, viewed: false, time: '5h ago', viewers: ['jav.e', 'sarah.w'], likes: ['jav.e'] },
  ]);

  // ============ CHAT STATE ============
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  
  // ============ OTHER STATE ============
  const [newMessage, setNewMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState('');
  const [activePage, setActivePage] = useState('home');
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [realConversations, setRealConversations] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(currentUser?.id?.toString() || '');
  const [backgroundImage, setBackgroundImage] = useState('https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2070&auto=format');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [searchQuery, setSearchQuery] = useState('');
  const [commentText, setCommentText] = useState<{[key: number]: string}>({});
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [newPostVideo, setNewPostVideo] = useState<string | null>(null);
  const [newPostType, setNewPostType] = useState<'image' | 'video'>('image');
  const [showStoryViewer, setShowStoryViewer] = useState<any>(null);
  const [showStoryViewers, setShowStoryViewers] = useState<any>(null);
  const [followedUsers, setFollowedUsers] = useState<number[]>([2, 3]);
  const [showGifPicker, setShowGifPicker] = useState<number | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);
  const [uploadingFile, setUploadingFile] = useState<{chat: string, type: string} | null>(null);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [commentGif, setCommentGif] = useState<{[key: number]: string | null}>({});
  const [commentVideo, setCommentVideo] = useState<{[key: number]: string | null}>({});
  const [editingPost, setEditingPost] = useState<any>(null);
  const [showDrafts, setShowDrafts] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showThoughtStream, setShowThoughtStream] = useState(false);
  
  // GIFs list
  const popularGifs = [
    'https://media.giphy.com/media/3o7abB06u9bNzA8LC8/giphy.gif',
    'https://media.giphy.com/media/l0MYt5jH6gk5/200.gif',
    'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
    'https://media.giphy.com/media/xUPGcguWZHRC2HyBRS/giphy.gif',
  ];

  // ============ LOAD REAL USER ============
  useEffect(() => {
    const getUser = async () => {
      setLoadingUser(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setCurrentUser({
          id: user.id,
          name: profile?.display_name || user.email?.split('@')[0] || 'User',
          username: profile?.username || `@${user.email?.split('@')[0]}`,
          avatar: profile?.avatar_url || user.email?.[0]?.toUpperCase() || '👤',
          profileImage: profile?.avatar_url || null,
          bio: profile?.bio || '✨ Storyteller ✨',
          email: user.email,
          followers: 0,
          following: 0,
          stories: 0,
          isPrivate: false,
          verified: false,
          phone: ''
        });
      }
      setLoadingUser(false);
    };
    
    getUser();
  }, []);

  // ============ LOAD REAL POSTS ============
  useEffect(() => {
    if (!currentUser?.id) return;
    const loadPosts = async () => {
      setLoading(true);
      // Fetch published books as posts
      const { data: books } = await supabase
        .from('books')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (books && books.length > 0) {
        // Get author profiles
        const authorIds = [...new Set(books.map(b => b.author_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', authorIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        // Get likes for current user
        const { data: userLikes } = await supabase
          .from('likes')
          .select('book_id')
          .eq('user_id', currentUser.id);
        const likedBookIds = new Set(userLikes?.map(l => l.book_id) || []);

        // Get bookmarks for current user
        const { data: userBookmarks } = await supabase
          .from('bookmarks')
          .select('book_id')
          .eq('user_id', currentUser.id);
        const savedBookIds = new Set(userBookmarks?.map(b => b.book_id) || []);

        // Get like counts
        const { data: likeCounts } = await supabase
          .from('likes')
          .select('book_id');
        const likeCountMap = new Map<string, number>();
        likeCounts?.forEach(l => {
          likeCountMap.set(l.book_id, (likeCountMap.get(l.book_id) || 0) + 1);
        });

        // Get comments
        const bookIds = books.map(b => b.id);
        const { data: allComments } = await supabase
          .from('comments')
          .select('*')
          .in('book_id', bookIds)
          .order('created_at', { ascending: true });

        const commentsByBook = new Map<string, any[]>();
        if (allComments) {
          const commentUserIds = [...new Set(allComments.map(c => c.user_id))];
          const { data: commentProfiles } = await supabase
            .from('profiles')
            .select('id, username, display_name')
            .in('id', commentUserIds);
          const commentProfileMap = new Map(commentProfiles?.map(p => [p.id, p]) || []);

          allComments.forEach(c => {
            const cp = commentProfileMap.get(c.user_id);
            const arr = commentsByBook.get(c.book_id) || [];
            arr.push({
              id: c.id,
              username: cp?.username || cp?.display_name || 'user',
              text: c.content,
              time: getTimeAgo(c.created_at),
              likes: 0,
              gif: null,
              video: null
            });
            commentsByBook.set(c.book_id, arr);
          });
        }

        const mappedPosts = books.map(book => {
          const author = profileMap.get(book.author_id);
          return {
            id: book.id,
            userId: book.author_id,
            username: author?.username || author?.display_name || 'unknown',
            userAvatar: author?.avatar_url?.[0]?.toUpperCase() || '👤',
            userImage: author?.avatar_url || null,
            location: book.genre || '',
            timeAgo: getTimeAgo(book.created_at),
            image: book.cover_image_url || '',
            video: null,
            caption: book.description || book.title,
            hashtags: (book.tags || []).map((t: string) => `#${t}`).join(' '),
            likes: likeCountMap.get(book.id) || 0,
            comments: commentsByBook.get(book.id) || [],
            liked: likedBookIds.has(book.id),
            saved: savedBookIds.has(book.id)
          };
        });
        setPosts(mappedPosts);
      } else {
        setPosts([]);
      }
      setLoading(false);
    };
    loadPosts();
  }, [currentUser?.id]);

  // ============ LOAD REAL STORIES ============
  useEffect(() => {
    if (!currentUser?.id) return;
    const loadStories = async () => {
      const { data: statuses } = await supabase
        .from('statuses')
        .select('*')
        .order('created_at', { ascending: false });

      if (statuses && statuses.length > 0) {
        const userIds = [...new Set(statuses.map(s => s.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', userIds);
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        const realStories = statuses.map((s, i) => {
          const p = profileMap.get(s.user_id);
          return {
            id: i + 2,
            username: p?.username || p?.display_name || 'user',
            avatar: p?.avatar_url?.[0]?.toUpperCase() || '👤',
            isAdd: false,
            viewed: false,
            image: s.media_url,
            time: getTimeAgo(s.created_at),
            viewers: [] as string[],
            likes: [] as string[]
          };
        });
        setStories([
          { id: 1, username: 'Your Story', avatar: currentUser.avatar || '🌙', isAdd: true, viewed: false, image: null, viewers: [], likes: [] },
          ...realStories
        ]);
      }
    };
    loadStories();
  }, [currentUser?.id]);

  // ============ LOAD REAL FOLLOWS ============
  useEffect(() => {
    if (!currentUser?.id) return;
    const loadFollows = async () => {
      const { data } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUser.id);
      if (data) {
        setFollowedUsers(data.map(f => f.following_id) as any);
      }

      // Update follower/following counts
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', currentUser.id);
      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', currentUser.id);
      
      setCurrentUser((prev: any) => prev ? { ...prev, followers: followersCount || 0, following: followingCount || 0 } : prev);
    };
    loadFollows();
  }, [currentUser?.id]);

  // ============ RESIZE HANDLER ============
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ============ NOTIFICATION LISTENER ============
  useEffect(() => {
    if (!currentUser?.id) return;
    
    const subscription = supabase
      .channel('notifications-channel')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${currentUser.id}` },
        (payload) => {
          setToast({
            title: payload.new.title,
            message: payload.new.content
          });
          setTimeout(() => setToast(null), 3000);
        }
      )
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, [currentUser?.id]);

  // Real users loaded from DB
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser?.id) return;
    const loadAllUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, bio, is_online')
        .neq('id', currentUser.id)
        .limit(50);
      if (data) {
        setAllUsers(data.map((p, i) => ({
          id: p.id,
          name: p.display_name || p.username || 'User',
          username: `@${p.username || p.id.substring(0, 8)}`,
          avatar: p.avatar_url?.[0]?.toUpperCase() || '👤',
          avatarUrl: p.avatar_url,
          bio: p.bio || '',
          followers: 0,
          isFollowing: (followedUsers as any[]).includes(p.id),
          isCurrentUser: false,
          verified: false
        })));
      }
    };
    loadAllUsers();
  }, [currentUser?.id, followedUsers]);

  // ============ LOAD REAL CONVERSATIONS ============
  useEffect(() => {
    if (!currentUser?.id) return;
    const loadConversations = async () => {
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: false });
      if (!msgs) { setRealConversations([]); return; }
      const convMap = new Map<string, any>();
      msgs.forEach(m => {
        const partnerId = m.sender_id === currentUser.id ? m.receiver_id : m.sender_id;
        if (!convMap.has(partnerId)) {
          convMap.set(partnerId, { partnerId, lastMessage: m.content, lastTime: m.created_at, unreadCount: 0 });
        }
        if (m.receiver_id === currentUser.id && !m.is_read) {
          convMap.get(partnerId).unreadCount++;
        }
      });
      const partnerIds = [...convMap.keys()];
      if (partnerIds.length === 0) { setRealConversations([]); return; }
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, is_online')
        .in('id', partnerIds);
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      setRealConversations([...convMap.values()].map(c => {
        const p = profileMap.get(c.partnerId);
        return { id: c.partnerId, name: p?.display_name || p?.username || 'User', avatar: p?.avatar_url?.[0]?.toUpperCase() || '👤', avatarUrl: p?.avatar_url, message: c.lastMessage, time: getTimeAgo(c.lastTime), unread: c.unreadCount > 0, online: p?.is_online || false, typing: false };
      }));
    };
    loadConversations();
    const channel = supabase.channel('forest-msgs-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new as any;
        if (msg.sender_id === currentUser.id || msg.receiver_id === currentUser.id) {
          loadConversations();
          if (selectedChat && (msg.sender_id === selectedChat || msg.receiver_id === selectedChat)) {
            setChatMessages(prev => [...prev, msg]);
          }
        }
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser?.id || !selectedChat) { setChatMessages([]); return; }
    const loadChat = async () => {
      const { data } = await supabase.from('messages').select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedChat}),and(sender_id.eq.${selectedChat},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });
      setChatMessages(data || []);
      await supabase.from('messages').update({ is_read: true }).eq('sender_id', selectedChat).eq('receiver_id', currentUser.id).eq('is_read', false);
    };
    loadChat();
  }, [selectedChat, currentUser?.id]);

  const conversations = realConversations;
  const selectedChatUser = realConversations.find((c: any) => c.id === selectedChat) || allUsers.find((u: any) => u.id === selectedChat);
  const selectedChatName = selectedChatUser?.name || '';

  const displayStories = [
    { username: 'Your Story', avatar: '🌙', isAdd: true, viewed: false },
    { username: 'jav.e', avatar: 'J', viewed: false },
    { username: 'sarah.w', avatar: 'S', viewed: false },
    { username: 'mike_95', avatar: 'M', viewed: true },
    { username: 'travelwithlena', avatar: 'L', viewed: false },
  ];

  const transparentStyle = {
    background: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '20px'
  };

  // ============ FUNCTIONS ============
  
  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentUser({ ...currentUser, profileImage: reader.result as string });
        alert('Profile picture updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async () => {
    if ((newPostImage || newPostVideo) && newPostCaption && currentUser) {
      // Upload image to storage if it's a data URL
      let imageUrl = newPostImage;
      if (newPostImage && newPostImage.startsWith('data:')) {
        const blob = await fetch(newPostImage).then(r => r.blob());
        const fileName = `posts/${currentUser.id}/${Date.now()}.jpg`;
        const { data: uploadData } = await supabase.storage.from('uploads').upload(fileName, blob);
        if (uploadData) {
          const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        }
      }

      const { data: newBook, error } = await supabase
        .from('books')
        .insert({
          author_id: currentUser.id,
          title: newPostCaption.substring(0, 100),
          description: newPostCaption,
          cover_image_url: imageUrl,
          is_published: true,
          is_draft: false,
        })
        .select()
        .single();

      if (newBook && !error) {
        const newPost = {
          id: newBook.id,
          userId: currentUser.id,
          username: currentUser.name,
          userAvatar: currentUser.avatar,
          userImage: currentUser.profileImage,
          location: '',
          timeAgo: 'Just now',
          image: imageUrl || '',
          video: newPostVideo || null,
          caption: newPostCaption,
          hashtags: '',
          likes: 0,
          comments: [],
          liked: false,
          saved: false
        };
        setPosts([newPost, ...posts]);
      }
      setNewPostCaption('');
      setNewPostImage(null);
      setNewPostVideo(null);
      setShowCreatePost(false);
    }
  };

  const handlePostImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewPostImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePostVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewPostVideo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCreateStory = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser) {
      const fileName = `stories/${currentUser.id}/${Date.now()}.${file.name.split('.').pop()}`;
      const { data: uploadData } = await supabase.storage.from('uploads').upload(fileName, file);
      if (uploadData) {
        const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
        const mediaUrl = urlData.publicUrl;
        const mediaType = file.type.startsWith('video') ? 'video' : 'image';

        await supabase.from('statuses').insert({
          user_id: currentUser.id,
          media_url: mediaUrl,
          media_type: mediaType,
          caption: null
        });

        const newStory = {
          id: stories.length + 1,
          username: currentUser.name,
          avatar: currentUser.avatar,
          isAdd: false,
          viewed: false,
          image: mediaUrl,
          time: 'Just now',
          viewers: [] as string[],
          likes: [] as string[]
        };
        setStories(prev => [prev[0], newStory, ...prev.slice(1)]);
      }
    }
  };

  const viewStory = (story: any) => {
    if (!story.isAdd && currentUser) {
      setShowStoryViewer(story);
      setStories(stories.map(s => s.id === story.id ? { ...s, viewed: true, viewers: [...s.viewers, currentUser.name] } : s));
    }
  };

  const viewStoryViewers = (story: any) => {
    setShowStoryViewers(story);
  };

  const likeStory = (storyId: number) => {
    if (currentUser) {
      setStories(stories.map(s => s.id === storyId ? { ...s, likes: [...s.likes, currentUser.name] } : s));
      alert('Liked story!');
    }
  };

  const followUser = async (userId: any) => {
    if (!currentUser) return;
    await supabase.from('follows').insert({ follower_id: currentUser.id, following_id: userId });
    setFollowedUsers((prev: any) => [...prev, userId]);
  };

  const unfollowUser = async (userId: any) => {
    if (!currentUser) return;
    await supabase.from('follows').delete().eq('follower_id', currentUser.id).eq('following_id', userId);
    setFollowedUsers((prev: any[]) => prev.filter((id: any) => id !== userId));
  };

  const createNotification = async (userId: string, title: string, content: string, type: string, entityId?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        from_user_id: user?.id,
        title,
        body: content,
        type,
        link: entityId || null,
        is_read: false
      }]);
  };

  const playNotificationSound = () => {
    soundManager.playBuiltIn('gentle');
  };

  const handleLike = async (postId: any) => {
    if (!currentUser) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const newLiked = !post.liked;

    // Optimistic update
    setPosts(posts.map(p => p.id === postId ? { ...p, liked: newLiked, likes: newLiked ? p.likes + 1 : p.likes - 1 } : p));

    if (newLiked) {
      await supabase.from('likes').insert({ user_id: currentUser.id, book_id: postId });
      if (post.userId !== currentUser.id) {
        createNotification(post.userId, 'New Like', `${currentUser.name} liked your post`, 'like', postId);
        playNotificationSound();
      }
    } else {
      await supabase.from('likes').delete().eq('user_id', currentUser.id).eq('book_id', postId);
    }
  };

  const handleSave = async (postId: any) => {
    if (!currentUser) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const newSaved = !post.saved;

    setPosts(posts.map(p => p.id === postId ? { ...p, saved: newSaved } : p));

    if (newSaved) {
      await supabase.from('bookmarks').insert({ user_id: currentUser.id, book_id: postId });
    } else {
      await supabase.from('bookmarks').delete().eq('user_id', currentUser.id).eq('book_id', postId);
    }
  };

  const handleAddComment = async (postId: any, text: string) => {
    if (!text.trim() || !currentUser) return;

    await supabase.from('comments').insert({ user_id: currentUser.id, book_id: postId, content: text });

    const post = posts.find(p => p.id === postId);
    if (post && post.userId !== currentUser.id) {
      createNotification(post.userId, 'New Comment', `${currentUser.name} commented: "${text.substring(0, 50)}..."`, 'comment', postId);
      playNotificationSound();
    }

    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...p.comments, {
            id: Date.now(),
            username: currentUser.name,
            text,
            time: 'Just now',
            likes: 0,
            gif: null,
            video: null
          }]
        };
      }
      return p;
    }));
    setCommentText({ ...commentText, [postId]: '' });
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !currentUser || !selectedChat) return;
    await supabase.from('messages').insert({
      sender_id: currentUser.id,
      receiver_id: selectedChat,
      content: text
    });
    setNewMessage('');
  };

  const sendFile = async (partnerId: string, type: 'audio' | 'video' | 'file') => {
    if (!currentUser) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'audio' ? 'audio/*' : type === 'video' ? 'video/*' : '*/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const fileName = `chat/${currentUser.id}/${Date.now()}_${file.name}`;
        const { data: uploadData } = await supabase.storage.from('uploads').upload(fileName, file);
        if (uploadData) {
          const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
          await supabase.from('messages').insert({
            sender_id: currentUser.id,
            receiver_id: partnerId,
            content: `📎 ${file.name}`,
            media_url: urlData.publicUrl,
            media_type: type
          });
        }
      }
    };
    input.click();
  };

  const { incomingCall, acceptCall, declineCall } = useIncomingCalls(currentUser?.id);
  const [activeCall, setActiveCall] = useState<{ url: string; isAudioOnly: boolean } | null>(null);


  const startCall = async (type: string) => {
    if (!currentUser || !selectedChat) return;
    try {
      const { data, error } = await supabase.functions.invoke('create-daily-room', {
        body: { partnerId: selectedChat, callType: type.toLowerCase() },
      });
      if (error) throw error;
      if (data?.url) {
        setActiveCall({ url: data.url, isAudioOnly: type.toLowerCase() === 'audio' });
      }
    } catch (err: any) {
      alert(`Failed to start call: ${err.message}`);
    }
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImage(reader.result as string);
        alert('Background updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditProfile = () => {
    if (!currentUser) return;
    const newName = prompt('Enter your name:', currentUser.name);
    const newBio = prompt('Enter your bio:', currentUser.bio);
    if (newName) setCurrentUser({ ...currentUser, name: newName });
    if (newBio) setCurrentUser({ ...currentUser, bio: newBio });
    alert('Profile updated!');
  };

  const updateSafetySetting = (setting: string, value: boolean) => {
    alert(`${setting} updated to ${value ? 'ON' : 'OFF'}`);
  };

  const searchResults = {
    users: allUsers.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 u.bio.toLowerCase().includes(searchQuery.toLowerCase())),
    posts: posts.filter(p => p.caption.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.hashtags.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.username.toLowerCase().includes(searchQuery.toLowerCase()))
  };

  // ============ MODAL COMPONENTS ============
  
  const StoryViewersModal = () => {
    if (!showStoryViewers) return null;
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowStoryViewers(null)}>
        <div style={{ width: '90%', maxWidth: '400px', ...transparentStyle, padding: '24px' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ color: 'white' }}>Story Views</h3>
            <button onClick={() => setShowStoryViewers(null)}><X size={20} color="white" /></button>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>VIEWERS ({showStoryViewers.viewers?.length || 0})</h4>
            {showStoryViewers.viewers?.map((viewer: string, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginTop: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{viewer[0]}</div>
                <span style={{ color: 'white' }}>{viewer}</span>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>LIKES ({showStoryViewers.likes?.length || 0})</h4>
            {showStoryViewers.likes?.map((like: string, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginTop: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{like[0]}</div>
                <span style={{ color: 'white' }}>{like}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const SafetyModal = () => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowSafetyModal(false)}>
      <div style={{ width: '90%', maxWidth: '500px', ...transparentStyle, padding: '24px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ color: 'white' }}>Safety & Privacy</h2>
          <button onClick={() => setShowSafetyModal(false)}><X size={24} color="white" /></button>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '8px' }}>
            <div><span style={{ color: 'white' }}>Blocked Users</span><div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Manage blocked accounts</div></div>
            <button onClick={() => alert('Blocked users list')} style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}>Manage</button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '8px' }}>
            <div><span style={{ color: 'white' }}>Muted Accounts</span><div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Hide posts and stories</div></div>
            <button onClick={() => alert('Muted users list')} style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}>Manage</button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '8px' }}>
            <div><span style={{ color: 'white' }}>Sensitive Content</span><div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Filter sensitive posts</div></div>
            <button onClick={() => updateSafetySetting('Sensitive Content', true)} style={{ width: '44px', height: '24px', borderRadius: '24px', background: '#7c9cff', border: 'none', cursor: 'pointer' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', margin: '2px 22px' }} />
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '8px' }}>
            <div><span style={{ color: 'white' }}>Comment Controls</span><div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Who can comment on your posts</div></div>
            <select style={{ padding: '6px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}>
              <option>Everyone</option><option>People you follow</option><option>Only you</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            <div><span style={{ color: 'white' }}>Report a Problem</span><div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Report bugs or issues</div></div>
            <button onClick={() => alert('Report form opened')} style={{ padding: '6px 12px', borderRadius: '20px', background: '#ff6b6b', border: 'none', color: 'white' }}>Report</button>
          </div>
        </div>
        
        <button onClick={() => setShowSafetyModal(false)} style={{ width: '100%', padding: '12px', borderRadius: '24px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', color: 'white', cursor: 'pointer' }}>Done</button>
      </div>
    </div>
  );

  const EditPostModal = () => {
    if (!editingPost) return null;
    const [newCaption, setNewCaption] = useState(editingPost.caption);
    
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }} onClick={() => setEditingPost(null)}>
        <div style={{
          background: '#1a1a2e',
          borderRadius: '20px',
          padding: '24px',
          width: '400px'
        }} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ color: 'white', marginBottom: '16px' }}>Edit Post</h3>
          <textarea
            value={newCaption}
            onChange={(e) => setNewCaption(e.target.value)}
            rows={4}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              outline: 'none',
              marginBottom: '16px',
              resize: 'none'
            }}
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setEditingPost(null)}
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
              onClick={async () => {
                await supabase.from('books').update({ description: newCaption }).eq('id', editingPost.id);
                setPosts(posts.map(post => 
                  post.id === editingPost.id ? { ...post, caption: newCaption } : post
                ));
                setEditingPost(null);
              }}
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
    );
  };

  const SettingsModal = () => {
    const [settingsTab, setSettingsTab] = useState('account');
    const [themePreview, setThemePreview] = useState('glass');
    const [privateAccount, setPrivateAccount] = useState(currentUser?.isPrivate || false);
    
    const themesList = {
      glass: { name: 'Glass', icon: '✨' },
      dark: { name: 'Dark', icon: '🌙' },
      forest: { name: 'Forest', icon: '🌲' },
      midnight: { name: 'Midnight', icon: '🌌' },
      sunset: { name: 'Sunset', icon: '🌅' },
      ocean: { name: 'Ocean', icon: '🌊' },
    };
    
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowSettings(false)}>
        <div style={{ width: '90%', maxWidth: '800px', maxHeight: '85vh', overflow: 'hidden', background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(20px)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.2)' }} onClick={(e) => e.stopPropagation()}>
          
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ color: 'white', fontSize: '24px', margin: 0 }}>Settings</h2>
            <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="white" /></button>
          </div>
          
          <div style={{ display: 'flex', height: 'calc(85vh - 70px)', overflow: 'hidden' }}>
            <div style={{ width: '200px', borderRight: '1px solid rgba(255,255,255,0.1)', padding: '16px 8px', overflowY: 'auto' }}>
              {[
                { icon: User, label: 'Account', tab: 'account' },
                { icon: Bell, label: 'Notifications', tab: 'notifications' },
                { icon: Palette, label: 'Appearance', tab: 'appearance' },
                { icon: Globe, label: 'Privacy', tab: 'privacy' },
                { icon: Shield, label: 'Safety', tab: 'safety' },
                { icon: Settings, label: 'Preferences', tab: 'preferences' },
                { icon: HelpCircle, label: 'Help', tab: 'help' },
                { icon: LogOut, label: 'Log Out', tab: 'logout' },
              ].map(item => (
                <button key={item.tab} onClick={() => setSettingsTab(item.tab)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', width: '100%', background: settingsTab === item.tab ? 'rgba(100,150,255,0.2)' : 'transparent', border: 'none', color: settingsTab === item.tab ? 'white' : 'rgba(255,255,255,0.7)', cursor: 'pointer', marginBottom: '4px' }}>
                  <item.icon size={18} /><span style={{ fontSize: '14px' }}>{item.label}</span>
                </button>
              ))}
            </div>
            
            <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
              {settingsTab === 'account' && currentUser && (
                <div>
                  <h3 style={{ color: 'white', marginBottom: '20px' }}>Account Information</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>
                        {currentUser.profileImage ? <img src={currentUser.profileImage} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : currentUser.avatar}
                      </div>
                      <label style={{ position: 'absolute', bottom: 0, right: 0, background: '#7c9cff', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}>
                        <Camera size={16} color="white" />
                        <input type="file" accept="image/*" onChange={handleProfilePictureUpload} style={{ display: 'none' }} />
                      </label>
                    </div>
                    <div>
                      <h4 style={{ color: 'white', marginBottom: '4px' }}>{currentUser.name}</h4>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{currentUser.email}</p>
                    </div>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Name</label>
                    <input type="text" defaultValue={currentUser.name} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', outline: 'none' }} />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Username</label>
                    <input type="text" defaultValue={currentUser.username} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', outline: 'none' }} />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Bio</label>
                    <textarea rows={3} defaultValue={currentUser.bio} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', outline: 'none', resize: 'none' }} />
                  </div>
                  <button onClick={handleEditProfile} style={{ width: '100%', padding: '12px', borderRadius: '24px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', color: 'white', cursor: 'pointer' }}>Save Changes</button>
                </div>
              )}
              
              {settingsTab === 'appearance' && (
                <div>
                  <h3 style={{ color: 'white', marginBottom: '20px' }}>Appearance</h3>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Theme Style</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '8px' }}>
                      {Object.entries(themesList).map(([key, theme]) => (
                        <button key={key} onClick={() => setThemePreview(key)} style={{ padding: '12px', borderRadius: '16px', background: themePreview === key ? 'rgba(100,150,255,0.3)' : 'rgba(255,255,255,0.05)', border: themePreview === key ? '2px solid #7c9cff' : '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '20px' }}>{theme.icon}</span><span>{theme.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Custom Background</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', cursor: 'pointer', justifyContent: 'center' }}>
                      <Upload size={18} /><span>Upload Image</span>
                      <input type="file" accept="image/*" onChange={handleBackgroundUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
              )}
              
              {settingsTab === 'privacy' && (
                <div>
                  <h3 style={{ color: 'white', marginBottom: '20px' }}>Privacy Settings</h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', marginBottom: '12px' }}>
                    <div>
                      <div style={{ color: 'white' }}>Private Account</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Only people you approve can see your posts</div>
                    </div>
                    <button onClick={() => setPrivateAccount(!privateAccount)} style={{ width: '44px', height: '24px', borderRadius: '24px', background: privateAccount ? '#7c9cff' : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', position: 'relative' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: privateAccount ? '22px' : '2px', transition: 'left 0.2s' }} />
                    </button>
                  </div>
                  <button onClick={() => alert('Password change form')} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', marginBottom: '12px' }}>Change Password</button>
                  <button onClick={() => alert('Clear search history')} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>Clear Search History</button>
                </div>
              )}
              
              {settingsTab === 'safety' && (
                <div>
                  <h3 style={{ color: 'white', marginBottom: '20px' }}>Safety Controls</h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', marginBottom: '12px' }}>
                    <div>
                      <div style={{ color: 'white' }}>Hide Offensive Comments</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Automatically hide harmful comments</div>
                    </div>
                    <button onClick={() => updateSafetySetting('Hide Offensive Comments', true)} style={{ width: '44px', height: '24px', borderRadius: '24px', background: '#7c9cff', border: 'none', cursor: 'pointer' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', margin: '2px 22px' }} />
                    </button>
                  </div>
                  <button onClick={() => setShowSafetyModal(true)} style={{ width: '100%', padding: '12px', borderRadius: '24px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', marginTop: '12px' }}>
                    <Shield size={18} style={{ marginRight: '8px' }} /> Advanced Safety Settings
                  </button>
                </div>
              )}
              
              {settingsTab === 'help' && (
                <div>
                  <h3 style={{ color: 'white', marginBottom: '20px' }}>Help & Support</h3>
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', marginBottom: '12px', cursor: 'pointer' }} onClick={() => alert('Help Center - Coming Soon!')}>
                    <HelpCircle size={18} style={{ marginRight: '8px' }} /> Help Center
                  </div>
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', marginBottom: '12px', cursor: 'pointer' }} onClick={() => alert('Contact Support - support@inkoria.com')}>
                    <MessageCircle size={18} style={{ marginRight: '8px' }} /> Contact Support
                  </div>
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                    <Settings size={18} style={{ marginRight: '8px' }} /> About Inkoria
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>Version 2.0.0</div>
                  </div>
                </div>
              )}
              
              {settingsTab === 'logout' && (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <LogOut size={48} color="white" style={{ marginBottom: '20px' }} />
                  <h3 style={{ color: 'white', marginBottom: '12px' }}>Log Out?</h3>
                  <p style={{ marginBottom: '24px', color: 'rgba(255,255,255,0.6)' }}>Are you sure you want to log out of your account?</p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => setShowSettings(false)} style={{ flex: 1, padding: '12px', borderRadius: '24px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={() => supabase.auth.signOut()} style={{ flex: 1, padding: '12px', borderRadius: '24px', background: '#ff6b6b', border: 'none', color: 'white', cursor: 'pointer' }}>Log Out</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CreatePostModal = () => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowCreatePost(false)}>
      <div style={{ width: '90%', maxWidth: '500px', ...transparentStyle, padding: '24px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: 'white', margin: 0 }}>Create New Post</h2>
          <button onClick={() => setShowCreatePost(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="white" /></button>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <button onClick={() => setNewPostType('image')} style={{ flex: 1, padding: '8px', borderRadius: '12px', background: newPostType === 'image' ? 'rgba(100,150,255,0.3)' : 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer' }}><Image size={18} /> Photo</button>
          <button onClick={() => setNewPostType('video')} style={{ flex: 1, padding: '8px', borderRadius: '12px', background: newPostType === 'video' ? 'rgba(100,150,255,0.3)' : 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer' }}><VideoIcon size={18} /> Video</button>
        </div>
        
        {!newPostImage && !newPostVideo ? (
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', cursor: 'pointer', marginBottom: '16px' }}>
            {newPostType === 'image' ? <Camera size={48} color="white" /> : <VideoIcon size={48} color="white" />}
            <span style={{ color: 'white' }}>Tap to add {newPostType}</span>
            <input type="file" accept={newPostType === 'image' ? "image/*" : "video/*"} onChange={newPostType === 'image' ? handlePostImageUpload : handlePostVideoUpload} style={{ display: 'none' }} />
          </label>
        ) : (
          <div style={{ marginBottom: '16px' }}>
            {newPostImage && <img src={newPostImage} style={{ width: '100%', borderRadius: '16px', maxHeight: '300px', objectFit: 'cover' }} />}
            {newPostVideo && <video src={newPostVideo} controls style={{ width: '100%', borderRadius: '16px', maxHeight: '300px' }} />}
            <button onClick={() => { setNewPostImage(null); setNewPostVideo(null); }} style={{ marginTop: '8px', background: 'rgba(255,255,255,0.1)', border: 'none', padding: '8px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Change</button>
          </div>
        )}
        
        <textarea 
          placeholder="Write a caption..." 
          value={newPostCaption} 
          onChange={(e) => setNewPostCaption(e.target.value)} 
          rows={3} 
          style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', outline: 'none', marginBottom: '16px', resize: 'none' }} 
        />
        
        <button 
          onClick={handleCreatePost} 
          disabled={!newPostImage && !newPostVideo} 
          style={{ width: '100%', padding: '12px', borderRadius: '24px', background: (newPostImage || newPostVideo) ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: (newPostImage || newPostVideo) ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}
        >
          Share Post
        </button>
      </div>
    </div>
  );

  const GifPicker = ({ postId, onSelect }: { postId: number, onSelect: (gif: string) => void }) => (
    <div style={{ position: 'absolute', bottom: '50px', left: 0, right: 0, background: 'rgba(0,0,0,0.9)', borderRadius: '16px', padding: '12px', zIndex: 100 }}>
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {popularGifs.map((gif, i) => (
          <img key={i} src={gif} onClick={() => onSelect(gif)} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }} />
        ))}
      </div>
    </div>
  );

  const StoryViewer = () => {
    if (!showStoryViewer) return null;
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowStoryViewer(null)}>
        <div style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ width: '80vw', maxWidth: '400px', aspectRatio: '9/16', background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', position: 'relative' }}>
            {showStoryViewer.image ? <img src={showStoryViewer.image} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }} /> : <span style={{ fontSize: '64px' }}>{showStoryViewer.avatar}</span>}
            <div style={{ position: 'absolute', bottom: '16px', right: '16px', display: 'flex', gap: '12px' }}>
              <button onClick={() => likeStory(showStoryViewer.id)} style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '8px', border: 'none', cursor: 'pointer' }}><Heart size={20} color="white" /></button>
              <button onClick={() => viewStoryViewers(showStoryViewer)} style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '8px', border: 'none', cursor: 'pointer' }}><Eye size={20} color="white" /></button>
            </div>
          </div>
          <p style={{ color: 'white' }}>{showStoryViewer.username}</p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{showStoryViewer.time || 'Just now'}</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '12px' }}>
            <button onClick={() => likeStory(showStoryViewer.id)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>❤️ {showStoryViewer.likes?.length || 0}</button>
            <button onClick={() => viewStoryViewers(showStoryViewer)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>👁️ {showStoryViewer.viewers?.length || 0}</button>
          </div>
        </div>
      </div>
    );
  };

  // ============ PAGE COMPONENTS ============
  
  const HomePage = () => (
    <div style={{ paddingBottom: isMobile ? '70px' : '20px' }}>
      {/* Share your first story banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(100,150,255,0.1), rgba(100,150,255,0.05))',
        borderRadius: '16px',
        padding: '16px',
        margin: '12px',
        textAlign: 'center',
        border: '1px solid rgba(100,150,255,0.3)'
      }}>
        <p style={{ color: 'white', marginBottom: '12px' }}>
          ✨ Share your first story and get featured! ✨
        </p>
        <button
          onClick={() => setShowCreatePost(true)}
          style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            border: 'none',
            padding: '8px 20px',
            borderRadius: '24px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Write Now →
        </button>
      </div>
      
      {/* Stories */}
      <div style={{ ...transparentStyle, margin: '12px', padding: '12px', overflowX: 'auto', display: 'flex', gap: '12px' }}>
        {displayStories.map((story, index) => (
          <div key={index} onClick={() => story.isAdd ? document.getElementById('story-upload')?.click() : viewStory(stories.find(s => s.username === story.username))} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: story.isAdd ? 'linear-gradient(135deg, #667eea, #764ba2)' : story.viewed ? 'rgba(255,255,255,0.3)' : 'linear-gradient(135deg, #ff6b6b, #feca57)',
              padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                {story.isAdd ? '➕' : story.avatar}
              </div>
            </div>
            <span style={{ fontSize: '10px', color: 'white', textShadow: '0 0 5px rgba(0,0,0,0.5)' }}>{story.username}</span>
          </div>
        ))}
        <input id="story-upload" type="file" accept="image/*" onChange={handleCreateStory} style={{ display: 'none' }} />
      </div>
      
      {/* Create Post */}
      <div style={{ ...transparentStyle, margin: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setShowCreatePost(true)}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {currentUser?.profileImage ? <img src={currentUser.profileImage} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : (currentUser?.avatar || '🌙')}
        </div>
        <input 
          type="text" 
          placeholder="What's on your mind?" 
          style={{ 
            flex: 1, 
            background: 'rgba(255,255,255,0.1)', 
            border: 'none', 
            borderRadius: '24px', 
            padding: '10px 16px', 
            color: 'white', 
            fontSize: '14px', 
            outline: 'none', 
            cursor: 'pointer' 
          }} 
          readOnly 
          onClick={() => setShowCreatePost(true)}
        />
        <PlusSquare size={22} style={{ color: 'rgba(255,255,255,0.7)' }} />
      </div>
      
      {/* Posts */}
      {posts.map((post) => (
        <div key={post.id} style={{ ...transparentStyle, margin: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => { if (post.userId !== currentUser?.id) { setViewingUserId(post.userId); setActivePage('viewProfile'); } else { setActivePage('profile'); } }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                {post.userImage ? <img src={post.userImage} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : post.userAvatar}
              </div>
              <div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '13px' }}>{post.username}</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px' }}>•</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px' }}>{post.timeAgo}</span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>{post.location}</div>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowPostMenu(showPostMenu === post.id ? null : post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <MoreHorizontal size={18} style={{ color: 'white' }} />
              </button>
              {showPostMenu === post.id && (
                <div style={{ position: 'absolute', right: 0, top: '24px', background: 'rgba(20,20,40,0.95)', backdropFilter: 'blur(12px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', padding: '4px', zIndex: 50, minWidth: '160px' }}>
                  {currentUser && post.userId === currentUser.id && (
                    <>
                      <button onClick={() => { setEditingPost(post); setShowPostMenu(null); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 12px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px', fontSize: '13px' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <Edit2 size={14} /> Edit Post
                      </button>
                      <button onClick={async () => {
                        if (window.confirm('Delete this post permanently?')) {
                          await supabase.from('books').delete().eq('id', post.id);
                          setPosts(posts.filter(p => p.id !== post.id));
                          setShowPostMenu(null);
                        }
                      }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 12px', background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', borderRadius: '8px', fontSize: '13px' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,100,100,0.1)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <Trash2 size={14} /> Delete Post
                      </button>
                    </>
                  )}
                  {currentUser && post.userId !== currentUser.id && (
                    <>
                      <button onClick={() => { followUser(post.userId); setShowPostMenu(null); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 12px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px', fontSize: '13px' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <Users size={14} /> {(followedUsers as any[]).includes(post.userId) ? 'Unfollow' : 'Follow'}
                      </button>
                      <button onClick={() => { setSelectedChat(post.userId); setActivePage('messages'); setShowPostMenu(null); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 12px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px', fontSize: '13px' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <Send size={14} /> Send Message
                      </button>
                    </>
                  )}
                  <button onClick={() => { alert('Report submitted. Thank you!'); setShowPostMenu(null); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 12px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', borderRadius: '8px', fontSize: '13px' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <Flag size={14} /> Report
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {post.image && <div style={{ width: '100%', aspectRatio: '1 / 1', backgroundImage: `url(${post.image})`, backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'pointer' }} />}
          {post.video && <video src={post.video} controls style={{ width: '100%', maxHeight: '500px' }} />}
          
          <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={() => handleLike(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                {post.liked ? <Heart size={22} fill="#ff6b6b" color="#ff6b6b" /> : <Heart size={22} color="white" />}
              </button>
              <MessageCircle size={22} color="white" style={{ cursor: 'pointer' }} />
              <ShareButton postId={post.id} postTitle={post.caption.split('\n')[0]} />
              <WhatsAppShare postId={post.id} postTitle={post.caption.split('\n')[0]} />
            </div>
            <button onClick={() => handleSave(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              {post.saved ? <Bookmark size={22} fill="#feca57" color="#feca57" /> : <Bookmark size={22} color="white" />}
            </button>
          </div>
          
          <div style={{ padding: '0 12px' }}><span style={{ color: 'white', fontWeight: 'bold', fontSize: '13px' }}>{post.likes.toLocaleString()} likes</span></div>
          <div style={{ padding: '6px 12px' }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '13px' }}>{post.username}</span>
            <span style={{ color: 'white', fontSize: '13px', marginLeft: '6px' }}>{post.caption.split('\n')[0]}</span>
            <div style={{ color: '#a0c0ff', fontSize: '11px', marginTop: '4px' }}>{post.hashtags}</div>
          </div>
          
          {post.comments.length > 0 && (
            <div style={{ padding: '0 12px 10px 12px' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', cursor: 'pointer' }}>View all {post.comments.length} comments</span>
              <div style={{ marginTop: '6px' }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '12px' }}>{post.comments[0].username}</span>
                <span style={{ color: 'white', fontSize: '12px', marginLeft: '6px' }}>{post.comments[0].text}</span>
                {post.comments[0].gif && <img src={post.comments[0].gif} style={{ width: '100px', marginTop: '4px', borderRadius: '8px' }} />}
              </div>
            </div>
          )}
          
          {/* Featured Stories */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,215,0,0.05))',
            borderRadius: '16px',
            padding: '16px',
            margin: '12px',
            border: '1px solid rgba(255,215,0,0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Award size={20} color="#fbbf24" />
              <span style={{ color: 'white', fontWeight: 'bold' }}>Featured Stories</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {posts.slice(0, 2).map(featuredPost => (
                <div key={featuredPost.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '8px',
                    backgroundImage: featuredPost.image ? `url(${featuredPost.image})` : 'linear-gradient(135deg, #667eea, #764ba2)',
                    backgroundSize: 'cover'
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '13px' }}>{featuredPost.caption.substring(0, 40)}...</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>by {featuredPost.username}</div>
                  </div>
                  <button style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    background: 'rgba(255,215,0,0.2)',
                    border: '1px solid rgba(255,215,0,0.5)',
                    color: '#fbbf24',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}>Read</button>
                </div>
              ))}
            </div>
          </div>
          
          <CommentInput postId={post.id} onAddComment={handleAddComment} />
        </div>
      ))}
    </div>
  );

  const SearchPage = () => (
    <div style={{ padding: '12px' }}>
      <div style={{ ...transparentStyle, marginBottom: '16px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={20} style={{ color: 'rgba(255,255,255,0.6)' }} />
        <input type="text" placeholder="Search people, posts, hashtags..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '16px', outline: 'none' }} />
        {searchQuery && <X size={18} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }} onClick={() => setSearchQuery('')} />}
      </div>
      
      {searchQuery ? (
        <>
          {searchResults.users.filter(u => !u.isCurrentUser).length > 0 && (
            <div style={{ ...transparentStyle, marginBottom: '16px', padding: '16px' }}>
              <h3 style={{ color: 'white', marginBottom: '12px', fontSize: '14px' }}>👥 PEOPLE</h3>
              {searchResults.users.filter(u => !u.isCurrentUser).map(user => (
                <div key={user.id} onClick={() => { setViewingUserId(user.id); setActivePage('viewProfile'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '8px', cursor: 'pointer' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', overflow: 'hidden' }}>
                    {user.avatarUrl ? <img src={user.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div><span style={{ color: 'white', fontWeight: 'bold' }}>{user.name}</span>{user.verified && <CheckCircle size={12} color="#7c9cff" />}</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>{user.username} · {user.bio}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); (followedUsers as any[]).includes(user.id) ? unfollowUser(user.id) : followUser(user.id); }} style={{ padding: '6px 16px', borderRadius: '20px', background: (followedUsers as any[]).includes(user.id) ? 'rgba(100,150,255,0.3)' : 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer' }}>
                    {(followedUsers as any[]).includes(user.id) ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
          )}
          {searchResults.posts.length > 0 && (
            <div style={{ ...transparentStyle, padding: '16px' }}>
              <h3 style={{ color: 'white', marginBottom: '12px', fontSize: '14px' }}>📝 POSTS</h3>
              {searchResults.posts.map(post => (
                <div key={post.id} style={{ marginBottom: '12px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{post.userAvatar}</div>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>{post.username}</span>
                  </div>
                  <p style={{ color: 'white', fontSize: '13px' }}>{post.caption.split('\n')[0]}</p>
                  <div style={{ color: '#a0c0ff', fontSize: '11px' }}>{post.hashtags}</div>
                </div>
              ))}
            </div>
          )}
          {searchResults.users.filter(u => !u.isCurrentUser).length === 0 && searchResults.posts.length === 0 && (
            <div style={{ ...transparentStyle, padding: '40px', textAlign: 'center' }}><p style={{ color: 'rgba(255,255,255,0.6)' }}>No results found for "{searchQuery}"</p></div>
          )}
        </>
      ) : (
        <>
          <div style={{ ...transparentStyle, padding: '16px', marginBottom: '16px' }}>
            <h3 style={{ color: 'white', marginBottom: '12px', fontSize: '14px' }}>👥 PEOPLE ON INKORIA</h3>
            {allUsers.map(user => (
              <div key={user.id} onClick={() => { setViewingUserId(user.id); setActivePage('viewProfile'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '8px', cursor: 'pointer' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', overflow: 'hidden' }}>
                  {user.avatarUrl ? <img src={user.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div><span style={{ color: 'white', fontWeight: 'bold' }}>{user.name}</span></div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>{user.username} · {user.bio}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); (followedUsers as any[]).includes(user.id) ? unfollowUser(user.id) : followUser(user.id); }} style={{ padding: '6px 16px', borderRadius: '20px', background: (followedUsers as any[]).includes(user.id) ? 'rgba(100,150,255,0.3)' : 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '12px' }}>
                  {(followedUsers as any[]).includes(user.id) ? 'Following' : 'Follow'}
                </button>
              </div>
            ))}
            {allUsers.length === 0 && <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '20px' }}>No other users yet. Invite your friends!</p>}
          </div>
          <div style={{ ...transparentStyle, padding: '16px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
              {['#Nature', '#Writing', '#Stories', '#Magic', '#Adventure', '#Forest', '#Sunset', '#Travel'].map(tag => (
                <button key={tag} onClick={() => setSearchQuery(tag)} style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '12px' }}>{tag}</button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const MessagesPage = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: isMobile ? 'calc(100vh - 70px)' : 'auto', padding: '12px' }}>
      {!selectedChat ? (
        <div style={{ ...transparentStyle, padding: '16px' }}>
          <h3 style={{ color: 'white', marginBottom: '12px' }}>Messages</h3>
          <div style={{ marginBottom: '16px' }}>
            <button onClick={() => setShowGroupChat(1)} style={{ width: '100%', padding: '12px', borderRadius: '24px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <Users size={18} /> Create New Group
            </button>
          </div>
          {groups.map(group => (
            <div key={group.id} onClick={() => setShowGroupChat(group.id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '16px', marginBottom: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👥</div>
              <div style={{ flex: 1 }}>
                <span style={{ color: 'white', fontWeight: group.unread ? 'bold' : 'normal' }}>{group.name}</span>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{group.lastMessage}</div>
              </div>
            </div>
          ))}
          {conversations.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.5)' }}>
              <MessageCircle size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <p>No conversations yet</p>
              <p style={{ fontSize: '12px' }}>Search for people and start chatting!</p>
            </div>
          )}
          {conversations.map(conv => (
            <div key={conv.id} onClick={() => setSelectedChat(conv.id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '8px', cursor: 'pointer' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{conv.avatar}</div>
                {conv.online && <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '10px', height: '10px', borderRadius: '50%', background: '#4ade80', border: '2px solid #000' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div><span style={{ color: 'white', fontWeight: conv.unread ? 'bold' : 'normal' }}>{conv.name}</span><span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', float: 'right' }}>{conv.time}</span></div>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{conv.message}</span>
              </div>
              {conv.unread && <div style={{ width: '8px', height: '8px', background: '#7c9cff', borderRadius: '50%' }} />}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ ...transparentStyle, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ArrowLeft size={20} style={{ cursor: 'pointer', color: 'white' }} onClick={() => setSelectedChat('')} />
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{selectedChatName?.[0] || '?'}</div>
            <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => { setViewingUserId(selectedChat); setActivePage('viewProfile'); }}>
              <div style={{ color: 'white', fontWeight: 'bold' }}>{selectedChatName}</div>
              <div style={{ color: selectedChatUser?.online ? '#4ade80' : 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{selectedChatUser?.online ? 'Online' : 'Offline'}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => startCall('Audio')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}><Phone size={18} color="white" /></button>
              <button onClick={() => startCall('Video')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}><Video size={18} color="white" /></button>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {chatMessages.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender_id === currentUser?.id ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
                <div style={{ maxWidth: '75%', background: msg.sender_id === currentUser?.id ? 'rgba(100,150,255,0.4)' : 'rgba(255,255,255,0.15)', padding: '10px 14px', borderRadius: msg.sender_id === currentUser?.id ? '18px 18px 4px 18px' : '18px 18px 18px 4px', color: 'white' }}>
                  {msg.content}
                  {msg.media_url && (
                    <div style={{ marginTop: '8px' }}>
                      {msg.media_type === 'image' && <img src={msg.media_url} style={{ maxWidth: '200px', borderRadius: '8px' }} />}
                      {msg.media_type === 'video' && <video src={msg.media_url} controls style={{ maxWidth: '200px', borderRadius: '8px' }} />}
                      {msg.media_type === 'audio' && <audio src={msg.media_url} controls />}
                      {msg.media_type === 'file' && <a href={msg.media_url} target="_blank" style={{ color: '#a0c0ff' }}>📎 Download</a>}
                    </div>
                  )}
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {msg.sender_id === currentUser?.id && msg.is_read && <CheckCircle size={10} color="#4ade80" />}
                    {msg.sender_id === currentUser?.id && !msg.is_read && <Check size={10} color="rgba(255,255,255,0.5)" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      )}
    </div>
  );

  const NotificationsPage = () => (
    <div style={{ padding: '12px' }}>
      <div style={{ ...transparentStyle, padding: '16px' }}>
        <h3 style={{ color: 'white', marginBottom: '16px' }}>Notifications</h3>
        {notifications.map(notif => (
          <div key={notif.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: notif.read ? 'transparent' : 'rgba(100,150,255,0.1)', borderRadius: '12px', marginBottom: '8px', cursor: 'pointer' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{notif.user[0].toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <div><span style={{ color: 'white', fontWeight: 'bold' }}>{notif.user}</span> <span style={{ color: 'rgba(255,255,255,0.8)' }}>{notif.action}</span></div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '2px' }}>{notif.time}</div>
            </div>
            {notif.type === 'follow' && <button style={{ padding: '6px 16px', borderRadius: '20px', background: 'rgba(100,150,255,0.3)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '12px' }}>Follow Back</button>}
            {notif.type === 'like' && <Heart size={18} fill="#ff6b6b" color="#ff6b6b" />}
          </div>
        ))}
      </div>
    </div>
  );

  const ProfilePage = () => (
    <div style={{ padding: '12px' }}>
      <div style={{ ...transparentStyle, padding: '20px', textAlign: 'center', marginBottom: '12px' }}>
        <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 16px' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
            {currentUser?.profileImage ? <img src={currentUser.profileImage} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : (currentUser?.avatar || '🌙')}
          </div>
          <label style={{ position: 'absolute', bottom: 0, right: 0, background: '#7c9cff', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}>
            <Camera size={14} color="white" />
            <input type="file" accept="image/*" onChange={handleProfilePictureUpload} style={{ display: 'none' }} />
          </label>
        </div>
        <h2 style={{ color: 'white', marginBottom: '4px' }}>{currentUser?.name || 'User'}</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>{currentUser?.bio || '✨ Storyteller ✨'}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '16px', padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div><span style={{ color: 'white', fontWeight: 'bold' }}>{currentUser?.stories || 0}</span><span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', display: 'block' }}>Stories</span></div>
          <div><span style={{ color: 'white', fontWeight: 'bold' }}>{currentUser?.followers || 0}</span><span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', display: 'block' }}>Followers</span></div>
          <div><span style={{ color: 'white', fontWeight: 'bold' }}>{currentUser?.following || 0}</span><span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', display: 'block' }}>Following</span></div>
        </div>
        <button onClick={handleEditProfile} style={{ marginTop: '16px', padding: '10px 24px', borderRadius: '24px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', color: 'white', cursor: 'pointer' }}>Edit Profile</button>
      </div>
      <div style={{ ...transparentStyle, padding: '16px' }}>
        <h3 style={{ color: 'white', marginBottom: '12px' }}>My Stories</h3>
        {posts.filter(p => currentUser && p.userId === currentUser.id).slice(0, 2).map(post => (
          <div key={post.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '8px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '8px', backgroundImage: `url(${post.image})`, backgroundSize: 'cover' }} />
            <div><div style={{ color: 'white', fontWeight: 'bold', fontSize: '13px' }}>{post.caption.split('\n')[0].substring(0, 30)}...</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{post.likes} likes • {post.comments.length} comments</div></div>
          </div>
        ))}
      </div>
    </div>
  );

  // ============ NAVIGATION COMPONENTS ============
  
  const MobileNav = () => (
    <div style={{ 
      position: 'fixed', 
      bottom: 0, 
      left: 0, 
      right: 0, 
      background: 'rgba(0, 0, 0, 0.2)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '20px',
      display: 'flex', 
      justifyContent: 'space-around', 
      padding: '10px 16px', 
      margin: '0 12px 12px 12px', 
      zIndex: 20 
    }}>
      <button onClick={() => { setActivePage('home'); setSelectedChat(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <Home size={24} color={activePage === 'home' ? '#a0c0ff' : 'white'} />
      </button>
      <button onClick={() => { setActivePage('search'); setSelectedChat(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <Search size={24} color={activePage === 'search' ? '#a0c0ff' : 'white'} />
      </button>
      <button onClick={() => setShowCreatePost(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <PlusSquare size={24} color="white" />
      </button>
      <button onClick={() => { setActivePage('messages'); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <MessageCircle size={24} color={activePage === 'messages' ? '#a0c0ff' : 'white'} />
      </button>
      <button onClick={() => { setActivePage('profile'); setSelectedChat(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <User size={24} color={activePage === 'profile' ? '#a0c0ff' : 'white'} />
      </button>
    </div>
  );

  const DesktopSidebar = () => (
    <div style={{ 
      width: '260px', 
      position: 'sticky', 
      top: 12, 
      height: 'calc(100vh - 24px)', 
      background: 'rgba(0, 0, 0, 0.2)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '20px',
      padding: '16px', 
      overflowY: 'auto' 
    }}>
      <h1 style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        background: 'linear-gradient(135deg, #f0e6ff, #b8c8ff)', 
        WebkitBackgroundClip: 'text', 
        backgroundClip: 'text', 
        color: 'transparent', 
        marginBottom: '24px' 
      }}>Inkoria</h1>
      
      {[
        { icon: Home, label: 'Home', page: 'home' },
        { icon: Search, label: 'Search', page: 'search' },
        { icon: PlusSquare, label: 'Create', page: 'create', action: () => setShowCreatePost(true) },
        { icon: MessageCircle, label: 'Messages', page: 'messages', badge: '2' },
        { icon: Heart, label: 'Notifications', page: 'notifications', badge: notifications.filter(n => !n.read).length.toString() },
        { icon: User, label: 'Profile', page: 'profile' },
        { icon: Save, label: 'Drafts', page: 'drafts', action: () => setShowDrafts(true) },
      ].map((item, i) => (
        <button 
          key={i} 
          onClick={() => { if (item.action) item.action(); else { setActivePage(item.page); setSelectedChat(''); } }} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            padding: '10px', 
            borderRadius: '12px', 
            background: activePage === item.page ? 'rgba(100,150,255,0.2)' : 'transparent', 
            border: 'none', 
            color: activePage === item.page ? 'white' : 'rgba(255,255,255,0.7)', 
            cursor: 'pointer', 
            width: '100%', 
            marginBottom: '4px' 
          }}
        >
          <item.icon size={20} />
          <span>{item.label}</span>
          {item.badge && <span style={{ marginLeft: 'auto', background: '#ff6b6b', padding: '2px 6px', borderRadius: '12px', fontSize: '10px' }}>{item.badge}</span>}
        </button>
      ))}
      
      <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
        <button 
          onClick={() => setShowNotifications(true)} 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px',
            borderRadius: '12px',
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            width: '100%',
            position: 'relative',
            marginBottom: '8px'
          }}
        >
          <Bell size={20} />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              right: '10px',
              background: '#ff6b6b',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px'
            }}>
              {unreadCount}
            </span>
          )}
        </button>
        
        <button 
          onClick={() => setShowSoundSettings(true)} 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px',
            borderRadius: '12px',
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            width: '100%',
            marginBottom: '8px'
          }}
        >
          <Volume2 size={20} />
          <span>Notification Sounds</span>
        </button>
        
        <button 
          onClick={() => setShowSettings(true)} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            padding: '10px', 
            width: '100%', 
            background: 'transparent', 
            border: 'none', 
            color: 'white', 
            cursor: 'pointer',
            marginBottom: '8px'
          }}
        >
          <Settings size={20} /> 
          <span>Settings</span>
        </button>
        
        <button 
          onClick={() => supabase.auth.signOut()} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            padding: '10px', 
            width: '100%', 
            background: 'transparent', 
            border: 'none', 
            color: 'white', 
            cursor: 'pointer', 
            marginTop: '8px' 
          }}
        >
          <LogOut size={20} /> 
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  const DesktopMessages = () => (
    <div style={{ 
      width: '320px', 
      position: 'sticky', 
      top: 12, 
      height: 'calc(100vh - 24px)', 
      background: 'rgba(0, 0, 0, 0.2)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '20px',
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden' 
    }}>
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ color: 'white', marginBottom: '12px' }}>Messages</h3>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
          <input type="text" placeholder="Search conversations..." style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '24px', padding: '8px 12px 8px 36px', color: 'white', outline: 'none' }} />
        </div>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {conversations.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.5)' }}>
            <p style={{ fontSize: '12px' }}>No conversations yet</p>
          </div>
        )}
        {conversations.map((conv) => (
          <div 
            key={conv.id} 
            onClick={() => { setSelectedChat(conv.id); setActivePage('messages'); }} 
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '12px', cursor: 'pointer', background: selectedChat === conv.id ? 'rgba(100,150,255,0.2)' : 'transparent', marginBottom: '8px' }}
          >
            <div style={{ position: 'relative' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{conv.avatar}</div>
              {conv.online && <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '10px', height: '10px', borderRadius: '50%', background: '#4ade80', border: '2px solid #000' }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div>
                <span style={{ color: 'white', fontWeight: conv.unread ? 'bold' : 'normal', fontSize: '13px' }}>{conv.name}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', float: 'right' }}>{conv.time}</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>{conv.message}</span>
            </div>
            {conv.unread && <div style={{ width: '8px', height: '8px', background: '#7c9cff', borderRadius: '50%' }} />}
          </div>
        ))}
      </div>
      
      {selectedChat && activePage === 'messages' && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => { setViewingUserId(selectedChat); setActivePage('viewProfile'); }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{selectedChatName?.[0] || '?'}</div>
              <div>
                <div style={{ color: 'white', fontWeight: 'bold', fontSize: '13px' }}>{selectedChatName}</div>
                <div style={{ color: selectedChatUser?.online ? '#4ade80' : 'rgba(255,255,255,0.5)', fontSize: '9px' }}>{selectedChatUser?.online ? 'Online' : 'Offline'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => startCall('Audio')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Phone size={14} color="white" /></button>
              <button onClick={() => startCall('Video')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Video size={14} color="white" /></button>
            </div>
          </div>
          <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '10px' }}>
            {chatMessages.slice(-3).map((msg) => (
              <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender_id === currentUser?.id ? 'flex-end' : 'flex-start', marginBottom: '6px' }}>
                <div style={{ maxWidth: '85%', background: msg.sender_id === currentUser?.id ? 'rgba(100,150,255,0.3)' : 'rgba(255,255,255,0.1)', padding: '6px 10px', borderRadius: '12px', fontSize: '12px', color: 'white' }}>{msg.content}</div>
              </div>
            ))}
          </div>
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      )}
    </div>
  );

  const UserProfileView = () => {
    const [profileUser, setProfileUser] = useState<any>(null);
    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    useEffect(() => {
      if (!viewingUserId) return;
      const load = async () => {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', viewingUserId).single();
        setProfileUser(profile);
        const { data: books } = await supabase.from('books').select('*').eq('author_id', viewingUserId).eq('is_published', true).order('created_at', { ascending: false });
        setUserPosts(books || []);
        const { count: fc } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', viewingUserId);
        const { count: fgc } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', viewingUserId);
        setFollowerCount(fc || 0);
        setFollowingCount(fgc || 0);
      };
      load();
    }, [viewingUserId]);

    if (!profileUser) return <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>Loading...</div>;
    const isFollowing = (followedUsers as any[]).includes(viewingUserId);

    return (
      <div style={{ padding: '12px', paddingBottom: isMobile ? '80px' : '20px' }}>
        <div style={{ ...transparentStyle, padding: '24px', marginBottom: '16px', position: 'relative' }}>
          <button onClick={() => setActivePage('home')} style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}>
            <ArrowLeft size={20} color="white" />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', margin: '0 auto 12px', overflow: 'hidden' }}>
              {profileUser.avatar_url ? <img src={profileUser.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (profileUser.display_name?.[0]?.toUpperCase() || '👤')}
            </div>
            <h2 style={{ color: 'white', margin: '0 0 4px 0' }}>{profileUser.display_name || profileUser.username || 'User'}</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 8px 0', fontSize: '14px' }}>@{profileUser.username || viewingUserId?.substring(0, 8)}</p>
            {profileUser.bio && <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 16px 0', fontSize: '13px' }}>{profileUser.bio}</p>}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '16px' }}>
              <div style={{ textAlign: 'center' }}><div style={{ color: 'white', fontWeight: 'bold' }}>{userPosts.length}</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Posts</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ color: 'white', fontWeight: 'bold' }}>{followerCount}</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Followers</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ color: 'white', fontWeight: 'bold' }}>{followingCount}</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Following</div></div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => isFollowing ? unfollowUser(viewingUserId!) : followUser(viewingUserId!)} style={{ padding: '10px 24px', borderRadius: '24px', background: isFollowing ? 'rgba(100,150,255,0.3)' : 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button onClick={() => { setSelectedChat(viewingUserId!); setActivePage('messages'); }} style={{ padding: '10px 24px', borderRadius: '24px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', cursor: 'pointer' }}>
                Message
              </button>
            </div>
          </div>
        </div>
        <div style={{ ...transparentStyle, padding: '16px' }}>
          <h3 style={{ color: 'white', marginBottom: '12px' }}>Posts ({userPosts.length})</h3>
          {userPosts.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
              {userPosts.map(post => (
                <div key={post.id} style={{ aspectRatio: '1', backgroundImage: post.cover_image_url ? `url(${post.cover_image_url})` : 'linear-gradient(135deg, #667eea, #764ba2)', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px', display: 'flex', alignItems: 'flex-end', padding: '6px' }}>
                  <span style={{ color: 'white', fontSize: '10px', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{post.title?.substring(0, 20)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '20px' }}>No posts yet</p>
          )}
        </div>
      </div>
    );
  };

  const renderPage = () => {
    switch(activePage) {
      case 'home': return <HomePage />;
      case 'search': return <SearchPage />;
      case 'messages': return <MessagesPage />;
      case 'notifications': return <NotificationsPage />;
      case 'profile': return <ProfilePage />;
      case 'viewProfile': return <UserProfileView />;
      default: return <HomePage />;
    }
  };

  // ============ LOADING SCREEN ============
  if (loadingUser) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a472a, #0a2a1a)',
        color: 'white'
      }}>
        Loading your profile...
      </div>
    );
  }

  // ============ MAIN RETURN ============
  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.25)', zIndex: 1 }} />
      {activeCall && <VideoCall roomUrl={activeCall.url} isAudioOnly={activeCall.isAudioOnly} onLeave={() => setActiveCall(null)} />}
      {incomingCall && (
        <IncomingCallModal
          callerName={incomingCall.callerName}
          callerAvatar={incomingCall.callerAvatar}
          callType={incomingCall.callType}
          onAccept={() => {
            const call = acceptCall();
            if (call) {
              setActiveCall({ url: call.roomUrl, isAudioOnly: call.callType === "audio" });
            }
          }}
          onDecline={declineCall}
        />
      )}
      
      {showSettings && <SettingsModal />}
      {showOnboarding && <OnboardingTour onComplete={() => setShowOnboarding(false)} />}
      {showCreatePost && <CreatePostModal />}
      {showStoryViewer && <StoryViewer />}
      {showStoryViewers && <StoryViewersModal />}
      {showSafetyModal && <SafetyModal />}
      {showGroupChat && <GroupChat groupId={showGroupChat} onClose={() => setShowGroupChat(null)} />}
      {editingPost && <EditPostModal />}
      {showSoundSettings && <SoundSettings onClose={() => setShowSoundSettings(false)} />}
      {showThoughtStream && <ThoughtStream onClose={() => setShowThoughtStream(false)} />}
      {showNotifications && (
        <NotificationModal
          notifications={notifications}
          unreadCount={unreadCount}
          onClose={() => setShowNotifications(false)}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
        />
      )}
      {showDrafts && <Drafts onClose={() => setShowDrafts(false)} />}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '70px',
          right: '20px',
          background: 'linear-gradient(135deg, #1a472a, #0a2a1a)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 3000,
          animation: 'slideIn 0.3s ease'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🔔 {toast.title}</div>
          <div style={{ fontSize: '12px' }}>{toast.message}</div>
        </div>
      )}
      
      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid #7c9cff',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
        </div>
      )}
      
      {/* Floating Action Button - Thought Drop */}
      <button
        onClick={() => setShowThoughtStream(true)}
        style={{
          position: 'fixed',
          bottom: isMobile ? '80px' : '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          zIndex: 100,
          transition: 'all 0.3s ease',
          animation: 'float 2s ease-in-out infinite'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <Sparkles size={28} color="white" />
      </button>

      <div style={{ position: 'relative', zIndex: 10 }}>
        {isMobile ? (
          <>
            {renderPage()}
            <MobileNav />
          </>
        ) : (
          <div style={{ display: 'flex', gap: '12px', padding: '12px' }}>
            <DesktopSidebar />
            <div style={{ flex: 1, maxWidth: '600px', margin: '0 auto' }}>{renderPage()}</div>
            <DesktopMessages />
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};

export default ForestLayout;