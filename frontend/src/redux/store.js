// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import conversationReducer from './conversationSlice';
import messageReducer from './messageSlice'; // ✅ Import karein

export const store = configureStore({
  reducer: {
    user: userReducer,                 // state.user
    conversation: conversationReducer, // ✅ state.conversation (Singular, sahi naam)
    messages: messageReducer,          // state.messages
  },
});

export default store;