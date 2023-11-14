const express = require('express');
const profileController = require('../controllers/profile.controller');
const router = express.Router()

const profilePicUpload = require('../middlewares/profilePic-upload');

router.get('/:username', profileController.getProfile);

// post to follow a user /user/follow/:userId
router.post('/follow/:userId', profileController.postFollow);

// post route to unfollow
router.post('/unfollow/:username', profileController.postUnfollow);

// get route to render the edit profile page
router.get('/edit/:username', profileController.getEditProfile);

router.post('/edit/:username', profilePicUpload,profileController.postEditProfile);

module.exports = router;