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

module.exports = router;