const express = require("express");

const router = express.Router();

const userAuth = require("../middlewares/auth");

const {
  getChatList,
  getMessages,
  deleteMessage,
  createChat,
  editMessage,
} = require("../controllers/chatController");

router.get("/chat/list", userAuth, getChatList);

router.get("/chat/:targetUserId", userAuth, getMessages);

router.post("/chat", userAuth, createChat);
router.patch("/chat/message/:messageId", userAuth, editMessage);

router.delete(
  "/chat/message/:messageId",
  userAuth,
  deleteMessage
);

module.exports = router;