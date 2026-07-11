const Chat = require("../models/chat");
const getRoomId = require("../utils/getRoomId");

const onlineUsers = new Map();

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 User Connected:", socket.id);

    // Join Chat
    socket.on("joinChat", ({ userId, targetUserId }) => {
      try {
        // Save user on socket
        socket.userId = userId;

        // Store online user
        onlineUsers.set(userId, socket.id);

        // Notify everyone about online users
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));

        // Join room
        const roomId = getRoomId(userId, targetUserId);

        socket.join(roomId);

        console.log(`${userId} joined room ${roomId}`);
      } catch (err) {
        console.error(err);
      }
    });

    // Send Message
    socket.on("sendMessage", async ({ userId, targetUserId, text }) => {
      try {
        const roomId = getRoomId(userId, targetUserId);

        let chat = await Chat.findOne({
          participants: {
            $all: [userId, targetUserId],
          },
        });

        if (!chat) {
          chat = new Chat({
            participants: [userId, targetUserId],
            messages: [],
          });
        }

        chat.messages.push({
          senderId: userId,
          text,
        });

        await chat.save();

        io.to(roomId).emit("receiveMessage", {
          _id: chat.messages[chat.messages.length - 1]._id,
          senderId: userId,
          text,
          createdAt: new Date(),
        });
      } catch (err) {
        console.error(err);
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log("🔴 User Disconnected:", socket.id);

      if (socket.userId) {
        onlineUsers.delete(socket.userId);
      }

      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });
  });
};