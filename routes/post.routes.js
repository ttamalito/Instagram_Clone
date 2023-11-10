const express = require('express');
const postPictureMiddleware = require('../middlewares/postPicture-upload');
const postController = require('../controllers/post.controller');
const router = express.Router();

// get create posts
router.get('/createPost', postController.getCreatePost);

// post /createPost
router.post('/createPost', postPictureMiddleware,postController.postCreatePost);

// post /like/:postId
router.get('/like/:postId', postController.getLike);

// get /post/liked/:postId
router.get('/post/liked/:postId', postController.getLikedBy);

// get /post/comment/:postId
router.get('/post/comment/:postId', postController.getComment);

// post /post/comment/:postId
router.post('/post/comment/:postId', postController.postComment);

module.exports = router;