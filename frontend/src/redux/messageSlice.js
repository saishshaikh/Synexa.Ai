// src/redux/messageSlice.js

import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import Api from "../utils/axios";

// ======================================================
// FETCH MESSAGES
// ======================================================

export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",

  async (conversationId, { rejectWithValue }) => {
    try {
      if (!conversationId) {
        return rejectWithValue(
          "Conversation ID is required"
        );
      }

      console.log(
        "🔥 API FETCH MESSAGES:",
        conversationId
      );

      const response = await Api.get(
        `/api/chat/conversations/${conversationId}/messages`
      );

      console.log(
        "📦 MESSAGES API RESPONSE:",
        response.data
      );

      const body = response.data;

      if (!body?.success) {
        return rejectWithValue(
          body?.message ||
            "Failed to fetch messages"
        );
      }

      let messages = [];

      // ==================================================
      // { success: true, data: { conversation, messages } }
      // ==================================================

      if (
        Array.isArray(
          body?.data?.messages
        )
      ) {
        messages =
          body.data.messages;
      }

      // ==================================================
      // { success: true, messages: [] }
      // ==================================================

      else if (
        Array.isArray(body?.messages)
      ) {
        messages =
          body.messages;
      }

      // ==================================================
      // { success: true, data: [] }
      // ==================================================

      else if (
        Array.isArray(body?.data)
      ) {
        messages =
          body.data;
      }

      console.log(
        "✅ EXTRACTED MESSAGES:",
        messages
      );

      return {
        conversationId,
        messages,
      };

    } catch (err) {
      console.error(
        "❌ FETCH MESSAGES ERROR:",
        err.response?.data ||
          err.message
      );

      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch messages"
      );
    }
  },

  // ====================================================
  // PREVENT DUPLICATE FETCH
  // ====================================================

  {
    condition: (
      conversationId,
      { getState }
    ) => {

      if (!conversationId) {
        return false;
      }

      const state =
        getState().messages;

      // Already fetching this conversation
      if (
        state.loading &&
        state.currentConversationId ===
          conversationId
      ) {
        console.log(
          "⏭️ BLOCKED DUPLICATE REQUEST:",
          conversationId
        );

        return false;
      }

      // Already loaded this conversation
      if (
        state.currentConversationId ===
          conversationId &&
        state.loaded === true
      ) {
        console.log(
          "⏭️ ALREADY LOADED:",
          conversationId
        );

        return false;
      }

      return true;
    },
  }
);

// ======================================================
// INITIAL STATE
// ======================================================

const initialState = {
  messages: [],

  loading: false,

  error: null,

  sending: false,

  currentConversationId: null,

  loaded: false,
};

// ======================================================
// SLICE
// ======================================================

const messageSlice = createSlice({

  name: "messages",

  initialState,

  reducers: {

    // ==================================================
    // SET MESSAGES
    // ==================================================

    setMessages: (
      state,
      action
    ) => {

      const incomingMessages =
        Array.isArray(action.payload)
          ? action.payload
          : [];

      // Remove duplicate messages
      const uniqueMessages = [];
      const seenIds = new Set();

      incomingMessages.forEach(
        (message, index) => {

          const id =
            message?._id ||
            message?.id ||
            `message-${index}`;

          if (!seenIds.has(id)) {
            seenIds.add(id);
            uniqueMessages.push(
              message
            );
          }
        }
      );

      state.messages =
        uniqueMessages;

      state.loaded = true;
    },

    // ==================================================
    // CLEAR MESSAGES
    // ==================================================

    clearMessages: (state) => {

      state.messages = [];

      state.loading = false;

      state.error = null;

      state.sending = false;

      state.currentConversationId =
        null;

      state.loaded = false;
    },

    // ==================================================
    // ADD MESSAGE LOCALLY
    // ==================================================

    addMessageLocally: (
      state,
      action
    ) => {

      const newMessage =
        action.payload;

      if (!newMessage) {
        return;
      }

      const newMessageId =
        newMessage?._id ||
        newMessage?.id;

      // --------------------------------------------------
      // Prevent duplicate ID
      // --------------------------------------------------

      if (newMessageId) {

        const alreadyExists =
          state.messages.some(
            (message) =>
              message?._id ===
                newMessageId ||
              message?.id ===
                newMessageId
          );

        if (alreadyExists) {
          console.log(
            "⏭️ DUPLICATE MESSAGE BLOCKED:",
            newMessageId
          );

          return;
        }
      }

      // --------------------------------------------------
      // Extra protection for temporary messages
      // --------------------------------------------------

      const duplicateContent =
        state.messages.some(
          (message) =>
            message?.role ===
              newMessage?.role &&
            message?.content ===
              newMessage?.content &&
            message?.createdAt ===
              newMessage?.createdAt
        );

      if (duplicateContent) {
        console.log(
          "⏭️ DUPLICATE CONTENT BLOCKED"
        );

        return;
      }

      state.messages.push(
        newMessage
      );
    },

    // ==================================================
    // UPDATE MESSAGE
    // ==================================================

    updateMessage: (
      state,
      action
    ) => {

      const updatedMessage =
        action.payload;

      const messageId =
        updatedMessage?._id ||
        updatedMessage?.id;

      const index =
        state.messages.findIndex(
          (message) =>
            message?._id ===
              messageId ||
            message?.id ===
              messageId
        );

      if (index !== -1) {
        state.messages[index] =
          updatedMessage;
      }
    },

    // ==================================================
    // DELETE MESSAGE
    // ==================================================

    deleteMessage: (
      state,
      action
    ) => {

      const messageId =
        action.payload?._id ||
        action.payload?.id ||
        action.payload;

      state.messages =
        state.messages.filter(
          (message) =>
            message?._id !==
              messageId &&
            message?.id !==
              messageId
        );
    },
  },

  // ====================================================
  // ASYNC ACTIONS
  // ====================================================

  extraReducers: (builder) => {

    builder

      // ================================================
      // FETCH PENDING
      // ================================================

      .addCase(
        fetchMessages.pending,
        (
          state,
          action
        ) => {

          state.loading = true;

          state.error = null;

          state.loaded = false;

          state.currentConversationId =
            action.meta.arg;

          // IMPORTANT:
          // Remove previous conversation messages
          state.messages = [];

          console.log(
            "⏳ FETCH PENDING:",
            action.meta.arg
          );
        }
      )

      // ================================================
      // FETCH SUCCESS
      // ================================================

      .addCase(
        fetchMessages.fulfilled,
        (
          state,
          action
        ) => {

          const {
            conversationId,
            messages,
          } = action.payload;

          // ------------------------------------------------
          // IMPORTANT:
          // If user already switched to another chat,
          // ignore old API response.
          // ------------------------------------------------

          if (
            state.currentConversationId !==
            conversationId
          ) {

            console.log(
              "⏭️ IGNORING OLD FETCH RESPONSE:",
              conversationId
            );

            return;
          }

          // ------------------------------------------------
          // Remove duplicate messages from API
          // ------------------------------------------------

          const uniqueMessages = [];
          const seenIds = new Set();

          (
            Array.isArray(messages)
              ? messages
              : []
          ).forEach(
            (message, index) => {

              const id =
                message?._id ||
                message?.id ||
                `message-${index}`;

              if (!seenIds.has(id)) {

                seenIds.add(id);

                uniqueMessages.push(
                  message
                );
              }
            }
          );

          state.loading = false;

          state.error = null;

          state.currentConversationId =
            conversationId;

          state.messages =
            uniqueMessages;

          state.loaded = true;

          console.log(
            "✅ FETCH SUCCESS:",
            conversationId,
            uniqueMessages
          );
        }
      )

      // ================================================
      // FETCH ERROR
      // ================================================

      .addCase(
        fetchMessages.rejected,
        (
          state,
          action
        ) => {

          state.loading = false;

          state.messages = [];

          state.loaded = false;

          state.error =
            action.payload ||
            "Failed to fetch messages";

          console.error(
            "❌ FETCH REJECTED:",
            action.payload
          );
        }
      );
  },
});

// ======================================================
// ACTIONS
// ======================================================

export const {
  setMessages,
  clearMessages,
  addMessageLocally,
  updateMessage,
  deleteMessage,
} =
  messageSlice.actions;

// ======================================================
// SELECTORS
// ======================================================

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

export const selectCurrentMessagesConversationId =
  (state) =>
    state.messages
      ?.currentConversationId ||
    null;

export const selectMessagesLoaded = (
  state
) =>
  state.messages?.loaded || false;

// ======================================================
// REDUCER
// ======================================================

export default messageSlice.reducer;