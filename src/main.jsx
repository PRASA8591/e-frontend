import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

let apiBaseUrl = import.meta.env.VITE_API_URL || '';

// Prevent production deployment (e.g. Vercel) from attempting to call localhost
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  if (apiBaseUrl.includes('localhost') || apiBaseUrl.includes('127.0.0.1')) {
    apiBaseUrl = '';
  }
}

axios.defaults.baseURL = apiBaseUrl;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
