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


module.exports = {
    getCreatePost: getCreatePost,
    postCreatePost: postCreatePost
}