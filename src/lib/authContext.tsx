'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  loginTime: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const storedUser = localStorage.getItem('chatbot_user');
      return storedUser ? (JSON.parse(storedUser) as User) : null;
    } catch (error) {
      try {
        localStorage.removeItem('chatbot_user');
      } catch {}
      return null;
    }
  });

  const [isLoading, _setIsLoading] = useState(false);

  const login = (email: string, password: string): boolean => {
    // Simple validation - in production, this would be a real backend call
    if (!email || !password) {
      return false;
    }

    // Basic email/phone validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/; // Simple 10-digit phone validation

    const isValidEmail = emailRegex.test(email);
    const isValidPhone = phoneRegex.test(email.replace(/\D/g, ''));
    const isValidPassword = password.length >= 4;

    if ((!isValidEmail && !isValidPhone) || !isValidPassword) {
      return false;
    }

    // Create user object
    const newUser: User = {
      id: Date.now().toString(),
      name: email.split('@')[0] || 'User',
      email: email,
      loginTime: new Date().toLocaleString(),
    };

    // Save to localStorage
    localStorage.setItem('chatbot_user', JSON.stringify(newUser));
    setUser(newUser);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('chatbot_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
