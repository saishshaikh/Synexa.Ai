// src/hooks/useMessageSend.js

import { useState, useCallback } from "react";

import Api from "../utils/axios";

import { useDispatch, useSelector } from "react-redux";

import {
  setCurrentConversation,
  fetchConversations,
} from "../redux/conversationSlice";

import { addMessageLocally } from "../redux/messageSlice";

const useMessageSend = () => {
  const dispatch = useDispatch();

  const [sending, setSending] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  // ======================================================
  // CURRENT CONVERSATION
  // ======================================================

  const currentConversation = useSelector(
    (state) => state.conversations?.currentConversation
  );

  // ======================================================
  // SEND MESSAGE
  // ======================================================

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

        // ==================================================
        // 1. CREATE CONVERSATION IF NEW CHAT
        // ==================================================

        if (!conversationId) {
          setIsCreating(true);

          const title =
            cleanPrompt.slice(0, 30) +
            (cleanPrompt.length > 30 ? "..." : "");

          console.log(
            "🆕 Creating conversation:",
            title
          );

          const response = await Api.post(
            "/api/chat/conversations",
            {
              title,
            }
          );

          console.log(
            "🆕 Conversation response:",
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

          // Make sure ID + title exist
          const conversationWithTitle = {
            ...newConversation,
            _id:
              newConversation?._id ||
              conversationId,
            title:
              newConversation?.title ||
              title,
          };

          // Set current conversation
          dispatch(
            setCurrentConversation(
              conversationWithTitle
            )
          );

          console.log(
            "✅ New conversation created:",
            conversationId
          );

          setIsCreating(false);

          // Refresh sidebar
          dispatch(fetchConversations());
        }

        // ==================================================
        // 2. SAVE USER MESSAGE TO DATABASE
        // ==================================================

        console.log(
          "💾 Saving user message:",
          {
            conversationId,
            content: cleanPrompt,
          }
        );

        const userMessageResponse =
          await Api.post(
            "/api/chat/messages",
            {
              conversationId,
              role: "user",
              content: cleanPrompt,
            }
          );

        console.log(
          "💾 USER MESSAGE SAVED:",
          userMessageResponse.data
        );

        // ==================================================
        // 3. SHOW USER MESSAGE LOCALLY
        // ==================================================

        const savedUserMessage =
          userMessageResponse.data?.data
            ?.newMessage ||
          userMessageResponse.data?.data?.message ||
          userMessageResponse.data?.message;

        dispatch(
          addMessageLocally({
            _id:
              savedUserMessage?._id ||
              `local_user_${Date.now()}`,

            role: "user",

            content: cleanPrompt,

            createdAt:
              savedUserMessage?.createdAt ||
              new Date().toISOString(),
          })
        );

        // ==================================================
        // 4. SEND MESSAGE TO AI
        // ==================================================

        setSending(true);

        console.log(
          "📤 Sending message to agent:",
          {
            conversationId,
            prompt: cleanPrompt,
          }
        );

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

        // ==================================================
        // 5. EXTRACT AI RESPONSE
        // ==================================================

        const body = response.data;

        let aiContent = "";

        // Direct string
        if (typeof body === "string") {
          aiContent = body;
        }

        // data.aiResponse
        else if (
          typeof body?.data?.aiResponse ===
          "string"
        ) {
          aiContent =
            body.data.aiResponse;
        }

        // data.response
        else if (
          typeof body?.data?.response ===
          "string"
        ) {
          aiContent =
            body.data.response;
        }

        // data.content
        else if (
          typeof body?.data?.content ===
          "string"
        ) {
          aiContent =
            body.data.content;
        }

        // data itself string
        else if (
          typeof body?.data === "string"
        ) {
          aiContent = body.data;
        }

        // root aiResponse
        else if (
          typeof body?.aiResponse ===
          "string"
        ) {
          aiContent =
            body.aiResponse;
        }

        // root response
        else if (
          typeof body?.response ===
          "string"
        ) {
          aiContent =
            body.response;
        }

        // root message
        else if (
          typeof body?.message ===
          "string"
        ) {
          aiContent = body.message;
        }

        // ==================================================
        // 6. FALLBACK
        // ==================================================

        if (!aiContent) {
          aiContent =
            "Sorry, I couldn't generate a response.";
        }

        console.log(
          "🤖 ACTUAL AI CONTENT:",
          aiContent
        );

        // ==================================================
        // 7. SAVE AI MESSAGE TO DATABASE
        // ==================================================

        console.log(
          "💾 Saving AI message:",
          {
            conversationId,
            content: aiContent,
          }
        );

        const assistantMessageResponse =
          await Api.post(
            "/api/chat/messages",
            {
              conversationId,
              role: "assistant",
              content: aiContent,
            }
          );

        console.log(
          "💾 AI MESSAGE SAVED:",
          assistantMessageResponse.data
        );

        // ==================================================
        // 8. SHOW AI MESSAGE LOCALLY
        // ==================================================

        const savedAssistantMessage =
          assistantMessageResponse.data?.data
            ?.newMessage ||
          assistantMessageResponse.data?.data?.message ||
          assistantMessageResponse.data?.message;

        dispatch(
          addMessageLocally({
            _id:
              savedAssistantMessage?._id ||
              `local_assistant_${Date.now()}`,

            role: "assistant",

            content: aiContent,

            createdAt:
              savedAssistantMessage?.createdAt ||
              new Date().toISOString(),
          })
        );

        // ==================================================
        // 9. REFRESH SIDEBAR
        // ==================================================

        dispatch(fetchConversations());

        // ==================================================
        // 10. SUCCESS
        // ==================================================

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
          err.response?.data ||
            err.message
        );

        const message =
          err.response?.data?.message ||
          err.message ||
          "Failed to send message";

        setError(message);

        return {
          success: false,
          error: message,
        };
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

  // ======================================================
  // RETURN
  // ======================================================

  return {
    sendMessage,
    sending,
    isCreating,
    error,
  };
};

export default useMessageSend;