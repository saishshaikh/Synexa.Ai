// components/MessageList.jsx

import React, { useEffect, useMemo } from "react";
import { Bot } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { fetchMessages, clearMessages } from "../redux/messageSlice";
import { selectCurrentConversation } from "../redux/conversationSlice";
import MessageBubbles from "./MessageBubbles";

const MessageList = () => {
  const dispatch = useDispatch();

  const currentConversation = useSelector(selectCurrentConversation);

  const {
    messages: reduxMessages = [],
    loading,
    error,
  } = useSelector((state) => state.messages);

  const conversationId =
    currentConversation?._id || currentConversation?.id;

  useEffect(() => {
    if (!conversationId) {
      dispatch(clearMessages());
      return;
    }

    // Current conversation ke messages fetch karo
    dispatch(fetchMessages(conversationId));
  }, [conversationId, dispatch]);

  // Remove duplicate messages
  const messages = useMemo(() => {
    const seen = new Set();

    return reduxMessages.filter((msg) => {
      if (!msg) return false;

      const id = msg._id || msg.id;

      // Database message ke liye real ID use karo
      if (id) {
        if (seen.has(id)) {
          return false;
        }

        seen.add(id);
        return true;
      }

      return true;
    });
  }, [reduxMessages]);

  return (
    <div className="flex flex-col h-full">

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ERROR */}
      {error && (
        <p className="text-center text-red-500 py-4">
          Error: {error}
        </p>
      )}

      {/* EMPTY */}
      {!loading && !error && messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-sky-500 to-purple-500 flex items-center justify-center text-white mb-4 shadow-lg">
            <Bot className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            How can I help you today?
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
            Ask me anything, or pick a starting prompt to get going.
          </p>
        </div>
      )}

      {/* MESSAGES */}
      {!loading && !error && messages.length > 0 && (
        <div className="w-full">
          {messages.map((msg, index) => (
            <MessageBubbles
              key={
                msg._id ||
                msg.id ||
                `message-${conversationId}-${index}`
              }
              message={msg}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageList;