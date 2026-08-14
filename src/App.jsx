import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import Settings from './pages/Settings';
import Subscription from './pages/Subscription';
import Upgrade from './pages/Upgrade';
import Usage from './pages/Usage';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import { useSmsReader, initSmsListener } from './hooks/useSmsReader';
import ErrorBoundary from './components/ErrorBoundary';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center transition-colors">
        <div className="w-10 h-10 border-4 border-prasatek-light dark:border-slate-800 border-t-prasatek-primary rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">Loading Session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center transition-colors">
        <div className="w-10 h-10 border-4 border-prasatek-light dark:border-slate-800 border-t-prasatek-primary rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">Verifying Privileges...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  const role = user.role ? String(user.role).toLowerCase() : '';
  if (role !== 'admin' && role !== 'manager' && role !== 'system_admin' && role !== 'system-admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function AppContent() {
  useSmsReader();
  const { login } = useAuth();
  const navigate = useNavigate();

  // Initialize Native SMS Listener on App Launch
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      initSmsListener();
    }
  }, []);

  useEffect(() => {
    const handleDeepLink = async (data) => {
      console.log('[DeepLink] Captured incoming URL:', data.url);
      try {
        const rawUrl = data.url || '';
        if (rawUrl.includes('auth-callback') || rawUrl.includes('token=')) {
          // Format expensetracker://auth-callback?token=XYZ
          const parsedUrl = new URL(rawUrl.replace('expensetracker://', 'https://cash.prasatek.lk/'));
          const token = parsedUrl.searchParams.get('token') || parsedUrl.searchParams.get('jwt');
          if (token) {
            localStorage.setItem('token', token);
            if (Capacitor.isNativePlatform()) {
              try { await Browser.close(); } catch (e) {}
            }
            login({ token });
            navigate('/dashboard');
          }
        }
      } catch (err) {
        console.error('[DeepLink] Failed to parse URL:', err);
      }
    };

    const listener = CapApp.addListener('appUrlOpen', handleDeepLink);

    return () => {
      listener.then(h => h.remove()).catch(() => {});
    };
  }, [login, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/contact" element={<Contact />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      />
      <Route
        path="/system-admin"
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/profile"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/app"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/*"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscription"
        element={
          <ProtectedRoute>
            <Subscription />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upgrade"
        element={
          <ProtectedRoute>
            <Upgrade />
          </ProtectedRoute>
        }
      />
      <Route
        path="/usage"
        element={
          <ProtectedRoute>
            <Usage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
