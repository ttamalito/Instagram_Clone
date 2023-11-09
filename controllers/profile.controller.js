const userModel = require('../models/user.model');
const postModel = require('../models/post.model');
const ObjectId = require('mongodb').ObjectId;
const profileUtils = require('../utils/profile.utils');

/**
 * Displays the user profile
 * @param {Express.Request} req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function getProfile(req, res, next) {
    // first retrieve the username from /:username
    const username = req.params.username;
    // get a user if existent
    const user = await userModel.retrieveUserByUsername(username);

    // check if existent
    if (!user) {
        // no user
        res.send(`No user ${username}`);
        return;
    }

    // check if it is the requester's own profile
    let ownProfile = false;
    let following = false;
    const requesterId = req.session.userId; // this is a string
    if (requesterId === user._id.toString()) {
        // the same user
        ownProfile = true;
    } else {
        // it is a different user
        following = profileUtils.isFollowed(user.followers, requesterId);
    }

    let posts = [];
    // if the ownProfile or following is true, then query the posts
    if (ownProfile || following) {
        // query the posts
        const postsIds = user.posts; // this is an array of ObjectIds
        posts =  await Promise.all(postsIds.map(async (postId) => {
            // query every single post
            return await postModel.getPost(postId) } // here ends the callback function of map
        )) // here ends map
    } // here ends the if statement
    const views = {
        following: following,
        ownProfile: ownProfile,
        posts: posts
    }
    // console.log(posts);
    // render the page
    res.render('profile/profile', views);
    // res.send('whatever')

}


module.exports = {
    getProfile: getProfile
}