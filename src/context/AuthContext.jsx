import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('user');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Helper to safely update user state & sync with LocalStorage
  const updateUserState = (newUserData) => {
    setUser(prev => {
      if (!newUserData) {
        try { localStorage.removeItem('user'); } catch (e) {}
        return null;
      }
      const updated = typeof newUserData === 'function' 
        ? newUserData(prev) 
        : { ...(prev || {}), ...newUserData };
      try {
        localStorage.setItem('user', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save user to localStorage:', e);
      }
      return updated;
    });
  };

  // Configure axios to send Bearer token automatically if it exists
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [token]);

  // Load user profile if token is present
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await axios.get('/api/auth/me');
          if (res.data) {
            const fetched = res.data?.user || res.data;
            if (fetched && typeof fetched === 'object' && Object.keys(fetched).length > 0) {
              updateUserState(fetched);
            }
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
          // Only clear session on 401 or 403 (unauthorized/forbidden)
          if (error.response?.status === 401 || error.response?.status === 403) {
            logout();
          }
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
      const userToken = emailOrUserData.token || emailOrUserData.jwt;
      let rawUser = emailOrUserData.user || (({ token, jwt, success, message, ...rest }) => rest)(emailOrUserData);
      let userData = rawUser ? {
        ...rawUser,
        phone: rawUser.phone || rawUser.mobile || '',
        mobile: rawUser.mobile || rawUser.phone || ''
      } : null;
      
      if (userToken) {
        setToken(userToken);
        try {
          localStorage.setItem('token', userToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        } catch (e) {}
      }

      if (userData && Object.keys(userData).length > 0 && (userData._id || userData.id || userData.email)) {
        updateUserState(userData);
      } else if (userToken) {
        // Fetch full profile from /api/auth/me if missing
        try {
          const meRes = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${userToken}` }
          });
          const fetched = meRes.data?.user || meRes.data;
          if (fetched && typeof fetched === 'object' && (fetched._id || fetched.id || fetched.email)) {
            userData = {
              ...fetched,
              phone: fetched.phone || fetched.mobile || '',
              mobile: fetched.mobile || fetched.phone || ''
            };
            updateUserState(userData);
          }
        } catch (meErr) {
          console.warn('Failed to resolve /api/auth/me on token login:', meErr);
        }
      }
      return { success: true, user: userData, token: userToken };
    }

    try {
      const res = await axios.post('/api/auth/login', { email: emailOrUserData, password });
      
      // Ensure res.data is a valid JSON object and not HTML from a rewrite/404
      if (!res.data || typeof res.data !== 'object' || typeof res.data === 'string') {
        return {
          success: false,
          message: 'Received invalid response from server. Please verify your connection.'
        };
      }

      const userToken = res.data?.token || res.data?.jwt;
      const rawUser = res.data?.user || (({ token, jwt, success, message, ...rest }) => rest)(res.data);
      const userData = rawUser ? {
        ...rawUser,
        phone: rawUser.phone || rawUser.mobile || '',
        mobile: rawUser.mobile || rawUser.phone || ''
      } : null;
      
      if (!userToken || !userData || (!userData._id && !userData.id && !userData.email)) {
        return {
          success: false,
          message: 'Invalid email or password. Please try again.'
        };
      }

      setToken(userToken);
      try {
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      } catch (e) {}

      updateUserState(userData);
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
        message: error.response?.data?.message || (error.code === 'ERR_NETWORK' ? 'Unable to connect to backend server. Please check your internet connection.' : (error.message || 'Login failed'))
      };
    }
  };

  const loginWithGoogle = async (credentialOrPayload, accessToken) => {
    try {
      let payload = {};
      if (typeof credentialOrPayload === 'object' && credentialOrPayload !== null) {
        payload = credentialOrPayload;
      } else {
        payload = { credential: credentialOrPayload, idToken: credentialOrPayload, accessToken };
      }

      const res = await axios.post('/api/auth/google', payload);
      if (res.data?.requiresVerification) {
        return {
          success: true,
          requiresVerification: true,
          email: res.data.email,
          message: res.data.message
        };
      }

      if (!res.data || typeof res.data !== 'object' || typeof res.data === 'string') {
        return {
          success: false,
          message: 'Received invalid response from server during Google authentication.'
        };
      }

      const userToken = res.data?.token || res.data?.jwt;
      const rawUser = res.data?.user || (({ token, jwt, success, message, ...rest }) => rest)(res.data);
      const userData = rawUser ? {
        ...rawUser,
        phone: rawUser.phone || rawUser.mobile || '',
        mobile: rawUser.mobile || rawUser.phone || ''
      } : null;
      
      if (!userToken || !userData || (!userData._id && !userData.id && !userData.email)) {
        return {
          success: false,
          message: 'Google authentication failed to retrieve a valid user profile.'
        };
      }

      setToken(userToken);
      try {
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      } catch (e) {}

      updateUserState(userData);
      return { success: true, user: userData, token: userToken };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || (error.code === 'ERR_NETWORK' ? 'Unable to connect to server. Please check your internet connection.' : (error.message || 'Google login failed'))
      };
    }
  };

  const register = async (name, email, password, mobile) => {
    try {
      const res = await axios.post('/api/auth/register', { name, email, password, mobile });
      if (res.data?.requiresVerification) {
        return {
          success: true,
          requiresVerification: true,
          email: res.data.email,
          message: res.data.message
        };
      }
      const userToken = res.data?.token || res.data?.jwt;
      const rawUser = res.data?.user || (({ token, jwt, success, message, ...rest }) => rest)(res.data);
      const userData = rawUser ? {
        ...rawUser,
        phone: rawUser.phone || rawUser.mobile || '',
        mobile: rawUser.mobile || rawUser.phone || ''
      } : null;

      if (userToken) {
        setToken(userToken);
        try {
          localStorage.setItem('token', userToken);
          localStorage.setItem('user', JSON.stringify(userData));
          axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        } catch (e) {}
      }
      if (userData && Object.keys(userData).length > 0) {
        updateUserState(userData);
      }
      return { success: true, user: userData, token: userToken };
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
      const userToken = res.data?.token || res.data?.jwt;
      const rawUser = res.data?.user || (({ token, jwt, success, message, ...rest }) => rest)(res.data);
      const userData = rawUser ? {
        ...rawUser,
        phone: rawUser.phone || rawUser.mobile || '',
        mobile: rawUser.mobile || rawUser.phone || ''
      } : null;

      if (userToken) {
        setToken(userToken);
        try {
          localStorage.setItem('token', userToken);
          localStorage.setItem('user', JSON.stringify(userData));
          axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        } catch (e) {}
      }
      if (userData && Object.keys(userData).length > 0) {
        updateUserState(userData);
      }
      return { success: true, message: res.data?.message || 'Email verified successfully!', user: userData };
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
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (e) {}
  };

  const updateMobile = async (mobile) => {
    try {
      const trimmed = String(mobile).trim();
      const res = await axios.put('/api/auth/mobile', { mobile: trimmed });
      const updatedUser = res.data?.user || res.data || {};
      const mergedUser = { ...(user || {}), ...updatedUser, mobile: trimmed, phone: trimmed };
      try {
        localStorage.setItem('user', JSON.stringify(mergedUser));
      } catch (e) {}
      updateUserState(mergedUser);
      return { success: true, user: mergedUser };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update mobile number'
      };
    }
  };

  const updateBudget = async (monthlyBudgetLimit) => {
    try {
      const res = await axios.put('/api/auth/budget', { monthlyBudgetLimit });
      const updatedUser = res.data;
      updateUserState(prev => ({ ...(prev || {}), ...updatedUser }));
      return { success: true, user: updatedUser };
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
        updateUserState(prev => ({ ...(prev || {}), org: res.data.org }));
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update organization'
      };
    }
  };

  const isAuthenticated = Boolean(user && token);

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, loginWithGoogle, register, verifyEmail, resendVerification, logout, updateMobile, updateBudget, updateUserOrg }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
