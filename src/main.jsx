import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

const CUSTOM_DOMAIN_URL = 'https://cash.prasatek.lk';
let apiBaseUrl = import.meta.env.VITE_API_URL || CUSTOM_DOMAIN_URL;

// Ensure no trailing slashes on base URL
if (apiBaseUrl && apiBaseUrl.endsWith('/')) {
  apiBaseUrl = apiBaseUrl.slice(0, -1);
}

// In production deployment without explicit VITE_API_URL set, fallback to custom domain
if (!import.meta.env.VITE_API_URL && typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  apiBaseUrl = CUSTOM_DOMAIN_URL;
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
