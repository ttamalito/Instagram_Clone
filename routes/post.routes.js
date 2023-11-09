const express = require('express');
const profilePictureMiddleware = require('../middlewares/profilePic-upload');
const postController = require('../controllers/post.controller');
const router = express.Router();

// get create posts
router.get('/createPost', postController.getCreatePost);

// post /createPost
router.post('/createPost', profilePictureMiddleware,postController.postCreatePost);

module.exports = router;