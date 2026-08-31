// src/hooks/useMessageSend.js

import { useState, useCallback } from "react";
import Api from "../utils/axios";

import { useDispatch, useSelector } from "react-redux";

import { setCurrentConversation } from "../redux/conversationSlice";
import { addMessageLocally } from "../redux/messageSlice";

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

          const response = await Api.post(
            "/api/chat/conversations",
            {
              title:
                cleanPrompt.slice(0, 30) +
                (cleanPrompt.length > 30 ? "..." : ""),
            }
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
        // 2. ADD USER MESSAGE LOCALLY
        // ==========================================

        dispatch(
          addMessageLocally({
            role: "user",
            content: cleanPrompt,
          })
        );

        // ==========================================
        // 3. SEND MESSAGE TO AGENT
        // ==========================================

        setSending(true);

        const response = await Api.post(
          "/api/agent/chat",
          {
            prompt: cleanPrompt,
            conversationId,
          }
        );

        console.log(
          "🤖 FULL AGENT RESPONSE:",
          response.data
        );

        // ==========================================
        // 4. EXTRACT ACTUAL AI TEXT
        // ==========================================

        const body = response.data;

        let aiContent = "";

        // Backend response:
        // {
        //   success: true,
        //   data: {
        //     prompt: "...",
        //     aiResponse: "...",
        //     agent: "chat"
        //   }
        // }

        if (typeof body === "string") {
          aiContent = body;
        } else if (body?.data?.aiResponse) {
          aiContent = body.data.aiResponse;
        } else if (body?.aiResponse) {
          aiContent = body.aiResponse;
        } else if (body?.data?.response) {
          aiContent = body.data.response;
        } else if (body?.response) {
          aiContent = body.response;
        } else if (body?.message) {
          aiContent = body.message;
        }

        console.log(
          "🤖 ACTUAL AI CONTENT:",
          aiContent
        );

        if (!aiContent) {
          aiContent = "Sorry, I couldn't generate a response.";
        }

        // ==========================================
        // 5. ADD AI RESPONSE LOCALLY
        // ==========================================

        dispatch(
          addMessageLocally({
            role: "assistant",
            content: aiContent,
          })
        );

        return {
          success: true,
          data: {
            conversationId,
            prompt: cleanPrompt,
            response: aiContent,
          },
        };

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

