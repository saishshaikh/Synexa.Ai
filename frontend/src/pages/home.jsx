import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../utils/firebase';
import Api from '../utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user); // <-- Redux store se user NIKALO!

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
        // ✅ Redux mein user save karo!
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">
        {user ? `Welcome ${user.name || 'User'}!` : 'Hello'}
      </h1>
      
      {user ? (
        <div className="text-center">
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt="Avatar" 
              className="w-20 h-20 rounded-full mx-auto mb-2 object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-300 mx-auto mb-2 flex items-center justify-center text-2xl">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          
          <p className="mb-2">Email: {user.email}</p>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      ) : (
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition disabled:opacity-50"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></div>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.15 21.32 7.23 24 12 24z" />
                <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.6H1.18C.43 8.12 0 9.82 0 12s.43 3.88 1.18 5.4l4.09-3.16z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.15 2.68 1.18 6.6l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Continue with Google</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default Home;