
// frontend/src/redux/messageSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Api from '../utils/axios';

// ============================================
// 1. FETCH MESSAGES
// ============================================

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',

  async (conversationId, { rejectWithValue }) => {
    try {
      console.log(
        '📥 Fetching messages:',
        conversationId
      );

      const response = await Api.get(
        `/api/chat/conversations/${conversationId}/messages`
      );

      console.log(
        '✅ Messages response:',
        response.data
      );

      // Backend response:
      //
      // {
      //   success: true,
      //   data: {
      //     conversation: {...},
      //     messages: [],
      //     totalMessages: 0
      //   }
      // }

      const messages =
        response.data?.data?.messages || [];

      console.log(
        '💬 Actual messages:',
        messages
      );

      return Array.isArray(messages)
        ? messages
        : [];

    } catch (err) {
      console.error(
        '❌ Fetch messages error:',
        err.response?.data || err.message
      );

      return rejectWithValue(
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch messages'
      );
    }
  }
);

// ============================================
// 2. SEND MESSAGE
// ============================================

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',

  async (
    { conversationId, prompt },
    { rejectWithValue }
  ) => {
    try {
      console.log(
        '📤 Sending message from Redux'
      );

      console.log(
        '🆔 Conversation ID:',
        conversationId
      );

      console.log(
        '💬 Prompt:',
        prompt
      );

      const response = await Api.post(
        '/api/agent/chat',
        {
          prompt,
          conversationId,
        }
      );

      console.log(
        '================================'
      );

      console.log(
        '✅ AI RESPONSE RECEIVED'
      );

      console.log(
        '📦 Response data:',
        response.data
      );

      console.log(
        '================================'
      );

      /*
        Expected backend response:

        {
          success: true,
          message: {
            role: "assistant",
            content: "Hello..."
          }
        }
      */

      const assistantMessage =
        response.data?.message ||
        response.data?.data?.message ||
        response.data?.data ||
        response.data;

      console.log(
        '🤖 Assistant message:',
        assistantMessage
      );

      return assistantMessage;

    } catch (err) {
      console.error(
        '================================'
      );

      console.error(
        '❌ SEND MESSAGE ERROR'
      );

      console.error(
        'Status:',
        err.response?.status
      );

      console.error(
        'Response:',
        err.response?.data
      );

      console.error(
        'Message:',
        err.message
      );

      console.error(
        '================================'
      );

      return rejectWithValue(
        err.response?.data?.message ||
        err.message ||
        'Failed to send message'
      );
    }
  }
);

// ============================================
// 3. INITIAL STATE
// ============================================

const initialState = {
  messages: [],
  loading: false,
  error: null,
  sending: false,
};

// ============================================
// 4. SLICE
// ============================================

const messageSlice = createSlice({
  name: 'messages',

  initialState,

  reducers: {
    setMessages: (state, action) => {
      state.messages = Array.isArray(
        action.payload
      )
        ? action.payload
        : [];
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
      const index = state.messages.findIndex(
        (msg) =>
          msg._id === action.payload._id
      );

      if (index !== -1) {
        state.messages[index] =
          action.payload;
      }
    },

    deleteMessage: (state, action) => {
      state.messages =
        state.messages.filter(
          (msg) =>
            msg._id !== action.payload._id
        );
    },
  },

  extraReducers: (builder) => {
    builder

      // ==========================================
      // FETCH MESSAGES
      // ==========================================

      .addCase(
        fetchMessages.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchMessages.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          state.messages =
            Array.isArray(action.payload)
              ? action.payload
              : [];
        }
      )

      .addCase(
        fetchMessages.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            'Failed to fetch messages';
        }
      )

      // ==========================================
      // SEND MESSAGE
      // ==========================================

      .addCase(
        sendMessage.pending,
        (state, action) => {
          state.sending = true;
          state.error = null;

          // Temporary user message
          state.messages.push({
            _id: `temp_${Date.now()}`,
            role: 'user',
            content:
              action.meta.arg.prompt,
            createdAt:
              new Date().toISOString(),
          });
        }
      )

      .addCase(
        sendMessage.fulfilled,
        (state, action) => {
          state.sending = false;
          state.error = null;

          // Remove temporary message
          state.messages =
            state.messages.filter(
              (msg) =>
                !String(
                  msg?._id || ''
                ).startsWith('temp_')
            );

          const payload =
            action.payload;

          console.log(
            '🟢 Redux fulfilled:',
            payload
          );

          if (!payload) {
            return;
          }

          // If backend returned messages array
          if (Array.isArray(payload)) {
            state.messages = payload;
            return;
          }

          // If backend returned assistant message
          if (
            payload.role &&
            payload.content
          ) {
            // Add user message
            state.messages.push({
              _id: `user_${Date.now()}`,
              role: 'user',
              content:
                action.meta.arg.prompt,
              createdAt:
                new Date().toISOString(),
            });

            // Add assistant message
            state.messages.push({
              ...payload,

              _id:
                payload._id ||
                `assistant_${Date.now()}`,

              createdAt:
                payload.createdAt ||
                new Date().toISOString(),
            });

            return;
          }

          // Fallback
          if (
            typeof payload === 'object'
          ) {
            state.messages.push(payload);
          }
        }
      )

      .addCase(
        sendMessage.rejected,
        (state, action) => {
          state.sending = false;

          state.error =
            action.payload ||
            'Failed to send message';

          console.error(
            '🔴 Redux rejected:',
            action.payload
          );

          // Remove temp message
          state.messages =
            state.messages.filter(
              (msg) =>
                !String(
                  msg?._id || ''
                ).startsWith('temp_')
            );
        }
      );
  },
});

// ============================================
// 5. ACTIONS
// ============================================

export const {
  setMessages,
  clearMessages,
  addMessageLocally,
  updateMessage,
  deleteMessage,
} = messageSlice.actions;

// ============================================
// 6. SELECTORS
// ============================================

export const selectAllMessages = (
  state
) =>
  state.messages?.messages || [];

export const selectMessagesLoading = (
  state
) =>
  state.messages?.loading || false;

export const selectMessageSending = (
  state
) =>
  state.messages?.sending || false;

export const selectMessagesError = (
  state
) =>
  state.messages?.error || null;

// ============================================
// 7. REDUCER
// ============================================

export default messageSlice.reducer;
