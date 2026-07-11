const Chat = require("../models/chat");

/**
 * GET /chat/list
 * Returns all conversations of logged in user
 */

const getChatList = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
    })
      .populate("participants", "firstName lastName photourl")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

/**
 * GET /chat/:targetUserId
 */

const getMessages = async (req, res) => {
  try {
    const { targetUserId } = req.params;

    const chat = await Chat.findOne({
      participants: {
        $all: [req.user._id, targetUserId],
      },
    }).populate("messages.senderId", "firstName photourl");

    if (!chat) {
      return res.status(200).json([]);
    }

    const messages = [...chat.messages].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    return res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Failed to load messages",
    });
  }
};

/**
 * Create chat if not exists
 */

const createChat = async (req, res) => {
  try {
    const { targetUserId } = req.body;

    let chat = await Chat.findOne({
      participants: {
        $all: [req.user._id, targetUserId],
      },
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [req.user._id, targetUserId],
      });
    }

    res.json(chat);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    // Find the chat containing this message
    const chat = await Chat.findOne({
      "messages._id": messageId,
    });

    if (!chat) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    // Get the message
    const message = chat.messages.id(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    // Allow only sender to delete
    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can delete only your own messages",
      });
    }

    // Remove the message
    chat.messages.pull(messageId);

    await chat.save();

    res.json({
      success: true,
      message: "Message deleted successfully",
      messageId,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;

    const chat = await Chat.findOne({
      "messages._id": messageId,
    });

    if (!chat) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    const message = chat.messages.id(messageId);

    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    message.text = text;

    await chat.save();

    res.json(message);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  getChatList,
  getMessages,
  createChat,
  deleteMessage,
  editMessage,
};