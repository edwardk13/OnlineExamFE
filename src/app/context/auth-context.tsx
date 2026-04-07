import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export { api };

interface User {
  id: string | number;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  mssv?: string;
  class?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    const interceptor = api.interceptors.request.use((config: any) => {
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${currentToken}`,
        };
      }
      return config;
    }, (error: any) => Promise.reject(error));

    setLoading(false);

    return () => api.interceptors.request.eject(interceptor);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/login', { email, password });
      const accessToken = response.data?.access_token ?? response.data?.token;
      const userData = response.data?.user;

      if (!accessToken || !userData) {
        return false;
      }

      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      return true;
    } catch (error) {
      console.warn("Backend không phản hồi hoặc sai tài khoản thật. Thử Demo Account...");
      
      // let demoUser = null;
      // if (email === DEMO_ACCOUNTS.student.email && password === DEMO_ACCOUNTS.student.password) demoUser = DEMO_ACCOUNTS.student.user;
      // else if (email === DEMO_ACCOUNTS.teacher.email && password === DEMO_ACCOUNTS.teacher.password) demoUser = DEMO_ACCOUNTS.teacher.user;
      // else if (email === DEMO_ACCOUNTS.admin.email && password === DEMO_ACCOUNTS.admin.password) demoUser = DEMO_ACCOUNTS.admin.user;

      // if (demoUser) {
      //   setUser(demoUser);
      //   localStorage.setItem('token', `demo-token-${demoUser.role}`);
      //   localStorage.setItem('user', JSON.stringify(demoUser));
      //   return true;
      // }
      return false;
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('token');
    if (token && !token.startsWith('demo-token')) {
      try {
        await api.post('/logout');
      } catch (e) {
        console.error('Lỗi đăng xuất API', e);
      }
    }
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}