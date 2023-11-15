const checkLoggedIn = require('../utils/checkLoggedIn');
const userModel = require('../models/user.model');
const postModel = require('../models/post.model');
const ObjectId = require('mongodb').ObjectId;
const profileUtils = require('../utils/profile.utils');

/**
 * GET for /createPost
 * @param req
 * @param res
 * @param next
 */
function getCreatePost(req, res, next) {
    // check that you are loggedIn
    const loggedIn = checkLoggedIn.checkLoggedIn(req);

    if (!loggedIn) {
        // user is not loggedIn
        // here we can flash the data to the session
        // TODO
        // redirect to login
        res.redirect('/login');
        return;
    }

    // the user is logged in
    // render the page
    res.render('posts/createPost');

} // here ends the function

/**
 * Saves a post and it adds the postId to user.posts
 * @param {Express.Request} req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function postCreatePost(req, res, next) {
    // check that the user is logged in ?
    const loggedIn = checkLoggedIn.checkLoggedIn(req);
    if (!loggedIn) {
        // user is not loggedIn
        // here we can flash the data to the session
        // TODO
        // redirect to login
        res.redirect('/login');
        return;
    }
    // get the data
    const userId = req.session.userId; // user is loggedIn so there is a userId for sure
    const caption = req.body.caption;
    // access the picture in req.file
    const fileName = req.file.filename;

    // save the data (assume it is correct)
    let postId;
    try {
       postId = await postModel.savePost(userId, fileName, caption);
    } catch (error) {
        next(error)
        return;
    }

    // save the postId to the user's profile
    const userIdAsObjectId = new ObjectId(userId);
    const saveResult = await userModel.addPostToUser(userIdAsObjectId, postId);

    // check if it was successful
    if (!saveResult) {
        // post could be saved
        const error = new Error(`Post ${postId.toString()} could not be saved to user: ${userId}`);
        next(error);
        return;
    }




    // hence all good, redirect to /
    res.redirect('/');

} // here ends createPost

/**
 * Controller to like a post
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function getLike(req, res, next) {
    // validate that the user is logged in
    const loggedIn = checkLoggedIn.checkLoggedIn(req);
    if (!loggedIn) {
        // the user is not logged in
        // redirect to login
        res.redirect('/login');
        return;
    }
    // the user is logged in
    // get the post id
    const postId = req.params.postId;
    // add a like to the post
    const result = await postModel.likePost(postId, req.session.userId);
    // get the new like count
    const post = await postModel.getPost(new ObjectId(postId));
    const likeCount = post.likes.length;
    // else all good.
    // redirect to the profile of the user
    res.json({likeCount: likeCount});

} // here ends getLike

/**
 * /post/liked/:postId
 * Controller to send all the users that have liked a picture
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function getLikedBy(req, res, next) {

    // get the post
    const post = await postModel.getPost(new ObjectId(req.params.postId));
    // get the owner of the post
    const ownerOfThePostId = post.userId; // this is a String
    // get the owner of the post and see if the profile is private
    const ownerOfThePost = await userModel.getUser(ownerOfThePostId);
    // make sure it exists
    if (!ownerOfThePost) {
        // there is a post with a user that doesn't exist
        next(new Error(`Post ${req.params.postId} has a non-existent owner line 140 post.controller`));
        return;
    }

    // see if the profile is private
    if (!ownerOfThePost.public) {
        // the profile is private
        // checked if login
        if (!checkLoggedIn.checkLoggedIn(req)) {
            // user not loggged in
            res.redirect('/login');
            return;
        }

        // check if the requestor is following the ownerOfThePost
        if (!profileUtils.isFollowed(ownerOfThePost.followers, req.session.userId)) {
            // not following
            // thus not able to see the likes
            res.redirect(`/user/${ownerOfThePost.username}`);
            return;
        }
        // at this point all good so we can query the likes and display them
    } // here ends the if statement
    const usersIds = post.likes;

    // console.log(typeof usersIds)
    // get the array of users
    let users = await userModel.getUsers(usersIds);

    // send the data
    res.send(users);

}

/**
 * POST /post/comment/:postId, controller to post a comment
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function postComment(req, res, next) {
    // check that the user is logged in
    if (!checkLoggedIn.checkLoggedIn(req)) {
        // not logged in
        res.redirect('/login');
        return;
    }

    // get the user id and the postId
    const userId = req.session.userId;
    const postId = req.params.postId;
    const comment = req.body.comment;

    // now save the comment to the database
    const result = await postModel.commentPost(userId, postId, comment);

    if (!result) {
        // something went wrong when saving the post
        next(new Error('Could comment Post in post.controller.postComment'));
        return;
    }

    // get the new comment count
    const post = await postModel.getPost(new ObjectId(postId));
    const commentCount = post.comments.length;

    // else all good
    res.json({commentCount: commentCount});
} // here ends postComment

/**
 * Controller to send all the comments of a given post
 * @param req
 * @param res
 * @param next
 */
async function getComment(req, res, next) {
    // checked logged in
    if (!checkLoggedIn.checkLoggedIn(req)) {
        // not logged in
        res.redirect('/login');
        return;
    }
    // query all the comments for a post
    const postId = req.params.postId;
    const post = await postModel.getPost(new ObjectId(postId));
    // console.log(comments)
    const comments = await Promise.all(post.comments.map(async comment => {
        const user = await userModel.getUser(comment.userId);
        // define a new object
        return {
            comment: comment.comment,
            user: user.username
        };
    }))
    res.send(comments);
    // res.json(comments);
    // else render the page
    // res.render('posts/comment', {post: {_id : req.params.postId}});
} // here ends getComment


module.exports = {
    getCreatePost: getCreatePost,
    postCreatePost: postCreatePost,
    getLike: getLike,
    getLikedBy: getLikedBy,
    postComment: postComment,
    getComment: getComment
}