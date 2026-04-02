import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { showLocalNotification, requestNotificationPermission } from '../services/firebase';

export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Request permission (optional)
    requestNotificationPermission().catch(console.error);

    fetchNotifications();

    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          const newNotif = payload.new;
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, [userId]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    setNotifications(data || []);
    setUnreadCount(data?.filter(n => !n.is_read).length || 0);
  };

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
    
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const createNotification = async (userId: string, title: string, content: string, type: string, entityId?: string) => {
    await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        title,
        content,
        type,
        entity_id: entityId,
        is_read: false
      }]);
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead, createNotification };
};