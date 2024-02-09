const express = require('express');

const storiesController = require('../controllers/stories.controller');
const redirectIfNotLoggedIn = require('../middlewares/redirectIfNotLoggedIn');

const router = express.Router();

// GET route to display the page to create a new Story
router.get('/createStory', redirectIfNotLoggedIn, storiesController.getCreateStory);

// POST route to upload a story
router.post('/uploadStory', redirectIfNotLoggedIn, storiesController.postUploadStory);

// OPTIONs route to preflight the post request
router.options('/uploadStory', storiesController.optionsUploadStory);

// GET route to fetch the stories of a given user
router.get('/getStories/:username', storiesController.getStoriesForUser);

// get route to fetch a single story
router.get('/stories/:username/:filename/:sequence', redirectIfNotLoggedIn, storiesController.getStory);

// get route to render the page
router.get('/changeThis/:username/:filename/:sequence', redirectIfNotLoggedIn, storiesController.renderStory);

// get route to fetch the remaining stories from a user
router.get('/getMoreStories/:username', redirectIfNotLoggedIn, storiesController.getMoreStories);



module.exports = router;