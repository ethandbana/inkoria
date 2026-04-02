import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const steps = [
  {
    title: "Welcome to Inkoria! 🌟",
    description: "A place where stories come to life. Let's show you around!",
    target: "center"
  },
  {
    title: "Create Your Story 📝",
    description: "Tap the + button to write and share your stories with the world.",
    target: "create"
  },
  {
    title: "Discover Stories 📖",
    description: "Scroll through your feed to find amazing stories from other writers.",
    target: "feed"
  },
  {
    title: "Connect with Writers 💬",
    description: "Like, comment, and share stories. Join group chats to discuss ideas!",
    target: "chat"
  },
  {
    title: "You're Ready! 🎉",
    description: "Start writing your first story and become part of our community!",
    target: "center"
  }
];

export const OnboardingTour = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('onboarding_complete');
    if (hasSeenTour) {
      setIsVisible(false);
      onComplete();
    }
  }, [onComplete]);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('onboarding_complete', 'true');
      setIsVisible(false);
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_complete', 'true');
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      zIndex: 3000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        maxWidth: '320px',
        background: 'linear-gradient(135deg, #1a472a, #0a2a1a)',
        borderRadius: '24px',
        padding: '32px 24px',
        textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.2)',
        animation: 'fadeInUp 0.3s ease'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          {step === 0 && '✨'}
          {step === 1 && '📝'}
          {step === 2 && '📖'}
          {step === 3 && '💬'}
          {step === 4 && '🎉'}
        </div>
        
        <h2 style={{ color: 'white', marginBottom: '12px', fontSize: '24px' }}>
          {steps[step].title}
        </h2>
        
        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '24px', fontSize: '14px', lineHeight: '1.5' }}>
          {steps[step].description}
        </p>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: i === step ? '#7c9cff' : 'rgba(255,255,255,0.3)',
              transition: 'all 0.3s'
            }} />
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSkip}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '24px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {step === steps.length - 1 ? 'Get Started' : 'Next'}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};