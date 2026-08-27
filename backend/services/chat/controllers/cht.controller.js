import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

// ==================== CONVERSATION CONTROLLERS ====================

/**
 * Create a new conversation
 * @route POST /api/conversations
 */
export const createConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    console.log("Creating conversation for userId:", userId);
    
    const conversation = await Conversation.create({
      userId: userId
    });

    return res.status(201).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error("Create conversation error:", error);
    return res.status(500).json({ 
      success: false,
      message: `Create conversation error: ${error.message}` 
    });
  }
};

/**
 * Get all conversations for a user (latest first)
 * @route GET /api/conversations
 */
export const getConversations = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    console.log("Fetching conversations for userId:", userId);
    
    const conversations = await Conversation.find({
      userId: userId
    }).sort({ updatedAt: -1 }); // Latest first

    return res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    return res.status(500).json({ 
      success: false,
      message: `Get conversations error: ${error.message}` 
    });
  }
};

/**
 * Get a single conversation by ID
 * @route GET /api/conversations/:id
 */
export const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const conversation = await Conversation.findOne({
      _id: id,
      userId: userId
    });

    if (!conversation) {
      return res.status(404).json({ 
        success: false,
        message: "Conversation not found" 
      });
    }

    return res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error("Get conversation by ID error:", error);
    return res.status(500).json({ 
      success: false,
      message: `Get conversation error: ${error.message}` 
    });
  }
};

/**
 * Delete a conversation
 * @route DELETE /api/conversations/:id
 */
export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const conversation = await Conversation.findOneAndDelete({
      _id: id,
      userId: userId
    });

    if (!conversation) {
      return res.status(404).json({ 
        success: false,
        message: "Conversation not found" 
      });
    }

    // Also delete all messages in this conversation
    await Message.deleteMany({ conversationId: id });

    return res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
      data: conversation
    });
  } catch (error) {
    console.error("Delete conversation error:", error);
    return res.status(500).json({ 
      success: false,
      message: `Delete conversation error: ${error.message}` 
    });
  }
};

// ==================== MESSAGE CONTROLLERS ====================

/**
 * Save a new message - Returns all messages with latest first
 * @route POST /api/messages
 */
export const saveMessage = async (req, res) => {
  try {
    const { conversationId, role, content } = req.body;
    const userId = req.headers["x-user-id"];

    // Validation
    if (!conversationId || !role || !content) {
      return res.status(400).json({ 
        success: false,
        message: "conversationId, role, and content are required" 
      });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Verify conversation exists and belongs to user
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: userId
    });

    if (!conversation) {
      return res.status(404).json({ 
        success: false,
        message: "Conversation not found or unauthorized" 
      });
    }

    // Create new message
    const message = await Message.create({
      content,
      conversationId,
      role,
      createdAt: new Date()
    });

    // Update conversation's updatedAt timestamp
    await Conversation.findByIdAndUpdate(conversationId, {
      updatedAt: new Date()
    });

    // Get ALL messages for this conversation sorted by LATEST FIRST
    const allMessages = await Message.find({
      conversationId: conversationId
    }).sort({ createdAt: -1 }); // -1 = newest first

    return res.status(201).json({
      success: true,
      data: {
        newMessage: message,
        allMessages: allMessages, // Latest message at index 0
        count: allMessages.length
      }
    });
  } catch (error) {
    console.error("Save message error:", error);
    return res.status(500).json({ 
      success: false,
      message: `Save message error: ${error.message}` 
    });
  }
};

/**
 * Get all messages for a conversation (latest first)
 * @route GET /api/messages/:conversationId
 */
export const getMessagesByConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Verify conversation belongs to user
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: userId
    });

    if (!conversation) {
      return res.status(404).json({ 
        success: false,
        message: "Conversation not found or unauthorized" 
      });
    }

    // Get messages sorted by LATEST FIRST
    const messages = await Message.find({
      conversationId: conversationId
    }).sort({ createdAt: -1 }); // -1 = newest first

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages // Latest message at index 0
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({ 
      success: false,
      message: `Get messages error: ${error.message}` 
    });
  }
};

/**
 * Get latest N messages for a conversation
 * @route GET /api/messages/:conversationId/latest
 */
export const getLatestMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 10 } = req.query; // Default to 10 messages
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Verify conversation belongs to user
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: userId
    });

    if (!conversation) {
      return res.status(404).json({ 
        success: false,
        message: "Conversation not found or unauthorized" 
      });
    }

    const messages = await Message.find({
      conversationId: conversationId
    })
    .sort({ createdAt: -1 }) // Newest first
    .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages // Latest messages first
    });
  } catch (error) {
    console.error("Get latest messages error:", error);
    return res.status(500).json({ 
      success: false,
      message: `Get latest messages error: ${error.message}` 
    });
  }
};

/**
 * Delete a single message
 * @route DELETE /api/messages/:id
 */
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find message and verify it belongs to user's conversation
    const message = await Message.findById(id);
    
    if (!message) {
      return res.status(404).json({ 
        success: false,
        message: "Message not found" 
      });
    }

    const conversation = await Conversation.findOne({
      _id: message.conversationId,
      userId: userId
    });

    if (!conversation) {
      return res.status(403).json({ 
        success: false,
        message: "Unauthorized to delete this message" 
      });
    }

    await Message.findByIdAndDelete(id);

    // Get remaining messages sorted by latest first
    const remainingMessages = await Message.find({
      conversationId: message.conversationId
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
      data: {
        deletedMessageId: id,
        remainingMessages: remainingMessages,
        count: remainingMessages.length
      }
    });
  } catch (error) {
    console.error("Delete message error:", error);
    return res.status(500).json({ 
      success: false,
      message: `Delete message error: ${error.message}` 
    });
  }
};

// ==================== UTILITY CONTROLLERS ====================

/**
 * Get conversation with all its messages (messages latest first)
 * @route GET /api/conversations/:id/messages
 */
export const getConversationWithMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const conversation = await Conversation.findOne({
      _id: id,
      userId: userId
    });

    if (!conversation) {
      return res.status(404).json({ 
        success: false,
        message: "Conversation not found" 
      });
    }

    const messages = await Message.find({
      conversationId: id
    }).sort({ createdAt: -1 }); // Latest first

    return res.status(200).json({
      success: true,
      data: {
        conversation: conversation,
        messages: messages, // Latest message at index 0
        totalMessages: messages.length
      }
    });
  } catch (error) {
    console.error("Get conversation with messages error:", error);
    return res.status(500).json({ 
      success: false,
      message: `Error: ${error.message}` 
    });
  }
};

/**
 * Search messages in a conversation (latest first)
 * @route GET /api/messages/:conversationId/search
 */
export const searchMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { query } = req.query;
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!query) {
      return res.status(400).json({ 
        success: false,
        message: "Search query is required" 
      });
    }

    // Verify conversation belongs to user
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: userId
    });

    if (!conversation) {
      return res.status(404).json({ 
        success: false,
        message: "Conversation not found or unauthorized" 
      });
    }

    const messages = await Message.find({
      conversationId: conversationId,
      content: { $regex: query, $options: 'i' } // Case-insensitive search
    }).sort({ createdAt: -1 }); // Latest first

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages // Latest matching messages first
    });
  } catch (error) {
    console.error("Search messages error:", error);
    return res.status(500).json({ 
      success: false,
      message: `Search messages error: ${error.message}` 
    });
  }
};

/**
 * Get message statistics for a conversation
 * @route GET /api/messages/:conversationId/stats
 */
export const getMessageStats = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Verify conversation belongs to user
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: userId
    });

    if (!conversation) {
      return res.status(404).json({ 
        success: false,
        message: "Conversation not found or unauthorized" 
      });
    }

    const totalMessages = await Message.countDocuments({ conversationId });
    const userMessages = await Message.countDocuments({ 
      conversationId, 
      role: 'user' 
    });
    const assistantMessages = await Message.countDocuments({ 
      conversationId, 
      role: 'assistant' 
    });

    return res.status(200).json({
      success: true,
      data: {
        conversationId,
        totalMessages,
        userMessages,
        assistantMessages,
        lastUpdated: conversation.updatedAt
      }
    });
  } catch (error) {
    console.error("Get message stats error:", error);
    return res.status(500).json({ 
      success: false,
      message: `Get message stats error: ${error.message}` 
    });
  }
};