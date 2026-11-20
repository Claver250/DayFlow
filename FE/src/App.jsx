import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Welcome from './pages/Welcome';
import AuthPage from './pages/AuthPages';
import Workspace from './pages/Workspace';
import FullPageLoader from './components/FullPageLoader';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  return user ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  return user ? <Navigate to="/app" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<GuestOnly><Welcome /></GuestOnly>} />
            <Route path="/login" element={<GuestOnly><AuthPage mode="login" /></GuestOnly>} />
            <Route path="/signup" element={<GuestOnly><AuthPage mode="signup" /></GuestOnly>} />
            {/* Google lands here; AuthProvider has already restored the session from the cookie */}
            <Route path="/auth/success" element={<Protected><Navigate to="/app" replace /></Protected>} />
            <Route path="/app" element={<Protected><Workspace /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
