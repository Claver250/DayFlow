import { createContext, useContext, useEffect, useState } from 'react';
import api, { refreshAccessToken, setAccessToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On every page load (and after Google login): restore the session from the refresh cookie
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refreshAccessToken();
        const { data } = await api.get('/auth/me');
        if (!cancelled) setUser(data);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    const onLogout = () => setUser(null);
    window.addEventListener('auth:logout', onLogout);
    return () => {
      cancelled = true;
      window.removeEventListener('auth:logout', onLogout);
    };
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
  };

  // Creates the account only; the user logs in on the next screen
  const signup = async (name, email, password) => {
    await api.post('/auth/signup', { name, email, password });
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  const loginWithGoogle = () => {
    window.location.href = '/api/v1/auth/google'; // full page redirect, not fetch
  };

  // Update fields locally, e.g. after the email is verified
  const updateUser = (changes) => setUser((u) => (u ? { ...u, ...changes } : u));

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, loginWithGoogle, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
