import React, { useEffect } from "react";
import ChatInput from "./ChatInput";
import MessageList from "./MessageList";
import { useSelector } from "react-redux";
import { Menu } from "lucide-react";
import useGetConversationById from "../hooks/useGetConversationById";

const ChatArea = ({ onMenuClick }) => {
  const currentConversation = useSelector(
    (state) => state?.conversation?.currentConversation
  );

  const {
    conversation,
    loading,
    error,
  } = useGetConversationById(
    currentConversation?._id
  );

  useEffect(() => {
    console.log(
      "🆔 Current Conversation:",
      currentConversation
    );

    console.log(
      "🆔 Current Conversation ID:",
      currentConversation?._id
    );
  }, [currentConversation]);

  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-[#111827] transition-colors duration-300">

      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827]">

        <div className="flex items-center gap-2">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {conversation?.title ||
              currentConversation?.title ||
              "New Chat"}
          </h2>
        </div>

        <span className="text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-2 py-1 rounded-full">
          Synexa.AI Agent
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto p-4">

        {loading && (
          <div className="text-center py-4 text-gray-500">
            Loading conversation...
          </div>
        )}

        {error && (
          <div className="text-center py-4 text-red-500">
            {error}
          </div>
        )}

        <MessageList />
      </div>

      {/* Input */}
      <div className="w-full max-w-4xl mx-auto px-4 pb-4 pt-2 bg-white dark:bg-[#111827]">
        <ChatInput />
      </div>

    </div>
  );
};

export default ChatArea;