// src/redux/conversationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Api from '../utils/axios';

// ✅ Initial State
const initialState = {
  conversations: [],
  currentConversation: null,
  loading: false,
  error: null,
  success: false,
  totalCount: 0,
};

// ✅ Async Thunks

// 1. GET ALL CONVERSATIONS
export const fetchConversations = createAsyncThunk(
  'conversations/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await Api.get('/api/chat/conversations');
      if (response.data.success) {
        return response.data.data || response.data.conversations || [];
      } else {
        return rejectWithValue(response.data.message || 'Failed to fetch conversations');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 2. CREATE CONVERSATION
export const createConversation = createAsyncThunk(
  'conversations/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await Api.post('/api/chat/conversations', data);
      if (response.data.success) {
        return response.data.data || response.data.conversation;
      } else {
        return rejectWithValue(response.data.message || 'Failed to create conversation');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 3. GET SINGLE CONVERSATION
export const fetchConversationById = createAsyncThunk(
  'conversations/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await Api.get(`/api/chat/conversations/${id}`);
      if (response.data.success) {
        return response.data.data || response.data.conversation;
      } else {
        return rejectWithValue(response.data.message || 'Failed to fetch conversation');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 4. UPDATE CONVERSATION
export const updateConversation = createAsyncThunk(
  'conversations/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await Api.put(`/api/chat/conversations/${id}`, data);
      if (response.data.success) {
        return response.data.data || response.data.conversation;
      } else {
        return rejectWithValue(response.data.message || 'Failed to update conversation');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 5. DELETE CONVERSATION
export const deleteConversation = createAsyncThunk(
  'conversations/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await Api.delete(`/api/chat/conversations/${id}`);
      if (response.data.success) {
        return id;
      } else {
        return rejectWithValue(response.data.message || 'Failed to delete conversation');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ✅ Slice
const conversationSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetConversationState: () => initialState,
    addMessageToConversation: (state, action) => {
      if (state.currentConversation) {
        if (!state.currentConversation.messages) {
          state.currentConversation.messages = [];
        }
        state.currentConversation.messages.push(action.payload);
      }
    },
    updateConversationInList: (state, action) => {
      const index = state.conversations.findIndex(
        conv => conv._id === action.payload._id || conv.id === action.payload.id
      );
      if (index !== -1) {
        state.conversations[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
        state.totalCount = action.payload.length;
        state.error = null;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch conversations';
      })

      .addCase(createConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.conversations.unshift(action.payload);
        state.currentConversation = action.payload;
        state.totalCount = state.conversations.length;
        state.error = null;
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || 'Failed to create conversation';
      })

      .addCase(fetchConversationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentConversation = action.payload;
        state.error = null;
      })
      .addCase(fetchConversationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch conversation';
      })

      .addCase(updateConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.conversations.findIndex(
          conv => conv._id === action.payload._id || conv.id === action.payload.id
        );
        if (index !== -1) {
          state.conversations[index] = action.payload;
        }
        if (state.currentConversation?._id === action.payload._id || state.currentConversation?.id === action.payload.id) {
          state.currentConversation = action.payload;
        }
        state.error = null;
      })
      .addCase(updateConversation.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || 'Failed to update conversation';
      })

      .addCase(deleteConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.conversations = state.conversations.filter(
          conv => conv._id !== action.payload && conv.id !== action.payload
        );
        state.totalCount = state.conversations.length;
        if (state.currentConversation?._id === action.payload || state.currentConversation?.id === action.payload) {
          state.currentConversation = null;
        }
        state.error = null;
      })
      .addCase(deleteConversation.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || 'Failed to delete conversation';
      });
  },
});

// ✅ Export Actions
export const {
  setCurrentConversation,
  clearCurrentConversation,
  clearError,
  resetConversationState,
  addMessageToConversation,
  updateConversationInList,
} = conversationSlice.actions;

// ✅ Export Selectors
export const selectAllConversations = (state) => state.conversations.conversations;
export const selectCurrentConversation = (state) => state.conversations.currentConversation;
export const selectConversationsLoading = (state) => state.conversations.loading;
export const selectConversationsError = (state) => state.conversations.error;
export const selectConversationsSuccess = (state) => state.conversations.success;
export const selectTotalConversations = (state) => state.conversations.totalCount;

// ✅ EXPORT DEFAULT REDUCER (Sabse Zaroori!)
export default conversationSlice.reducer;