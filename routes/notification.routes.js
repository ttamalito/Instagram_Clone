const express = require('express');

const notificationController = require('../controllers/notification.controller');


const router = express.Router();

// get route to fetch the notifications
router.get('/fetchNotifications', notificationController.getFetchNotifications);

// get route to fetch all the likes notifications (used in script of showNotificationsForUser)
router.get('/fetchLikesNotifications', notificationController.getFetchLikesNotifications);


module.exports = router;