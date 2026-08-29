// src/redux/messageSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Api from '../utils/axios';

// ✅ 1. Async Thunk: Fetch messages by conversation ID
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await Api.get(`/api/conversations/${conversationId}/messages`);
      if (response.data.success) {
        return response.data.data || [];
      } else {
        return rejectWithValue(response.data.message || 'Failed to fetch messages');
      }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Network error');
    }
  }
);

// ✅ 2. Async Thunk: Send a new message
export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ conversationId, content }, { rejectWithValue }) => {
    try {
      const response = await Api.post(`/api/conversations/${conversationId}/messages`, { content });
      if (response.data.success) {
        return response.data.data; // Return the new message object
      } else {
        return rejectWithValue(response.data.message || 'Failed to send message');
      }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Network error');
    }
  }
);

// ✅ 3. Initial State
const initialState = {
  messages: [],
  loading: false,
  error: null,
  sending: false,
};

// ✅ 4. Slice
const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    // ✅ Local state manage karne ke liye (e.g., current conversation change hone par)
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.loading = false;
      state.error = null;
      state.sending = false;
    },
    // ✅ User ne type karke message bheja (optimistic update)
    addMessageLocally: (state, action) => {
      state.messages.push(action.payload);
    },
    // ✅ Edit ya delete ke liye (agar future mein zaroorat pade)
    updateMessage: (state, action) => {
      const index = state.messages.findIndex((msg) => msg.id === action.payload.id);
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
    },
    deleteMessage: (state, action) => {
      state.messages = state.messages.filter((msg) => msg.id !== action.payload.id);
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Fetch Messages
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch messages';
      })
      
      // ✅ Send Message
      .addCase(sendMessage.fulfilled, (state, action) => {
        // Naya message server se aaya, use list mein add karo
        state.messages.push(action.payload);
        state.sending = false;
        state.error = null;
      })
      .addCase(sendMessage.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload || 'Failed to send message';
      });
  },
});

// ✅ 5. Export Actions
export const { 
  setMessages, 
  clearMessages, 
  addMessageLocally, 
  updateMessage, 
  deleteMessage 
} = messageSlice.actions;

// ✅ 6. Export Reducer
export default messageSlice.reducer;