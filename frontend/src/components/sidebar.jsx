// components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Menu, 
  X, 
  Settings, 
  LogOut, 
  MessageSquare,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react';

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [hoveredChat, setHoveredChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // ✅ Detect device
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // ✅ Close mobile menu on resize
  useEffect(() => {
    if (!isMobile && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile, isMobileMenuOpen]);

  // ✅ Static Conversations
  const conversations = [
    { id: 1, title: "Understanding Quantum Physics", date: "Today" },
    { id: 2, title: "React Component Architecture", date: "Today" },
    { id: 3, title: "PDF Document Analysis", date: "Yesterday" },
    { id: 4, title: "Presentation Design Ideas", date: "Yesterday" },
    { id: 5, title: "Image Generation Tutorial", date: "2026-08-27" },
    { id: 6, title: "Search Algorithms Explained", date: "2026-08-27" },
  ];

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedConversations = filteredConversations.reduce((groups, conv) => {
    const date = conv.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(conv);
    return groups;
  }, {});

  const handleNewChat = () => {
    console.log('New Chat Created');
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* ✅ Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`
          md:hidden fixed z-50 
          p-2.5 
          bg-white dark:bg-gray-800 
          rounded-xl shadow-lg 
          border border-sky-200 dark:border-purple-500/20 
          hover:shadow-xl transition-all duration-300
          ${isMobileMenuOpen ? 'top-4 left-[280px]' : 'top-3 left-3'}
        `}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        ) : (
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* ✅ Sidebar Container */}
      <div className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        fixed md:relative
        top-0 left-0
        w-[280px] sm:w-72
        h-screen
        bg-white dark:bg-gray-900
        border-r border-sky-200/50 dark:border-purple-500/20
        transition-all duration-300 ease-in-out
        flex flex-col
        z-40
        shadow-2xl md:shadow-none
        ${isMobileMenuOpen ? 'shadow-2xl' : ''}
      `}>
        
        {/* ✅ Header - Brand */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-sky-200/50 dark:border-purple-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-sky-500 to-purple-500 flex items-center justify-center shadow-md shadow-sky-500/25 flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <span className="text-base font-bold bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">
              Synexa.AI
            </span>
          </div>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="hidden sm:block p-1 hover:bg-sky-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            )}
          </button>
        </div>

        {/* ✅ New Chat Button */}
        <div className="p-2.5">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600 text-white font-medium transition-all duration-300 shadow-md hover:shadow-lg group text-sm"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            <span>New Chat</span>
          </button>
        </div>

        {/* ✅ Search Bar */}
        <div className="px-2.5 pb-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 text-xs bg-sky-50/50 dark:bg-gray-800/50 border border-sky-200/50 dark:border-purple-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 dark:focus:ring-purple-500/50 transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* ✅ Conversations List */}
        <div className="flex-1 overflow-y-auto px-2.5 pb-2.5 space-y-2 sidebar-scroll">
          {Object.keys(groupedConversations).length > 0 ? (
            Object.entries(groupedConversations).map(([date, convs]) => (
              <div key={date}>
                <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mb-1.5 px-1">
                  {date}
                </p>
                <div className="space-y-0.5">
                  {convs.map((conv) => (
                    <div
                      key={conv.id}
                      className="group relative"
                      onMouseEnter={() => setHoveredChat(conv.id)}
                      onMouseLeave={() => setHoveredChat(null)}
                    >
                      <button
                        className="w-full flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-sky-50 dark:hover:bg-purple-900/30 transition-all duration-200 text-left group"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-gray-400 group-hover:text-sky-500 dark:group-hover:text-purple-400 flex-shrink-0 transition-colors duration-200" />
                        <span className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white truncate flex-1">
                          {conv.title}
                        </span>
                        {hoveredChat === conv.id && !isMobile && (
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
          ) : (
            <div className="text-center py-6">
              <MessageSquare className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-400 dark:text-gray-500">No conversations found</p>
            </div>
          )}
        </div>

        {/* ✅ Footer - User Profile */}
        <div className="border-t border-sky-200/50 dark:border-purple-500/20 p-2.5 hover:bg-sky-50/50 dark:hover:bg-purple-900/20 transition-colors duration-200">
          <div className="flex items-center gap-2.5">
            {/* ✅ Avatar */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-sky-500 to-purple-500 flex items-center justify-center text-white font-semibold text-[10px] shadow-md shadow-sky-500/25 flex-shrink-0">
              U
            </div>
            
            {/* ✅ User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">
                User Name
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                user@email.com
              </p>
            </div>
            
            {/* ✅ Settings & Logout */}
            <div className="flex gap-0.5">
              <button className="p-1 hover:bg-sky-100 dark:hover:bg-purple-900/30 rounded-lg transition-all duration-200 hover:scale-110">
                <Settings className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 hover:text-sky-500 dark:hover:text-purple-400" />
              </button>
              <button className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 hover:scale-110">
                <LogOut className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden animate-fadeIn"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;