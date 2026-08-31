
// frontend/src/hooks/useMessageSend.js

import { useState, useCallback } from "react";
import Api from "../utils/axios";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentConversation } from "../redux/conversationSlice";

const useMessageSend = () => {
  const dispatch = useDispatch();

  const [sending, setSending] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const currentConversation = useSelector(
    (state) => state.conversations?.currentConversation
  );

  const sendMessage = useCallback(
    async (prompt) => {
      const cleanPrompt = prompt?.trim();

      if (!cleanPrompt || sending || isCreating) {
        return null;
      }

      let conversationId =
        currentConversation?._id ||
        currentConversation?.id;

      try {
        setError(null);

        // ==========================================
        // 1. CREATE CONVERSATION IF NEEDED
        // ==========================================

        if (!conversationId) {
          setIsCreating(true);

          console.log("🆕 Creating conversation...");

          const response = await Api.post(
            "/api/chat/conversations",
            {
              title:
                cleanPrompt.slice(0, 30) +
                (cleanPrompt.length > 30 ? "..." : ""),
            }
          );

          console.log(
            "✅ Conversation created:",
            response.data
          );

          const newConversation =
            response.data?.data ||
            response.data?.conversation ||
            response.data;

          conversationId =
            newConversation?._id ||
            newConversation?.id;

          if (!conversationId) {
            throw new Error(
              "Backend did not return conversation ID"
            );
          }

          dispatch(
            setCurrentConversation(newConversation)
          );

          setIsCreating(false);
        }

        // ==========================================
        // 2. SEND MESSAGE TO AGENT
        // ==========================================

        setSending(true);

        console.log("📤 Sending message...");
        console.log("🆔 Conversation ID:", conversationId);
        console.log("💬 Prompt:", cleanPrompt);

        const response = await Api.post(
          "/api/agent/chat",
          {
            prompt: cleanPrompt,
            conversationId,
          }
        );

        console.log(
          "✅ AI RESPONSE FROM AGENT:",
          response.data
        );

        return response.data;

      } catch (err) {
        console.error(
          "❌ useMessageSend error:",
          err.response?.data || err.message
        );

        const message =
          err.response?.data?.message ||
          err.message ||
          "Failed to send message";

        setError(message);

        return null;

      } finally {
        setSending(false);
        setIsCreating(false);
      }
    },
    [
      dispatch,
      currentConversation,
      sending,
      isCreating,
    ]
  );

  return {
    sendMessage,
    sending,
    isCreating,
    error,
  };
};

export default useMessageSend;
