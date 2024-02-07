const express = require('express');
const profileController = require('../controllers/profile.controller');
const router = express.Router()

const profilePicUpload = require('../middlewares/profilePic-upload');

router.get('/:username', profileController.getProfile);

// post to follow a user /user/follow/:userId
router.post('/follow/:userId', profileController.postFollow);

// put route to unfollow
router.put('/unfollow/:username', profileController.putUnfollow);

// get route to render the edit profile page
router.get('/edit/:username', profileController.getEditProfile);

router.post('/edit/:username', profilePicUpload,profileController.postEditProfile);

// get route to get all the followers
router.get('/:username/followers', profileController.getFollowers);

// get route to get the 'following' list
router.get('/:username/following', profileController.getFollowing);

// get route to get the 'follow-request' list
router.get('/notifications/requestToFollow/:userId', profileController.getFollowRequests);

// get route to accept a follow request
router.get('/acceptFollow/:username', profileController.getAcceptFollowRequest);

// get route to reject a follow request
router.get('/rejectFollow/:username', profileController.getRejectFollowRequest);

// get to remove the request to follow a user
router.get('/removeRequestToFollow/:username', profileController.getRemoveRequestToFollow);

module.exports = router;