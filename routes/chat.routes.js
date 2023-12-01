const express = require('express');

const chatController = require('../controllers/chat.controller');

const router = express.Router();


// get route for chats of the user
router.get('/user/chats', chatController.getChatsForUser)


module.exports = router;