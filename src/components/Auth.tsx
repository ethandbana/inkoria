import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Eye, EyeOff, LogOut } from 'lucide-react';

export default function AuthComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Check if user is already logged in
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      if (error) setMessage(error.message);
      else setMessage('Check your email for confirmation!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
    setMessage('Signed out successfully');
  };

  // If logged in, show profile view
  if (isLoggedIn && user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a472a, #0a2a1a)'
      }}>
        <div style={{
          maxWidth: '400px',
          width: '90%',
          padding: '32px',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(20px)',
          borderRadius: '32px',
          border: '1px solid rgba(255,255,255,0.2)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            margin: '0 auto 16px'
          }}>
            {user.email?.[0].toUpperCase() || '👤'}
          </div>
          <h2 style={{ color: 'white', marginBottom: '8px' }}>Welcome back!</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>{user.email}</p>
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '24px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Show login/signup form
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a472a, #0a2a1a)'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '90%',
        padding: '32px',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(20px)',
        borderRadius: '32px',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '8px', fontSize: '28px' }}>✨ Inkoria ✨</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: '24px', fontSize: '14px' }}>
          {isSignUp ? 'Join the community of storytellers' : 'Welcome back!'}
        </p>
        
        {message && (
          <div style={{
            background: message.includes('Check') ? 'rgba(76,175,80,0.2)' : 'rgba(255,100,100,0.2)',
            border: `1px solid ${message.includes('Check') ? '#4caf50' : '#ff6b6b'}`,
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '20px',
            color: 'white',
            textAlign: 'center',
            fontSize: '13px'
          }}>
            {message}
          </div>
        )}
        
        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '12px',
            borderRadius: '24px',
            background: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500',
            color: '#333',
            marginBottom: '16px'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>
        
        <div style={{ textAlign: 'center', marginBottom: '20px', position: 'relative' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(0,0,0,0.4)', padding: '0 10px', fontSize: '12px' }}>or continue with email</span>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px', position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                outline: 'none',
                fontSize: '14px'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '20px', position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                outline: 'none',
                fontSize: '14px'
              }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {showPassword ? <EyeOff size={18} color="rgba(255,255,255,0.5)" /> : <Eye size={18} color="rgba(255,255,255,0.5)" />}
            </button>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              color: 'white',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginBottom: '12px',
              fontSize: '14px'
            }}
          >
            {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
          
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '24px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Create new account'}
          </button>
        </form>
      </div>
    </div>
  );
}