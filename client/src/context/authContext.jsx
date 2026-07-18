import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { AUTH_ENDPOINTS } from '../utils/apiPaths';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await axiosInstance.get(AUTH_ENDPOINTS.PROFILE);
        if (res.data && res.data.success) {
          setUser(res.data.data);
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching user profile', err);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN, { email, password });
      if (res.data && res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser({
          _id: res.data._id,
          username: res.data.username,
          email: res.data.email
        });
        return { success: true };
      }
      return { success: false, message: 'Invalid credentials' };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check your credentials.'
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await axiosInstance.post(AUTH_ENDPOINTS.REGISTER, { username, email, password });
      if (res.data && res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser({
          _id: res.data._id,
          username: res.data.username,
          email: res.data.email
        });
        return { success: true };
      }
      return { success: false, message: 'Registration failed' };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed. Try again.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
