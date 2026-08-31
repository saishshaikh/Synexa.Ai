
// frontend/src/components/ChatInput.jsx

import React, {
  useState,
  useRef,
  useEffect,
} from "react";

import {
  Send,
  Paperclip,
} from "lucide-react";

import useMessageSend from "../hooks/useMessageSend";

const ChatInput = () => {
  const [message, setMessage] = useState("");

  const inputRef = useRef(null);

  const {
    sendMessage,
    sending,
    isCreating,
    error,
  } = useMessageSend();

  // ==========================================
  // AUTO RESIZE
  // ==========================================

  useEffect(() => {
    if (!inputRef.current) return;

    inputRef.current.style.height = "auto";

    const height =
      inputRef.current.scrollHeight;

    inputRef.current.style.height =
      `${height}px`;
  }, [message]);

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const prompt = message.trim();

    if (
      !prompt ||
      sending ||
      isCreating
    ) {
      return;
    }

    console.log("📤 ChatInput submit");
    console.log("💬 Prompt:", prompt);

    const result = await sendMessage(prompt);

    console.log(
      "🤖 Hook returned:",
      result
    );

    // Clear input only after request succeeds
    if (result) {
      setMessage("");

      if (inputRef.current) {
        inputRef.current.style.height =
          "auto";
      }
    }
  };

  return (
    <div className="relative w-full">

      <form
        onSubmit={handleSubmit}
        className="
          flex items-end gap-2
          bg-gray-100 dark:bg-gray-800
          rounded-2xl px-4 py-3
          shadow-sm
          border border-gray-200
          dark:border-gray-700
        "
      >

        {/* Attachment */}

        <button
          type="button"
          className="
            p-2 mb-1 rounded-full
            hover:bg-gray-200
            dark:hover:bg-gray-700
            transition-colors
          "
        >
          <Paperclip
            className="
              w-5 h-5
              text-gray-500
              dark:text-gray-400
            "
          />
        </button>

        {/* Textarea */}

        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey
            ) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Message Synexa.AI..."
          rows={1}
          disabled={
            sending ||
            isCreating
          }
          className="
            flex-1
            bg-transparent
            outline-none
            text-sm
            text-gray-900
            dark:text-gray-100
            placeholder:text-gray-400
            dark:placeholder:text-gray-500
            resize-none
            max-h-40
          "
        />

        {/* Send */}

        <button
          type="submit"
          disabled={
            !message.trim() ||
            sending ||
            isCreating
          }
          className="
            p-2 mb-1
            rounded-full
            bg-black
            dark:bg-white
            text-white
            dark:text-black
            hover:opacity-80
            transition-opacity
            disabled:opacity-50
          "
        >
          {sending || isCreating ? (
            <div
              className="
                w-4 h-4
                border-2
                border-current
                border-t-transparent
                rounded-full
                animate-spin
              "
            />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>

      </form>

      {/* Error */}

      {error && (
        <p className="text-center text-xs text-red-500 mt-2">
          {error}
        </p>
      )}

      <p
        className="
          text-center
          text-[10px]
          text-gray-400
          dark:text-gray-600
          mt-2
        "
      >
        Synexa.AI can make mistakes.
        Check important info.
      </p>

    </div>
  );
};

export default ChatInput;
