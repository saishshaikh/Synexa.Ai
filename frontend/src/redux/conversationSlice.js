// src/redux/conversationSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Api from "../utils/axios";

// ==================== INITIAL STATE ====================

const initialState = {
  conversations: [],
  currentConversation: null,
  loading: false,
  error: null,
  success: false,
  totalCount: 0,
};

// ==================== HELPERS ====================

const getConversationId = (conversation) => {
  return conversation?._id || conversation?.id;
};

const normalizeConversation = (conversation) => {
  if (!conversation) return null;

  return {
    ...conversation,
    _id: conversation._id || conversation.id,
    id: conversation.id || conversation._id,
    messages: Array.isArray(conversation.messages)
      ? conversation.messages
      : [],
  };
};

// ==================== ASYNC THUNKS ====================

// 1. GET ALL CONVERSATIONS

export const fetchConversations = createAsyncThunk(
  "conversations/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await Api.get("/api/chat/conversations");

      if (response.data.success) {
        const conversations =
          response.data.data ||
          response.data.conversations ||
          [];

        return conversations.map(normalizeConversation);
      }

      return rejectWithValue(
        response.data.message || "Failed to fetch conversations"
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// 2. CREATE CONVERSATION

export const createConversation = createAsyncThunk(
  "conversations/create",
  async (data = {}, { rejectWithValue }) => {
    try {
      const response = await Api.post(
        "/api/chat/conversations",
        data
      );

      if (response.data.success) {
        return normalizeConversation(
          response.data.data || response.data.conversation
        );
      }

      return rejectWithValue(
        response.data.message || "Failed to create conversation"
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// 3. GET SINGLE CONVERSATION + MESSAGES

export const fetchConversationById = createAsyncThunk(
  "conversations/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      // Backend controller:
      // getConversationWithMessages

      const response = await Api.get(
        `/api/chat/conversations/${id}/messages`
      );

      if (response.data.success) {
        const data = response.data.data;

        // Expected:
        // {
        //   conversation,
        //   messages,
        //   totalMessages
        // }

        return normalizeConversation({
          ...data.conversation,
          messages: data.messages || [],
          totalMessages: data.totalMessages || 0,
        });
      }

      return rejectWithValue(
        response.data.message || "Failed to fetch conversation"
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// 4. UPDATE CONVERSATION

export const updateConversation = createAsyncThunk(
  "conversations/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await Api.put(
        `/api/chat/conversations/${id}`,
        data
      );

      if (response.data.success) {
        return normalizeConversation(
          response.data.data || response.data.conversation
        );
      }

      return rejectWithValue(
        response.data.message || "Failed to update conversation"
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// 5. DELETE CONVERSATION

export const deleteConversation = createAsyncThunk(
  "conversations/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await Api.delete(
        `/api/chat/conversations/${id}`
      );

      if (response.data.success) {
        return id;
      }

      return rejectWithValue(
        response.data.message || "Failed to delete conversation"
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// ==================== SLICE ====================

const conversationSlice = createSlice({
  name: "conversations",

  initialState,

  reducers: {
    // Set current conversation
    setCurrentConversation: (state, action) => {
      state.currentConversation = normalizeConversation(
        action.payload
      );
    },

    // Clear current conversation
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetConversationState: () => initialState,

    // Add message to current conversation
    addMessageToConversation: (state, action) => {
      if (!state.currentConversation) return;

      if (!Array.isArray(state.currentConversation.messages)) {
        state.currentConversation.messages = [];
      }

      const newMessage = action.payload;

      const messageId =
        newMessage?._id || newMessage?.id;

      // Prevent duplicate messages
      const alreadyExists =
        messageId &&
        state.currentConversation.messages.some(
          (message) =>
            (message._id || message.id) === messageId
        );

      if (!alreadyExists) {
        state.currentConversation.messages.push(newMessage);
      }
    },

    // Update conversation in sidebar
    updateConversationInList: (state, action) => {
      const updatedConversation =
        normalizeConversation(action.payload);

      const updatedId =
        getConversationId(updatedConversation);

      const index = state.conversations.findIndex(
        (conversation) =>
          getConversationId(conversation) === updatedId
      );

      if (index !== -1) {
        state.conversations[index] = {
          ...state.conversations[index],
          ...updatedConversation,
        };
      }
    },

    // Remove duplicate conversations
    removeDuplicateConversations: (state) => {
      const unique = [];
      const ids = new Set();

      for (const conversation of state.conversations) {
        const id = getConversationId(conversation);

        if (!id || !ids.has(id)) {
          unique.push(conversation);

          if (id) {
            ids.add(id);
          }
        }
      }

      state.conversations = unique;
      state.totalCount = unique.length;
    },
  },

  // ==================== EXTRA REDUCERS ====================

  extraReducers: (builder) => {
    builder

      // ==================== FETCH ALL ====================

      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;

        const conversations = action.payload || [];

        // Remove duplicate conversations
        const unique = [];
        const ids = new Set();

        for (const conversation of conversations) {
          const id = getConversationId(conversation);

          if (!id || !ids.has(id)) {
            unique.push(conversation);

            if (id) {
              ids.add(id);
            }
          }
        }

        state.conversations = unique;
        state.totalCount = unique.length;
        state.error = null;
      })

      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to fetch conversations";
      })

      // ==================== CREATE ====================

      .addCase(createConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(createConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const newConversation = action.payload;

        if (newConversation) {
          const newId = getConversationId(newConversation);

          const exists = state.conversations.some(
            (conversation) =>
              getConversationId(conversation) === newId
          );

          if (!exists) {
            state.conversations.unshift(newConversation);
          }

          state.currentConversation = newConversation;
        }

        state.totalCount = state.conversations.length;
        state.error = null;
      })

      .addCase(createConversation.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error =
          action.payload || "Failed to create conversation";
      })

      // ==================== FETCH SINGLE + MESSAGES ====================

      .addCase(fetchConversationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchConversationById.fulfilled, (state, action) => {
        state.loading = false;

        const conversation = action.payload;

        if (conversation) {
          state.currentConversation = conversation;

          const conversationId =
            getConversationId(conversation);

          const index = state.conversations.findIndex(
            (item) =>
              getConversationId(item) === conversationId
          );

          if (index !== -1) {
            state.conversations[index] = {
              ...state.conversations[index],
              ...conversation,
            };
          }
        }

        state.error = null;
      })

      .addCase(fetchConversationById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to fetch conversation";
      })

      // ==================== UPDATE ====================

      .addCase(updateConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const updatedConversation = action.payload;

        if (updatedConversation) {
          const updatedId =
            getConversationId(updatedConversation);

          const index = state.conversations.findIndex(
            (conversation) =>
              getConversationId(conversation) === updatedId
          );

          if (index !== -1) {
            state.conversations[index] = {
              ...state.conversations[index],
              ...updatedConversation,
            };
          }

          if (
            getConversationId(state.currentConversation) ===
            updatedId
          ) {
            state.currentConversation = {
              ...state.currentConversation,
              ...updatedConversation,
            };
          }
        }

        state.error = null;
      })

      .addCase(updateConversation.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error =
          action.payload || "Failed to update conversation";
      })

      // ==================== DELETE ====================

      .addCase(deleteConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const deletedId = action.payload;

        state.conversations = state.conversations.filter(
          (conversation) =>
            getConversationId(conversation) !== deletedId
        );

        state.totalCount = state.conversations.length;

        if (
          getConversationId(state.currentConversation) ===
          deletedId
        ) {
          state.currentConversation = null;
        }

        state.error = null;
      })

      .addCase(deleteConversation.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error =
          action.payload || "Failed to delete conversation";
      });
  },
});

// ==================== ACTIONS ====================

export const {
  setCurrentConversation,
  clearCurrentConversation,
  clearError,
  resetConversationState,
  addMessageToConversation,
  updateConversationInList,
  removeDuplicateConversations,
} = conversationSlice.actions;

// ==================== SELECTORS ====================

export const selectAllConversations = (state) =>
  state.conversations.conversations;

export const selectCurrentConversation = (state) =>
  state.conversations.currentConversation;

export const selectConversationsLoading = (state) =>
  state.conversations.loading;

export const selectConversationsError = (state) =>
  state.conversations.error;

export const selectConversationsSuccess = (state) =>
  state.conversations.success;

export const selectTotalConversations = (state) =>
  state.conversations.totalCount;

// ==================== DEFAULT EXPORT ====================

export default conversationSlice.reducer;