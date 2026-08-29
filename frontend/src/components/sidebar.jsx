// components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Plus, Menu, X, Settings, LogOut, MessageSquare,
  Trash2, Edit2, ChevronDown, ChevronUp, Search
} from 'lucide-react';

import useGetConversations from '../hooks/useGetConversations';
import useCreateConversation from '../hooks/useCreateConversation';
import { setCurrentConversation } from '../redux/conversationSlice';
import { logout } from '../redux/userSlice';
import Api from '../utils/axios';

const Sidebar = () => {
  const dispatch = useDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [hoveredChat, setHoveredChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // ✅ EXACT Redux se user uthao (Aapke userSlice ke hisaab se)
  const { user } = useSelector((state) => state.user);

  // ✅ 2. Detect device
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // ✅ 3. Close mobile menu on resize
  useEffect(() => {
    if (!isMobile && isMobileMenuOpen) setIsMobileMenuOpen(false);
  }, [isMobile, isMobileMenuOpen]);

  const { conversations, loading, error, refetch } = useGetConversations();
  const { createConversation, loading: creating } = useCreateConversation();

  // ✅ Filter conversations
  const filteredConversations = conversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Group conversations by date
  const groupedConversations = filteredConversations.reduce((groups, conv) => {
    const date = conv.date || 'Today';
    if (!groups[date]) groups[date] = [];
    groups[date].push(conv);
    return groups;
  }, {});

  const handleNewChat = async () => {
    const result = await createConversation({ title: 'New Conversation', agent: 'chat' });
    if (result.success) {
      refetch();
      if (isMobile) setIsMobileMenuOpen(false);
    } else {
      alert('Failed to create: ' + result.error);
    }
  };

  const handleSelectChat = (conv) => {
    dispatch(setCurrentConversation(conv));
    if (isMobile) setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await Api.post('/api/auth/firebase-logout');
      dispatch(logout());
      dispatch(setCurrentConversation(null));
      window.location.href = '/login';
    } catch (err) {
      console.error("Logout failed:", err);
      dispatch(logout());
      window.location.href = '/login';
    }
  };

  const formatDate = (date) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (date === today) return 'Today';
    if (date === yesterday) return 'Yesterday';
    return date;
  };

  // ✅ User ke fields Redux se (Exact aapke data ke hisaab se)
  const userName = user?.name || 'User Name';
  const userEmail = user?.email || 'user@email.com';
  const userAvatar = user?.avatar; // ✅ Yahan 'avatar' hai, 'avatarUrl' nahi!

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`
          md:hidden fixed z-50 p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-lg 
          border border-sky-200 dark:border-purple-500/20 hover:shadow-xl transition-all duration-300
          ${isMobileMenuOpen ? 'top-4 left-[280px]' : 'top-3 left-3'}
        `}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="w-5 h-5 text-gray-600 dark:text-gray-300" /> : <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
      </button>

      {/* Sidebar Container */}
      <div className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 fixed md:relative top-0 left-0 w-[280px] sm:w-72 h-screen
        bg-white dark:bg-[#0f172a] 
        border-r border-sky-200/50 dark:border-purple-500/20
        transition-all duration-300 ease-in-out flex flex-col z-40
        shadow-2xl md:shadow-none ${isMobileMenuOpen ? 'shadow-2xl' : ''}
      `}>
        
        {/* Header - Brand */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-sky-200/50 dark:border-purple-500/20 bg-white dark:bg-[#0f172a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-sky-500 to-purple-500 flex items-center justify-center shadow-md shadow-sky-500/25 flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <span className="text-base font-bold bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">Synexa.AI</span>
          </div>
          <button onClick={() => setIsExpanded(!isExpanded)} className="hidden sm:block p-1 hover:bg-sky-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors text-gray-400 dark:text-gray-500">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-2.5 bg-white dark:bg-[#0f172a]">
          <button
            onClick={handleNewChat}
            disabled={creating}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600 text-white font-medium transition-all duration-300 shadow-md hover:shadow-lg group text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                <span>New Chat</span>
              </>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-2.5 pb-2.5 bg-white dark:bg-[#0f172a]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 text-xs bg-sky-50/50 dark:bg-gray-800 border border-sky-200/50 dark:border-purple-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 dark:focus:ring-purple-500/50 transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2.5 pb-2.5 space-y-2 sidebar-scroll bg-white dark:bg-[#0f172a]">
          {loading && (
            <div className="text-center py-6">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-gray-400 mt-2">Loading...</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-6">
              <p className="text-xs text-red-500">Error: {error}</p>
              <button onClick={refetch} className="mt-2 text-xs text-blue-500 hover:text-blue-600">Retry</button>
            </div>
          )}

          {!loading && !error && Object.keys(groupedConversations).length > 0 ? (
            Object.entries(groupedConversations).map(([date, convs]) => (
              <div key={date}>
                <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mb-1.5 px-1">
                  {formatDate(date)}
                </p>
                <div className="space-y-0.5">
                  {convs.map((conv) => (
                    <div
                      key={conv.id || conv._id}
                      className="group relative"
                      onMouseEnter={() => setHoveredChat(conv.id || conv._id)}
                      onMouseLeave={() => setHoveredChat(null)}
                    >
                      <button onClick={() => handleSelectChat(conv)} className="w-full flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-sky-50 dark:hover:bg-purple-900/30 transition-all duration-200 text-left group">
                        <MessageSquare className="w-3.5 h-3.5 text-gray-400 group-hover:text-sky-500 dark:group-hover:text-purple-400 flex-shrink-0 transition-colors duration-200" />
                        <span className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white truncate flex-1">
                          {conv.title}
                        </span>
                        {hoveredChat === (conv.id || conv._id) && !isMobile && (
                          <div className="flex gap-0.5 animate-scaleIn">
                            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                              <Edit2 className="w-3 h-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                            </button>
                            <button className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                              <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500 dark:hover:text-red-400" />
                            </button>
                          </div>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : !loading && !error && (
            <div className="text-center py-6">
              <MessageSquare className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-400 dark:text-gray-500">No conversations found</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Start a new chat to begin</p>
            </div>
          )}
        </div>

        {/* ✅ Footer - User Profile (REDUX SYNCED) */}
        <div className="border-t border-sky-200/50 dark:border-purple-500/20 p-2.5 hover:bg-sky-50/50 dark:hover:bg-purple-900/20 transition-colors duration-200 bg-white dark:bg-[#0f172a]">
          <div className="flex items-center gap-2.5">
            
            {/* ✅ Avatar: Ab exact user.avatar use hoga (Redux se) */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-sky-500 to-purple-500 flex items-center justify-center text-white font-semibold text-[10px] shadow-md shadow-sky-500/25 flex-shrink-0 overflow-hidden">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  // ✅ Agar image load na ho, toh error ke baad pehla letter dikh jayega
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerText = userName?.charAt(0)?.toUpperCase() || 'U';
                  }}
                />
              ) : (
                userName?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            
            {/* User Info Exact from Redux */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">
                {userName}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                {userEmail}
              </p>
            </div>
            
            {/* Settings & Logout */}
            <div className="flex gap-0.5">
              <button className="p-1 hover:bg-sky-100 dark:hover:bg-purple-900/30 rounded-lg transition-all duration-200 hover:scale-110">
                <Settings className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 hover:text-sky-500 dark:hover:text-purple-400" />
              </button>
              
              <button onClick={handleLogout} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 hover:scale-110" title="Logout">
                <LogOut className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden animate-fadeIn" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </>
  );
};

export default Sidebar;