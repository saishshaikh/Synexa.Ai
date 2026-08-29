// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../utils/firebase';
import Api from '../utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice';

// ✅ Icons - Pure SVG
const MoonIcon = () => (
  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const SunIcon = () => (
  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const GoogleIcon = () => (
  <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.15 21.32 7.23 24 12 24z" />
    <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.6H1.18C.43 8.12 0 9.82 0 12s.43 3.88 1.18 5.4l4.09-3.16z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.15 2.68 1.18 6.6l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z" />
  </svg>
);

// ✅ Components
import Sidebar from '../components/sidebar';
import ChatArea from '../components/chatArea';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  // ✅ Dark mode toggle effect - FIXED
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
      html.style.backgroundColor = '#111827';
    } else {
      html.classList.remove('dark');
      html.style.backgroundColor = '#ffffff';
    }
  }, [isDarkMode]);

  // ✅ Google Login Handler
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      await handleLogin(token);
    } catch (error) {
      console.error("❌ Google Login Error:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        alert('Login cancelled!');
      } else {
        alert('Login failed! Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Backend Login Handler
  const handleLogin = async (token) => {
    try {
      const response = await Api.post("/api/auth/firebase-login", { token });
      console.log("✅ Login Success:", response.data);

      if (response.data.success) {
        dispatch(setUserData(response.data.user));
        alert("✅ Login Successful!");
      }
    } catch (error) {
      console.error("❌ Error in handleLogin:", error);
      alert("❌ Login failed! Please try again.");
    }
  };

  // ✅ Logout Handler
  const handleLogout = async () => {
    try {
      await Api.post("/api/auth/firebase-logout");
      dispatch(setUserData(null));
      alert("✅ Logout Successful!");
    } catch (error) {
      console.error("❌ Logout Error:", error);
    }
  };

  // ✅ Toggle Dark Mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // ✅ Login hone ke baad Sidebar aur ChatArea render karo!
  if (user) {
    return (
      <div className={`flex h-screen w-full overflow-hidden transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-900' 
          : 'bg-gradient-to-br from-sky-50 via-white to-purple-50'
      }`}>
        <div className="flex-shrink-0">
          <Sidebar />
        </div>
        
        <div className="flex-1 min-w-0">
          <ChatArea />
        </div>
        
        {/* ✅ Dark Mode Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 p-2.5 sm:p-3.5 bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
        >
          {isDarkMode ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    );
  }

  // ✅ Login Screen - Sky Blue & Purple Mix
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-3 sm:px-4 md:px-6 py-4 sm:py-6 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900' 
        : 'bg-gradient-to-br from-sky-100 via-purple-50 to-sky-50'
    }`}>
      
      {/* ✅ Dark Mode Toggle - Responsive */}
      <button
        onClick={toggleDarkMode}
        className={`absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 p-2.5 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 ${
          isDarkMode 
            ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700 border border-yellow-500/30' 
            : 'bg-white/80 backdrop-blur-sm text-purple-600 hover:bg-white shadow-lg border border-sky-200'
        }`}
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? <SunIcon /> : <MoonIcon />}
      </button>

      {/* ✅ Main Login Card */}
      <div className={`w-full max-w-[90%] sm:max-w-md md:max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 md:p-8 transition-all duration-500 ${
        isDarkMode 
          ? 'bg-gray-800/90 backdrop-blur-sm border border-purple-500/20' 
          : 'bg-white/80 backdrop-blur-md border border-sky-200/50 shadow-xl shadow-sky-200/30'
      }`}>
        
        {/* ✅ Brand Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg ${
              isDarkMode 
                ? 'bg-gradient-to-r from-purple-400 to-pink-400' 
                : 'bg-gradient-to-r from-sky-500 to-purple-600'
            }`}>
              <SparklesIcon />
            </div>
            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${
              isDarkMode 
                ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent' 
                : 'bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent'
            }`}>
              Synexa.AI
            </h1>
          </div>
          <p className={`text-xs sm:text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-sky-700/70'
          }`}>
            Welcome to your intelligent agent ecosystem
          </p>
        </div>

        {/* ✅ Login Form */}
        <div className="space-y-4 sm:space-y-6">
          <div className="text-center">
            <h2 className={`text-xl sm:text-2xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Sign in
            </h2>
            <p className={`text-xs sm:text-sm mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-sky-700/60'
            }`}>
              Sign in to access your intelligent agent ecosystem
            </p>
          </div>

          {/* ✅ Google Login Button */}
          <button 
            className={`w-full flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-lg sm:rounded-xl transition-all duration-300 text-sm sm:text-base ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white hover:border-purple-500/50' 
                : 'bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                <span className="text-xs sm:text-sm font-medium">Signing in...</span>
              </>
            ) : (
              <>
                <GoogleIcon />
                <span className="text-xs sm:text-sm font-medium">Continue with Google</span>
              </>
            )}
          </button>

          {/* ✅ Divider */}
          <div className="relative">
            <div className={`absolute inset-0 flex items-center ${
              isDarkMode ? 'border-gray-600' : 'border-sky-200'
            }`}>
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className={`px-2 ${
                isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white/80 text-sky-600'
              }`}>
                Secure & Encrypted
              </span>
            </div>
          </div>

          {/* ✅ Terms & Privacy */}
          <p className={`text-center text-[10px] sm:text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-sky-700/60'
          } leading-relaxed`}>
            By signing in, you agree to our<br className="sm:hidden" />
            <a href="/terms" className={`hover:underline font-medium ${
              isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-sky-600 hover:text-sky-700'
            }`}>
              Terms of Service
            </a>
            {' '}&{' '}
            <a href="/privacy" className={`hover:underline font-medium ${
              isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
            }`}>
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      {/* ✅ Footer */}
      <div className="mt-6 sm:mt-8 text-center">
        <p className={`text-[10px] sm:text-xs ${
          isDarkMode ? 'text-gray-500' : 'text-sky-600/50'
        }`}>
          v1.0.0 | {new Date().getFullYear()} Synexa.AI
        </p>
      </div>
    </div>
  );
};

export default Home;