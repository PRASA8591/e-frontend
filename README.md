# 💎 ExpenseTracker Pro — Web Frontend

Official modern web application frontend for **ExpenseTracker Pro** by **PrasaTek System Solutions**.

---

## 📋 Overview
ExpenseTracker Pro is a modern, high-performance financial management web application built with React 18, Vite, and Tailwind CSS. It features multi-account cash flow tracking, real-time analytics charts, multi-theme customization (Light, Dark, Forest Emerald, Nordic Frost, Cyberpunk Neon), dual-language support (English & Sinhala), Google OAuth authentication, and an Admin Control Panel with full telemetry.

---

## 🛠️ Technology Stack
- **Framework**: React 18 with Vite build system
- **Styling**: Tailwind CSS v4 & Lucide React Icons
- **HTTP Client**: Axios (configured with API interceptors)
- **Routing**: React Router DOM v6
- **Data Visualization**: Custom interactive charts & progress bars
- **Internationalization**: English (EN) & Sinhala (SI) dual-language engine
- **Deployment Target**: Vercel SPA Hosting (`cash.prasatek.lk`)

---

## 🔑 Environment Variables Setup
Copy `.env.example` to `.env` in the frontend root directory and configure parameters:

```env
VITE_API_URL=https://backend-xolk.onrender.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

> ⚠️ **Security Notice**: Never commit `.env` files containing API keys or secrets to Git. Use `.env.example` for public template configuration.

---

## ⚙️ Installation & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```

Application will open at `http://localhost:3000`.

### 3. Build Production Bundle
```bash
npm run build
```

Production build artifacts will be generated in the `dist/` directory.

---

## 🚀 Key Features

- **Multi-Account Management**: Manage bank accounts, credit cards, and digital wallets.
- **Transaction Analytics**: Log income and expenses with automatic category tagging and date filtering.
- **Multi-Theme Engine**: Unlock visual themes (Light, Dark, Forest Emerald, Nordic Frost, Cyberpunk Neon) based on user plan.
- **Dual-Language Interface**: Toggle between English and Sinhala seamlessly across all views.
- **Google OAuth Login**: One-click sign-in via Google accounts with email verification.
- **Admin Control Panel**: View user analytics, inspect accounts, manage maintenance mode, and update headquarters location map.
- **Danger Zone Settings**: Reset account data or permanently delete account per Privacy Policy #6.

---

## 🛡️ License & Copyright
© PrasaTek System Solutions. All rights reserved.
