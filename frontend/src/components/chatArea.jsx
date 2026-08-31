import React, { useEffect } from "react";
import ChatInput from "./ChatInput";
import MessageList from "./MessageList";

import { useSelector, useDispatch } from "react-redux";
import { Menu } from "lucide-react";

import {
  fetchMessages,
  selectAllMessages,
  selectMessagesLoading,
  selectMessagesError,
} from "../redux/messageSlice";

import { selectCurrentConversation } from "../redux/conversationSlice";

const ChatArea = ({ onMenuClick }) => {
  const dispatch = useDispatch();

  const currentConversation = useSelector(selectCurrentConversation);
  const messages = useSelector(selectAllMessages);
  const loading = useSelector(selectMessagesLoading);
  const error = useSelector(selectMessagesError);

  const activeId =
    currentConversation?._id ||
    currentConversation?.id;

  useEffect(() => {
    if (!activeId) return;

    console.log("💬 Loading messages for:", activeId);

    dispatch(fetchMessages(activeId));
  }, [dispatch, activeId]);

  useEffect(() => {
    console.log("🆔 Current Conversation:", currentConversation);
    console.log("🆔 Current Conversation ID:", activeId);
  }, [currentConversation, activeId]);

  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-[#111827]">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">

        <div className="flex items-center gap-2">

          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h2 className="text-sm font-semibold truncate">
            {currentConversation?.title || "New Chat"}
          </h2>

        </div>

        <span className="text-xs text-gray-500 border px-2 py-1 rounded-full">
          Synexa.AI Agent
        </span>

      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto p-4">

        {loading && messages.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            Loading messages...
          </div>
        )}

        {error && (
          <div className="text-center py-4 text-red-500">
            {typeof error === "string"
              ? error
              : "Failed to load messages"}
          </div>
        )}

        <MessageList messages={messages} />

      </div>

      {/* Input */}
      <div className="w-full max-w-4xl mx-auto px-4 pb-4 pt-2">
        <ChatInput />
      </div>

    </div>
  );
};

export default ChatArea;