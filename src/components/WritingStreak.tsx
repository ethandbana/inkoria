import React, { useState, useEffect } from 'react';
import { Flame, Calendar, Award } from 'lucide-react';

export const WritingStreak = ({ userId }: { userId: number }) => {
  const [streak, setStreak] = useState(0);
  const [lastWritten, setLastWritten] = useState<string | null>(null);

  useEffect(() => {
    // Load streak from localStorage
    const savedStreak = localStorage.getItem(`streak_${userId}`);
    const savedDate = localStorage.getItem(`last_written_${userId}`);
    
    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedDate) setLastWritten(savedDate);
    
    // Check if user wrote today
    const today = new Date().toDateString();
    if (savedDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (savedDate === yesterday.toDateString()) {
        // Streak continues
      } else {
        // Streak broken
        setStreak(0);
        localStorage.setItem(`streak_${userId}`, '0');
      }
    }
  }, [userId]);

  const updateStreak = () => {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem(`last_written_${userId}`);
    
    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastDate === yesterday.toDateString() || !lastDate) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem(`streak_${userId}`, newStreak.toString());
      }
      localStorage.setItem(`last_written_${userId}`, today);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,100,100,0.1), rgba(255,100,100,0.05))',
      borderRadius: '16px',
      padding: '12px 16px',
      margin: '12px',
      border: '1px solid rgba(255,100,100,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Flame size={24} color="#ff6b6b" />
        <div>
          <div style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>{streak} days</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Writing streak</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Calendar size={16} color="rgba(255,255,255,0.5)" />
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
          {streak >= 7 && <Award size={16} color="#fbbf24" style={{ marginRight: '4px' }} />}
          {streak >= 7 ? '🔥 On fire!' : 'Write daily to build streak'}
        </span>
      </div>
    </div>
  );
};