import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Configure axios to send Bearer token automatically if it exists
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Load user profile if token is present
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await axios.get('/api/auth/me');
          setUser(res.data);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          // Token might have expired or user suspended
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  // Sync Dark/Light theme class to root html element
  useEffect(() => {
    if (user?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user?.theme]);

  const login = async (emailOrUserData, password) => {
    if (typeof emailOrUserData === 'object') {
      // Direct payload state update from settings/upgrade forms
      const { token: userToken, ...userData } = emailOrUserData;
      if (userToken) setToken(userToken);
      setUser(userData);
      return { success: true };
    }

    try {
      const res = await axios.post('/api/auth/login', { email: emailOrUserData, password });
      const { token: userToken, ...userData } = res.data;
      setToken(userToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const loginWithGoogle = async (credential, accessToken) => {
    try {
      const res = await axios.post('/api/auth/google', { credential, accessToken });
      const { token: userToken, ...userData } = res.data;
      setToken(userToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Google login failed'
      };
    }
  };


  const register = async (name, email, password, mobile) => {
    try {
      const res = await axios.post('/api/auth/register', { name, email, password, mobile });
      const { token: userToken, ...userData } = res.data;
      setToken(userToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const updateMobile = async (mobile) => {
    try {
      const res = await axios.put('/api/auth/mobile', { mobile });
      setUser(prev => ({ ...prev, mobile: res.data.mobile }));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update mobile'
      };
    }
  };

  const updateBudget = async (monthlyBudgetLimit) => {
    try {
      const res = await axios.put('/api/auth/budget', { monthlyBudgetLimit });
      setUser(prev => ({ ...prev, monthlyBudgetLimit: res.data.monthlyBudgetLimit }));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update budget limit'
      };
    }
  };

  const updateUserOrg = async (userId, org) => {
    // Admin operation
    try {
      const res = await axios.put(`/api/admin/users/${userId}/org`, { org });
      if (user && user._id === userId) {
        setUser(prev => ({ ...prev, org: res.data.org }));
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update organization'
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithGoogle, register, logout, updateMobile, updateBudget, updateUserOrg }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
