import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

const RENDER_BACKEND_URL = 'https://backend-xolk.onrender.com';
let apiBaseUrl = import.meta.env.VITE_API_URL || RENDER_BACKEND_URL;

// Ensure no trailing slashes on base URL
if (apiBaseUrl && apiBaseUrl.endsWith('/')) {
  apiBaseUrl = apiBaseUrl.slice(0, -1);
}

// In production deployment without explicit VITE_API_URL set, fallback to Render backend
if (!import.meta.env.VITE_API_URL && typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  apiBaseUrl = RENDER_BACKEND_URL;
}

axios.defaults.baseURL = apiBaseUrl;

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "40902555112-7p9ga25odid8onlj8ehtbmn3jclqfos5.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
