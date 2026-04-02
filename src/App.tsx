import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AuthComponent from './components/Auth';
import ForestLayout from './pages/ForestLayout';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a472a, #0a2a1a)',
        color: 'white'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={!user ? <AuthComponent /> : <Navigate to="/" />} />
          <Route path="/*" element={user ? <ForestLayout /> : <Navigate to="/auth" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;