import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
const API_URL = 'http://localhost:5005/auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.message || 'Login failed');
      if (data.code === 'UNVERIFIED') error.code = 'UNVERIFIED';
      throw error;
    }

    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('authtoken', data.token);
    setUser(data.user);
    return data;
  };

  const register = async (payload) => {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Registration failed');
    return data; 
  };

  const verifyEmail = async (payload) => {
    const response = await fetch(`${API_URL}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Verification failed');

    // THIS IS THE FIX: Save the user and token just like login() does
    if (data.user && data.token) {
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('authtoken', data.token);
      setUser(data.user);
    }

    return data;
  };

  const resendCode = async (email) => {
    const response = await fetch(`${API_URL}/resend-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to resend code');
    return data;
  };

  const forgotPassword = async (email) => {
    const response = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to send reset code');
    return data;
  };

  const resetPassword = async (payload) => {
    const response = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to reset password');
    return data;
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authtoken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, login, register, verifyEmail, resendCode, forgotPassword, resetPassword, logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}