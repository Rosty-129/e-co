
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const API_URL = 'https://e-co-plao.vercel.app/auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  // LOGIN
  const login = async (email, password, turnstileToken) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        turnstileToken
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'Login failed');

      if (data.code === 'UNVERIFIED') {
        error.code = 'UNVERIFIED';
      }

      throw error;
    }

    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('authtoken', data.token);

    setUser(data.user);

    return data;
  };

  // REGISTER
  const register = async (payload) => {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  };

  // VERIFY EMAIL
  const verifyEmail = async (payload) => {
    const response = await fetch(`${API_URL}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Verification failed');
    }

    if (data.user && data.token) {
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('authtoken', data.token);

      setUser(data.user);
    }

    return data;
  };

  // RESEND VERIFICATION CODE
  const resendCode = async (email) => {
    const response = await fetch(`${API_URL}/resend-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to resend code');
    }

    return data;
  };

  // FORGOT PASSWORD
  const forgotPassword = async (email, turnstileToken) => {
    const response = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        turnstileToken
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send reset code');
    }

    return data;
  };

  // RESET PASSWORD
  const resetPassword = async (payload) => {
    const response = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset password');
    }

    return data;
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authtoken');

    setUser(null);
  };

  // UPDATE USER
  const updateUser = (partial) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...partial };

      localStorage.setItem('user', JSON.stringify(next));

      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        verifyEmail,
        resendCode,
        forgotPassword,
        resetPassword,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
