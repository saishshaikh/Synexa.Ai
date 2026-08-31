// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import conversationReducer from './conversationSlice';
import messageReducer from './messageSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,                 // state.user
    conversations: conversationReducer, // ✅ Plural! (conversationSlice se match)
    messages: messageReducer,          // state.messages
  },
});

export default store;