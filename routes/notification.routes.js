const express = require('express');

const notificationController = require('../controllers/notification.controller');
const redirectIfNotLoggedIn = require('../middlewares/redirectIfNotLoggedIn');

const router = express.Router();

// get route to fetch the notifications
router.get('/fetchNotifications', notificationController.getFetchNotifications);

// get route to fetch all the likes notifications (used in script of showNotificationsForUser)
router.get('/fetchLikesNotifications', notificationController.getFetchLikesNotifications);

// get route to fetch all the comment notifications (used in the same script)
router.get('/fetchCommentNotifications', notificationController.getFetchCommentNotifications);

// get route to fetch all follow notifications
router.get('/fetchFollowNotifications', notificationController.getFetchFollowNotifications);

// get route to fetch the chat notifications
router.get('/fetchChatNotifications', redirectIfNotLoggedIn, notificationController.getFetchChatNotifications);

// delete route to remove a chat notification
router.delete('/removeNotification/chat', redirectIfNotLoggedIn, notificationController.deleteChatNotification);

// delete route to remove a follow notification
router.delete('/removeNotification/follow', redirectIfNotLoggedIn, notificationController.deleteFollowNotification);

// delete route to remove a comment notification
router.delete('/removeNotification/comment', redirectIfNotLoggedIn, notificationController.deleteCommentNotification);



module.exports = router;