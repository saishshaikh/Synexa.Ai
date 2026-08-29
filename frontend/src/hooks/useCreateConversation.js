// hooks/useCreateConversation.js
import { useState, useCallback } from 'react';
import Api from '../utils/axios';

const useCreateConversation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [success, setSuccess] = useState(false);

  // ✅ Create conversation function
  const createConversation = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // ✅ Default data if not provided
      const requestData = {
        title: data?.title || 'New Conversation',
        agent: data?.agent || 'chat',
        ...data
      };

      const response = await Api.post('/api/conversations', requestData);
      console.log('✅ Conversation created:', response.data);
      
      if (response.data.success) {
        const newConversation = response.data.data || response.data.conversation;
        setConversation(newConversation);
        setSuccess(true);
        
        return {
          success: true,
          data: newConversation,
          message: response.data.message || 'Conversation created successfully'
        };
      } else {
        const errorMsg = response.data.message || 'Failed to create conversation';
        setError(errorMsg);
        setSuccess(false);
        
        return {
          success: false,
          error: errorMsg,
          data: null
        };
      }
    } catch (err) {
      console.error('❌ Error creating conversation:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Network error';
      setError(errorMsg);
      setSuccess(false);
      setConversation(null);
      
      return {
        success: false,
        error: errorMsg,
        data: null
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Reset function
  const reset = useCallback(() => {
    setConversation(null);
    setError(null);
    setLoading(false);
    setSuccess(false);
  }, []);

  return {
    createConversation,  // Function to create conversation
    conversation,        // Created conversation data
    loading,            // Boolean - loading state
    error,              // String - error message
    success,            // Boolean - success state
    reset,              // Function - reset state
  };
};

export default useCreateConversation;