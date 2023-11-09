const express = require('express');
const postPictureMiddleware = require('../middlewares/postPicture-upload');
const postController = require('../controllers/post.controller');
const router = express.Router();

// get create posts
router.get('/createPost', postController.getCreatePost);

// post /createPost
router.post('/createPost', postPictureMiddleware,postController.postCreatePost);

module.exports = router;