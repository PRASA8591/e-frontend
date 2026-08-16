import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Capacitor } from '@capacitor/core'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

const BACKEND_API_URL = 'https://backend-xolk.onrender.com';

let apiBaseUrl = import.meta.env.VITE_API_URL || BACKEND_API_URL;

// On native Android or Capacitor app, ALWAYS use the direct backend API URL
if (Capacitor.isNativePlatform() || apiBaseUrl === 'https://cash.prasatek.lk' || !apiBaseUrl) {
  apiBaseUrl = BACKEND_API_URL;
}

if (apiBaseUrl && apiBaseUrl.endsWith('/')) {
  apiBaseUrl = apiBaseUrl.slice(0, -1);
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
