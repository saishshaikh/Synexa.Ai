import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

// ==================== CONVERSATION CONTROLLERS ====================

// Create a new conversation
export const createConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const conversation = await Conversation.create({
      user: userId,
      title: req.body?.title || "New Conversation",
    });

    return res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Create conversation error:", error);

    return res.status(500).json({
      success: false,
      message: `Create conversation error: ${error.message}`,
    });
  }
};

// Get all conversations for a user
export const getConversations = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const conversations = await Conversation.find({
      user: userId,
    }).sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);

    return res.status(500).json({
      success: false,
      message: `Get conversations error: ${error.message}`,
    });
  }
};

// Get a single conversation
export const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const conversation = await Conversation.findOne({
      _id: id,
      user: userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Get conversation by ID error:", error);

    return res.status(500).json({
      success: false,
      message: `Get conversation error: ${error.message}`,
    });
  }
};

// Delete a conversation
export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const conversation = await Conversation.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Delete all messages belonging to this conversation
    await Message.deleteMany({
      conversation: id,
    });

    return res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
      data: conversation,
    });
  } catch (error) {
    console.error("Delete conversation error:", error);

    return res.status(500).json({
      success: false,
      message: `Delete conversation error: ${error.message}`,
    });
  }
};

// ==================== MESSAGE CONTROLLERS ====================

// Save a new message
export const saveMessage = async (req, res) => {
  try {
    const { conversationId, role, content } = req.body;
    const userId = req.headers["x-user-id"];

    console.log("Saving message:", {
      conversationId,
      role,
      content,
      sender: userId,
    });

    if (!conversationId || !role || !content) {
      return res.status(400).json({
        success: false,
        message: "conversationId, role, and content are required",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Verify conversation belongs to user
    const conversation = await Conversation.findOne({
      _id: conversationId,
      user: userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or unauthorized",
      });
    }

    // IMPORTANT:
    // Message model expects "conversation", not "conversationId"
    const message = await Message.create({
      sender: userId,
      conversation: conversationId,
      role,
      content: content.trim(),
      createdAt: new Date(),
    });

    // Update conversation timestamp
    await Conversation.findByIdAndUpdate(conversationId, {
      updatedAt: new Date(),
    });

    // Get all messages
    const allMessages = await Message.find({
      conversation: conversationId,
    }).sort({ createdAt: -1 });

    return res.status(201).json({
      success: true,
      data: {
        newMessage: message,
        allMessages,
        count: allMessages.length,
      },
    });
  } catch (error) {
    console.error("Save message error:", error);

    return res.status(500).json({
      success: false,
      message: `Save message error: ${error.message}`,
    });
  }
};

// Get all messages for a conversation
export const getMessagesByConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      user: userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or unauthorized",
      });
    }

    const messages = await Message.find({
      conversation: conversationId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);

    return res.status(500).json({
      success: false,
      message: `Get messages error: ${error.message}`,
    });
  }
};

// Get latest N messages
export const getLatestMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 10 } = req.query;
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      user: userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or unauthorized",
      });
    }

    const messages = await Message.find({
      conversation: conversationId,
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("Get latest messages error:", error);

    return res.status(500).json({
      success: false,
      message: `Get latest messages error: ${error.message}`,
    });
  }
};

// Delete a single message
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const conversation = await Conversation.findOne({
      _id: message.conversation,
      user: userId,
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this message",
      });
    }

    await Message.findByIdAndDelete(id);

    const remainingMessages = await Message.find({
      conversation: message.conversation,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
      data: {
        deletedMessageId: id,
        remainingMessages,
        count: remainingMessages.length,
      },
    });
  } catch (error) {
    console.error("Delete message error:", error);

    return res.status(500).json({
      success: false,
      message: `Delete message error: ${error.message}`,
    });
  }
};

// ==================== UTILITY CONTROLLERS ====================

// Get conversation with all messages
export const getConversationWithMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const conversation = await Conversation.findOne({
      _id: id,
      user: userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const messages = await Message.find({
      conversation: id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        conversation,
        messages,
        totalMessages: messages.length,
      },
    });
  } catch (error) {
    console.error("Get conversation with messages error:", error);

    return res.status(500).json({
      success: false,
      message: `Error: ${error.message}`,
    });
  }
};

// Search messages
export const searchMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { query } = req.query;
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      user: userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or unauthorized",
      });
    }

    const messages = await Message.find({
      conversation: conversationId,
      content: {
        $regex: query,
        $options: "i",
      },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("Search messages error:", error);

    return res.status(500).json({
      success: false,
      message: `Search messages error: ${error.message}`,
    });
  }
};

// Get message statistics
export const getMessageStats = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      user: userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or unauthorized",
      });
    }

    const totalMessages = await Message.countDocuments({
      conversation: conversationId,
    });

    const userMessages = await Message.countDocuments({
      conversation: conversationId,
      role: "user",
    });

    const assistantMessages = await Message.countDocuments({
      conversation: conversationId,
      role: "assistant",
    });

    return res.status(200).json({
      success: true,
      data: {
        conversationId,
        totalMessages,
        userMessages,
        assistantMessages,
        lastUpdated: conversation.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get message stats error:", error);

    return res.status(500).json({
      success: false,
      message: `Get message stats error: ${error.message}`,
    });
  }
};