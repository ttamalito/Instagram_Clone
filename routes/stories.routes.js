const express = require('express');

const storiesController = require('../controllers/stories.controller');
const redirectIfNotLoggedIn = require('../middlewares/redirectIfNotLoggedIn');

const router = express.Router();

// GET route to display the page to create a new Story
router.get('/createStory', redirectIfNotLoggedIn, storiesController.getCreateStory);



module.exports = router;