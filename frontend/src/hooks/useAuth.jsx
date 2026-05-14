import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('forsati_token');
    const savedUser = localStorage.getItem('forsati_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Optionally verify token
      authAPI.getMe()
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('forsati_token');
          localStorage.removeItem('forsati_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('forsati_token', token);
    localStorage.setItem('forsati_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('forsati_token');
    localStorage.removeItem('forsati_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
