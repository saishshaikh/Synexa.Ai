import { useState, useCallback, useEffect } from "react";
import Api from "../utils/axios";

const useGetConversationById = (id) => {
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConversationById = useCallback(async (conversationId) => {
    if (!conversationId) return;

    setLoading(true);
    setError(null);

    try {
      console.log("🔥 Fetching conversation:", conversationId);

      const response = await Api.get(
        `/api/chat/conversations/${conversationId}`
      );

      if (response.data.success) {
        const data =
          response.data.data || response.data.conversation;

        setConversation(data);

        return {
          success: true,
          data,
        };
      }

      const errorMsg =
        response.data.message || "Failed to fetch conversation";

      setError(errorMsg);

      return {
        success: false,
        error: errorMsg,
      };
    } catch (err) {
      console.error(
        `❌ Error fetching conversation ${conversationId}:`,
        err
      );

      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Network error";

      setError(errorMsg);
      setConversation(null);

      return {
        success: false,
        error: errorMsg,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      console.log("🆔 Conversation ID received:", id);
      fetchConversationById(id);
    }
  }, [id, fetchConversationById]);

  const clearConversation = useCallback(() => {
    setConversation(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    conversation,
    loading,
    error,
    fetchConversationById,
    clearConversation,
  };
};

export default useGetConversationById;