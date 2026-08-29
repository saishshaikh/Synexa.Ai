import express from "express";

import {
  createConversation,
  getConversations,
  getConversationById,
  deleteConversation,
  saveMessage,
  getMessagesByConversation,
  getLatestMessages,
  searchMessages,
  getMessageStats,
  deleteMessage,
  getConversationWithMessages,
} from "../controllers/cht.controller.js";

const router = express.Router();

// ==================== CONVERSATION ROUTES ====================

router.post("/conversations", createConversation);

router.get("/conversations", getConversations);

router.get("/conversations/:id", getConversationById);

router.delete("/conversations/:id", deleteConversation);

// ==================== MESSAGE ROUTES ====================

router.post("/messages", saveMessage);

router.get("/messages/:conversationId", getMessagesByConversation);

router.get("/messages/:conversationId/latest", getLatestMessages);

router.get("/messages/:conversationId/search", searchMessages);

router.get("/messages/:conversationId/stats", getMessageStats);

router.delete("/messages/:id", deleteMessage);

// ==================== COMBINED ROUTES ====================

router.get(
  "/conversations/:id/messages",
  getConversationWithMessages
);

export default router;