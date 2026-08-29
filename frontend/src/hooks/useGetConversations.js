// hooks/useGetConversations.js

import { useState, useEffect, useCallback } from "react";
import Api from "../utils/axios";

const useGetConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refetchTrigger, setRefetchTrigger] = useState(false);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await Api.get("/api/chat/conversations");

      console.log("✅ Conversations fetched:", response.data);

      if (response.data.success) {
        const data =
          response.data.data ||
          response.data.conversations ||
          [];

        setConversations(Array.isArray(data) ? data : []);
      } else {
        setError(
          response.data.message || "Failed to fetch conversations"
        );
        setConversations([]);
      }
    } catch (err) {
      console.error("❌ Error fetching conversations:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Network error"
      );

      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto fetch
  useEffect(() => {
    fetchConversations();
  }, [refetchTrigger, fetchConversations]);

  // Refetch
  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => !prev);
  }, []);

  // Reset
  const reset = useCallback(() => {
    setConversations([]);
    setError(null);
    setLoading(false);
  }, []);

  return {
    conversations,
    loading,
    error,
    refetch,
    fetchConversations,
    reset,
    hasConversations: conversations.length > 0,
    totalCount: conversations.length,
  };
};

export default useGetConversations;