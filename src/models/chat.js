



const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  text: {
    type: String,
    trim: true,
  },

  // Reply feature
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },

  // Emoji reactions
  reactions: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      emoji: {
        type: String,
      },
    },
  ],

  // Read receipt
  seen: {
    type: Boolean,
    default: false,
  },

  // Edited message
  edited: {
    type: Boolean,
    default: false,
  },

  editedAt: {
    type: Date,
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Chat", chatSchema);