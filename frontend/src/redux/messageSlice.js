// src/redux/messageSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Api from '../utils/axios';

// 1. FETCH MESSAGES
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await Api.get(`/api/chat/conversations/${conversationId}/messages`);
      const messages = response.data?.data?.messages || [];
      return Array.isArray(messages) ? messages : [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch messages');
    }
  }
);

// 2. SEND MESSAGE (CRITICAL FIX YAHAN HAI!)
export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ conversationId, prompt }, { rejectWithValue }) => {
    try {
      const response = await Api.post('/api/agent/chat', { prompt, conversationId });

      // Backend abhi direct string return kar raha hai (res.status(200).json(response))
      // Agar response string hai, toh use object mein convert karo!
      let assistantContent = response.data;
      
      // Agar backend kabhi object return kare (jaise { data: "..." }), toh wo bhi handle karo
      if (typeof assistantContent === 'object' && assistantContent !== null) {
        assistantContent = assistantContent.data || assistantContent.message || assistantContent.aiResponse || JSON.stringify(assistantContent);
      }

      const assistantMessage = { role: 'assistant', content: assistantContent };
      console.log('🤖 Assistant message:', assistantMessage);
      
      return assistantMessage;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to send message');
    }
  }
);

// 3. INITIAL STATE
const initialState = {
  messages: [],
  loading: false,
  error: null,
  sending: false,
};

// 4. SLICE
const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessages: (state, action) => {
      state.messages = Array.isArray(action.payload) ? action.payload : [];
    },
    clearMessages: (state) => {
      state.messages = [];
      state.loading = false;
      state.error = null;
      state.sending = false;
    },
    addMessageLocally: (state, action) => {
      state.messages.push(action.payload);
    },
    updateMessage: (state, action) => {
      const index = state.messages.findIndex((msg) => msg._id === action.payload._id);
      if (index !== -1) state.messages[index] = action.payload;
    },
    deleteMessage: (state, action) => {
      state.messages = state.messages.filter((msg) => msg._id !== action.payload._id);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMessages.fulfilled, (state, action) => { state.loading = false; state.messages = action.payload; state.error = null; })
      .addCase(fetchMessages.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(sendMessage.pending, (state, action) => {
        state.sending = true;
        state.error = null;
        state.messages.push({ _id: `temp_${Date.now()}`, role: 'user', content: action.meta.arg.prompt, createdAt: new Date().toISOString() });
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sending = false;
        state.error = null;
        state.messages = state.messages.filter((msg) => !String(msg?._id || '').startsWith('temp_'));
        
        // User ka message add karo (kyunki backend sirf assistant message return karta hai)
        state.messages.push({ _id: `user_${Date.now()}`, role: 'user', content: action.meta.arg.prompt, createdAt: new Date().toISOString() });
        // Assistant ka message add karo
        state.messages.push({ ...action.payload, _id: action.payload._id || `assistant_${Date.now()}`, createdAt: new Date().toISOString() });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload || 'Failed to send message';
        state.messages = state.messages.filter((msg) => !String(msg?._id || '').startsWith('temp_'));
      });
  },
});

export const { setMessages, clearMessages, addMessageLocally, updateMessage, deleteMessage } = messageSlice.actions;
export const selectAllMessages = (state) => state.messages?.messages || [];
export const selectMessagesLoading = (state) => state.messages?.loading || false;
export const selectMessageSending = (state) => state.messages?.sending || false;
export const selectMessagesError = (state) => state.messages?.error || null;

export default messageSlice.reducer;