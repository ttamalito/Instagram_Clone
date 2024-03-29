const express = require('express');
const profileController = require('../controllers/profile.controller');
const router = express.Router()

const profilePicUpload = require('../middlewares/profilePic-upload');

// redirect middleware
const redirectIfNotLoggedIn = require('../middlewares/redirectIfNotLoggedIn');

router.get('/:username', profileController.getProfile);

// post to follow a user /user/follow/:userId
router.put('/follow/:username', profileController.putFollow);

// options route for follow/:userId
router.options('/follow/:username', profileController.optionsUnfollow); // it is the same logic as optionsUnfollow

// put route to unfollow
router.put('/unfollow/:username', profileController.putUnfollow);

// options route to unfollow
router.options('/unfollow/:username', profileController.optionsUnfollow)

// get route to render the edit profile page
router.get('/edit/:username', redirectIfNotLoggedIn ,profileController.getEditProfile);

router.post('/edit/:username', redirectIfNotLoggedIn, profilePicUpload,profileController.postEditProfile);

// OPTIONS route to edit the pofile
router.options('/edit/:username', profileController.optionsPostEditProfile);

// get route to fetch all the followers
router.get('/:username/followers', redirectIfNotLoggedIn, profileController.getFollowers);

// get route to get the 'following' list
router.get('/:username/following', redirectIfNotLoggedIn, profileController.getFollowing);

// get route to get the 'follow-request' list
router.get('/notifications/requestToFollow/:userId', profileController.getFollowRequests);

// get route to accept a follow request
router.get('/acceptFollow/:username', redirectIfNotLoggedIn ,profileController.getAcceptFollowRequest);

// get route to reject a follow request
router.get('/rejectFollow/:username', redirectIfNotLoggedIn, profileController.getRejectFollowRequest);

// get to remove the request to follow a user
router.get('/removeRequestToFollow/:username', profileController.getRemoveRequestToFollow);

module.exports = router;