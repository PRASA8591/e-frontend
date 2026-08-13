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

  const applyThemeClass = (themeName) => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-forest', 'theme-nordic', 'theme-cyberpunk');
    
    if (themeName === 'dark') {
      root.classList.add('dark');
    } else if (themeName === 'forest') {
      root.classList.add('dark', 'theme-forest');
    } else if (themeName === 'nordic') {
      root.classList.add('dark', 'theme-nordic');
    } else if (themeName === 'cyberpunk') {
      root.classList.add('dark', 'theme-cyberpunk');
    }
  };

  // Sync Dark/Light theme class to root html element
  useEffect(() => {
    if (user?.theme) {
      applyThemeClass(user.theme);
      localStorage.setItem('theme', user.theme);
    } else {
      const cached = localStorage.getItem('theme') || 'light';
      applyThemeClass(cached);
    }
  }, [user?.theme]);

  useEffect(() => {
    const cached = localStorage.getItem('theme') || 'light';
    applyThemeClass(cached);
  }, []);

  const login = async (emailOrUserData, password) => {
    if (typeof emailOrUserData === 'object') {
      // Direct payload state update from settings/upgrade forms
      const { token: userToken, ...userData } = emailOrUserData;
      if (userToken) setToken(userToken);
      if (Object.keys(userData).length > 0) {
        setUser(userData);
      }
      return { success: true, user: userData, token: userToken };
    }

    try {
      const res = await axios.post('/api/auth/login', { email: emailOrUserData, password });
      const { token: userToken, ...userData } = res.data;
      setToken(userToken);
      setUser(userData);
      return { success: true, user: userData, token: userToken };
    } catch (error) {
      if (error.response?.data?.requiresVerification) {
        return {
          success: false,
          requiresVerification: true,
          email: error.response.data.email,
          message: error.response.data.message
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || (error.code === 'ERR_NETWORK' ? `Unable to connect to backend server at ${axios.defaults.baseURL || 'http://localhost:5000'}. Please ensure your local backend server is running.` : (error.message || 'Login failed'))
      };
    }
  };

  const loginWithGoogle = async (credential, accessToken) => {
    try {
      const res = await axios.post('/api/auth/google', { credential, accessToken });
      if (res.data.requiresVerification) {
        return {
          success: true,
          requiresVerification: true,
          email: res.data.email,
          message: res.data.message
        };
      }
      const { token: userToken, ...userData } = res.data;
      setToken(userToken);
      setUser(userData);
      return { success: true, user: userData, token: userToken };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || (error.code === 'ERR_NETWORK' ? `Unable to connect to backend server at ${axios.defaults.baseURL || 'http://localhost:5000'}. Please ensure your local backend server is running.` : (error.message || 'Google login failed'))
      };
    }
  };

  const register = async (name, email, password, mobile) => {
    try {
      const res = await axios.post('/api/auth/register', { name, email, password, mobile });
      if (res.data.requiresVerification) {
        return {
          success: true,
          requiresVerification: true,
          email: res.data.email,
          message: res.data.message
        };
      }
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

  const verifyEmail = async (email, code) => {
    try {
      const res = await axios.post('/api/auth/verify', { email, code });
      const { token: userToken, message, ...userData } = res.data;
      if (userToken) setToken(userToken);
      if (userData && Object.keys(userData).length > 0) setUser(userData);
      return { success: true, message: message || 'Email verified successfully!' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Verification failed'
      };
    }
  };

  const resendVerification = async (email) => {
    try {
      const res = await axios.post('/api/auth/resend-verification', { email });
      return { success: true, message: res.data.message || 'Verification code resent!' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to resend code'
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
    <AuthContext.Provider value={{ user, token, loading, login, loginWithGoogle, register, verifyEmail, resendVerification, logout, updateMobile, updateBudget, updateUserOrg }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
