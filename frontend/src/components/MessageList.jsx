// components/MessageList.jsx
import React, { useEffect } from "react";
import { Bot, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchMessages,
  clearMessages,
} from "../redux/messageSlice";
import { selectCurrentConversation } from "../redux/conversationSlice";

const MessageList = ({ messages: propMessages }) => {
  const dispatch = useDispatch();

  // ✅ Redux Selectors (Plural use karo!)
  const currentConversation = useSelector(selectCurrentConversation);

  // ✅ Agar prop aa raha hai toh prop use karo, warna Redux se lo
  const {
    messages: reduxMessages,
    loading,
    error,
  } = useSelector((state) => state.messages);

  const messages = propMessages || reduxMessages || [];

  useEffect(() => {
    if (currentConversation?.id || currentConversation?._id) {
      console.log(
        "💬 Loading messages for:",
        currentConversation.id || currentConversation._id
      );

      dispatch(
        fetchMessages(currentConversation.id || currentConversation._id)
      );
    } else {
      dispatch(clearMessages());
    }
  }, [currentConversation?.id, currentConversation?._id, dispatch]);

  return (
    <div className="flex flex-col h-full">
      {loading && (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <p className="text-center text-red-500 py-4">
          Error: {error}
        </p>
      )}

      {!loading &&
        !error &&
        messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-sky-500 to-purple-500 flex items-center justify-center text-white mb-4 shadow-lg">
              <Bot className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              How can I help you today?
            </h3>

            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
              Ask me anything, or pick a starting prompt
              to get going.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        messages.length > 0 && (
          <div className="w-full space-y-4">
            {messages.map((msg, index) => (
              <div
                key={msg.id || msg._id || index}
                className={`flex gap-3 ${
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                  }`}
                >
                  {msg.content || msg.text || msg.message}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-600 dark:text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default MessageList;