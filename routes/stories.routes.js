const express = require('express');

const storiesController = require('../controllers/stories.controller');
const redirectIfNotLoggedIn = require('../middlewares/redirectIfNotLoggedIn');

const router = express.Router();

// GET route to display the page to create a new Story
router.get('/createStory', redirectIfNotLoggedIn, storiesController.getCreateStory);

// POST route to upload a story
router.post('/uploadStory', redirectIfNotLoggedIn, storiesController.postUploadStory);

// GET route to fetch the stories of a given user
router.get('/getStories/:userId', storiesController.getStoriesForUser);

// get route to fetch a single story
router.get('/stories/:username/:filename/:sequence', redirectIfNotLoggedIn, storiesController.displayStory);

// get route to render the page
router.get('/renderStory/:username/:filename/:sequence', redirectIfNotLoggedIn, storiesController.renderStory);



module.exports = router;