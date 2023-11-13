const express = require('express');
const profileController = require('../controllers/profile.controller');
const router = express.Router()


router.get('/:username', profileController.getProfile);

// post to follow a user /user/follow/:userId
router.post('/follow/:userId', profileController.postFollow);

module.exports = router;