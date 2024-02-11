const express = require('express');

const notificationController = require('../controllers/notification.controller');
const redirectIfNotLoggedIn = require('../middlewares/redirectIfNotLoggedIn');

const router = express.Router();

// get route to fetch the notifications
router.get('/fetchNotifications', notificationController.getFetchNotifications);

// get route to fetch all the followRequestNotifications of a user
router.get('/fetchFollowRequestNotifications', redirectIfNotLoggedIn, notificationController.getFetchFollowRequestNotifications);

// get route to fetch all the likes notifications (used in script of showNotificationsForUser)
router.get('/fetchLikesNotifications', redirectIfNotLoggedIn, notificationController.getFetchLikesNotifications);

// get route to fetch all the comment notifications (used in the same script)
router.get('/fetchCommentNotifications', redirectIfNotLoggedIn, notificationController.getFetchCommentNotifications);

// get route to fetch all follow notifications
router.get('/fetchFollowNotifications', redirectIfNotLoggedIn, notificationController.getFetchFollowNotifications);

// get route to fetch the chat notifications
router.get('/fetchChatNotifications', redirectIfNotLoggedIn, notificationController.getFetchChatNotifications);

// delete route to remove a chat notification
router.put('/removeNotification/chat', redirectIfNotLoggedIn, notificationController.deleteChatNotification);


// OPTIONS route to remove a chat notification
router.options('/removeNotification/chat', notificationController.optionsRequestDeleteNotification);

// PUT route to remove a follow notification
router.put('/removeNotification/follow', redirectIfNotLoggedIn, notificationController.deleteFollowNotification);

router.options('/removeNotification/follow', notificationController.optionsRequestDeleteNotification);

// delete route to remove a comment notification
router.put('/removeNotification/comment', redirectIfNotLoggedIn, notificationController.deleteCommentNotification);

router.options('/removeNotification/comment', notificationController.optionsRequestDeleteNotification);

// delete route to remove a like notification
router.put('/removeNotification/like', redirectIfNotLoggedIn, notificationController.deleteLikeNotification);

// options route to remove the like notification
router.options('/removeNotification/like', notificationController.optionsRequestDeleteNotification);


module.exports = router;