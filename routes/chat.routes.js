const express = require('express');

const chatController = require('../controllers/chat.controller');
const checkLoggedInMiddleware = require('../middlewares/redirectIfNotLoggedIn');
const router = express.Router();


// get route for renderin the inbox page of the user
router.get('/inbox', chatController.renderInbox);


// get route to retrieve all the chats for a given user
router.get('/retrieveChats/:userId', checkLoggedInMiddleware, chatController.getChatsForUser);

// post route to create a new chat
router.post('/createSingleChat', checkLoggedInMiddleware, chatController.postCreateNewChat)

// get route to render the page to start a new chat
router.get('/startNewChat/:userId', checkLoggedInMiddleware, chatController.getStartNewChat);

// get route to fetch the messages of a given chat
router.get('/getChatMessages/:chatId', checkLoggedInMiddleware, chatController.getMessagesForChat);


module.exports = router;