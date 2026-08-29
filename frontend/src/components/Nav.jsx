// components/nav.jsx
import React from 'react';
import { Menu, Settings } from 'lucide-react';
import { useSelector } from 'react-redux';

const Nav = () => {
  const currentConversation = useSelector((state) => state?.conversation?.currentConversation);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] transition-colors duration-300">
      
      {/* Left Side - Mobile Menu Button + Title */}
      <div className="flex items-center gap-2">
        {/* Mobile ke liye Menu Button */}
        <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        
        {/* Conversation Title */}
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
          {currentConversation?.title || 'New Chat'}
        </h2>
      </div>

      {/* Right Side - Model Label + Settings */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-2 py-1 rounded-full">
          Synexa.AI Agent
        </span>
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default Nav;