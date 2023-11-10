const checkLoggedIn = require('../utils/checkLoggedIn');
const userModel = require('../models/user.model');
const postModel = require('../models/post.model');
const ObjectId = require('mongodb').ObjectId;

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

    // else all good.
    // redirect to the profile of the user
    res.end()

} // here ends getLike

/**
 * /post/liked/:postId
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function getLikedBy(req, res, next) {
    // checked if login
    if (!checkLoggedIn.checkLoggedIn(req)) {
        // user not loggged in
        res.redirect('/login');
        return;
    }

    // user is loggedIn
    const userId = req.session.userId;

    // get all the users
    const post = await postModel.getPost(new ObjectId(req.params.postId))
    const usersIds = post.likes;
    console.log(usersIds)
    // console.log(typeof usersIds)
    // get the array of users
    let users = await userModel.getUsers(usersIds);
    // console.log(users)
    // users = await userModel.getUser(usersIds[0]);
    // console.log(users)
    // pass the users to the html page
    res.render('posts/likedBy',{users: users});


}

/**
 * POST /post/comment/:postId
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

    // else all good
    res.redirect('/');
} // here ends postComment

/**
 *
 * @param req
 * @param res
 * @param next
 */
function getComment(req, res, next) {
    // checked logged in
    if (!checkLoggedIn.checkLoggedIn(req)) {
        // not logged in
        res.redirect('/login');
        return;
    }
    console.log('We are here')
    console.log(req.params.postId)
    // else render the page
    res.render('posts/comment', {post: {_id : req.params.postId}});
} // here ends getComment


module.exports = {
    getCreatePost: getCreatePost,
    postCreatePost: postCreatePost,
    getLike: getLike,
    getLikedBy: getLikedBy,
    postComment: postComment,
    getComment: getComment
}