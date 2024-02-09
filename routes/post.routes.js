const express = require('express');
const postPictureMiddleware = require('../middlewares/postPicture-upload');
const postController = require('../controllers/post.controller');
const router = express.Router();

// redirect if not logged in middleware
const redirectIfNotLoggedIn = require('../middlewares/redirectIfNotLoggedIn');

// get create posts
router.get('/createPost', redirectIfNotLoggedIn, postController.getCreatePost);

// post /createPost
router.post('/createPost', redirectIfNotLoggedIn, postPictureMiddleware ,postController.postCreatePost);

// get /like/:postId, route to like a post
router.get('/like/:postId', postController.getLike);

// get /post/liked/:postId
router.get('/post/liked/:postId', postController.getLikedBy);

// get /post/comments/:postId
router.get('/post/comments/:postId', postController.getComment);

// get route to retrive the csrf token to post a comment
router.get('/post/comment/:postId', postController.csrfPostComment);

// post /post/comment/:postId
router.post('/post/comment/:postId', redirectIfNotLoggedIn, postController.postComment);

// post route to delete a comment
router.post('/deleteComment/:postId/:commentId', postController.postDeleteComment);

// GET route to fetch a single post
router.get('/post/:id', postController.getPost);

module.exports = router;