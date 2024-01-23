const express = require('express');

const storiesController = require('../controllers/stories.controller');
const redirectIfNotLoggedIn = require('../middlewares/redirectIfNotLoggedIn');

const router = express.Router();

// GET route to display the page to create a new Story
router.get('/createStory', redirectIfNotLoggedIn, storiesController.getCreateStory);

// POST route to upload a story
router.post('/uploadStory', redirectIfNotLoggedIn, storiesController.postUploadStory);



module.exports = router;