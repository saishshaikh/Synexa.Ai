import React from "react";
import ChatInput from "./ChatInput";
import MessageList from "./MessageList";
import { useSelector } from "react-redux";
import { Menu } from "lucide-react";

import {
  selectAllMessages,
  selectMessagesLoading,
  selectMessagesError,
} from "../redux/messageSlice";

import {
  selectCurrentConversation,
} from "../redux/conversationSlice";

const ChatArea = ({ onMenuClick }) => {
  // ======================================================
  // CURRENT CONVERSATION
  // ======================================================

  const currentConversation = useSelector(
    selectCurrentConversation
  );

  // ======================================================
  // MESSAGES
  // ======================================================

  const messages = useSelector(selectAllMessages);

  const loading = useSelector(
    selectMessagesLoading
  );

  const error = useSelector(
    selectMessagesError
  );

  // ======================================================
  // ACTIVE CONVERSATION ID
  // ======================================================

  const activeId =
    currentConversation?._id ||
    currentConversation?.id ||
    null;

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-[#111827]">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        className="
          flex items-center
          justify-between
          px-4 py-3
          border-b
          border-gray-200
          dark:border-gray-800
        "
      >
        <div className="flex items-center gap-2 min-w-0">

          {/* Mobile Menu */}
          <button
            onClick={onMenuClick}
            className="
              md:hidden
              p-2
              rounded-lg
              hover:bg-gray-100
              dark:hover:bg-gray-800
              transition-colors
            "
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Conversation Title */}
          <h2
            className="
              text-sm
              font-semibold
              truncate
              text-gray-900
              dark:text-white
            "
          >
            {currentConversation?.title || "New Chat"}
          </h2>
        </div>

        {/* Agent */}
        <span
          className="
            text-xs
            text-gray-500
            dark:text-gray-400
            border
            border-gray-200
            dark:border-gray-700
            px-2
            py-1
            rounded-full
            flex-shrink-0
          "
        >
          Synexa.AI Agent
        </span>
      </div>

      {/* ==================================================
          MESSAGES AREA
      ================================================== */}

      <div
        className="
          flex-1
          overflow-y-auto
          w-full
          max-w-4xl
          mx-auto
          p-4
        "
      >

        {/* New Chat */}
        {!activeId && (
          <div
            className="
              h-full
              flex
              flex-col
              items-center
              justify-center
              text-center
              px-4
            "
          >
            <div
              className="
                w-12
                h-12
                rounded-2xl
                bg-gradient-to-r
                from-sky-500
                to-purple-500
                flex
                items-center
                justify-center
                text-white
                text-xl
                font-bold
                shadow-lg
                shadow-sky-500/20
                mb-4
              "
            >
              ✦
            </div>

            <h1
              className="
                text-xl
                font-semibold
                text-gray-800
                dark:text-white
                mb-2
              "
            >
              How can I help you today?
            </h1>

            <p
              className="
                text-sm
                text-gray-500
                dark:text-gray-400
              "
            >
              Start a new conversation with Synexa.AI
            </p>
          </div>
        )}

        {/* Loading */}
        {activeId && loading && (
          <div
            className="
              flex
              items-center
              justify-center
              py-8
            "
          >
            <div className="flex items-center gap-2">

              <div
                className="
                  w-5
                  h-5
                  border-2
                  border-sky-500
                  border-t-transparent
                  rounded-full
                  animate-spin
                "
              />

              <span
                className="
                  text-sm
                  text-gray-500
                  dark:text-gray-400
                "
              >
                Loading messages...
              </span>

            </div>
          </div>
        )}

        {/* Error */}
        {activeId && error && !loading && (
          <div className="text-center py-8">

            <p className="text-sm text-red-500">
              {typeof error === "string"
                ? error
                : "Failed to load messages"}
            </p>

          </div>
        )}

        {/* Messages */}
        {activeId &&
          !loading &&
          !error && (
            <MessageList messages={messages} />
          )}

      </div>

      {/* ==================================================
          CHAT INPUT
      ================================================== */}

      <div
        className="
          w-full
          max-w-4xl
          mx-auto
          px-4
          pb-4
          pt-2
        "
      >
        <ChatInput />
      </div>

    </div>
  );
};

export default ChatArea;