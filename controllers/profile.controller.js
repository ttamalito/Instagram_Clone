const userModel = require('../models/user.model');
const postModel = require('../models/post.model');
const ObjectId = require('mongodb').ObjectId;
const profileUtils = require('../utils/profile.utils');
const {checkLoggedIn} = require("../utils/checkLoggedIn");

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
        posts: posts,
        requesteeUsername: username,
        requesteeUserId: user._id.toString(),
        imagePath: `/static/images/profilePictures/${user.profilePicture}`,
        userBio: user.bio
    }
    // console.log(posts);
    // render the page
    res.render('profile/profile', views);
    // res.send('whatever')

}

/**
 * Controller to follow a user with a post request
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function postFollow(req, res,  next) {
    // check that the user is loggedIn
    if (!checkLoggedIn(req)) {
        // user is not loggedIn
        res.redirect('/login');
        return;
    }

    // else follow the user in the req.params
    const userMakingRequestToFollow = req.session.userId;
    const userBeingRequested = req.params.userId;
    const followResult = await userModel.followUser(userMakingRequestToFollow, userBeingRequested);

    const user = await userModel.getUser(new ObjectId(userBeingRequested));

    // else all good
    res.redirect(`/user/${user.username}`)
}

async function postUnfollow(req, res, next) {
    // check that the user is loggedIn
    if (!checkLoggedIn(req)) {
        // not logged in
        res.redirect('/');
        return;
    }

    // get the requesterId
    const requesterId = req.session.userId;
    // get the requestee username
    const requesteeUsername = req.params.username;
    // get the requestee's id
    const requestee = await userModel.retrieveUserByUsername(requesteeUsername);
    // check if null
    if (!requestee) {
        // no user was found
        res.redirect('/');
        return;
    }

    const result = await userModel.unFollowUser(new ObjectId(requesterId), requestee._id);

    if (!result) {
        // something went wrong while unfollowing
        res.redirect('/');
    }
    // else just redirect to the requestee's profile
    res.redirect(`/user/${requesteeUsername}`);
}

/**
 * Renders the page to edit the profile settings
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param next
 */
async function getEditProfile(req, res, next) {
    // check that the user is logged in and he is trying to access his own profile
    if (!checkLoggedIn(req)) {
        // not logged in
        res.redirect('/login');
        return;
    }

    // check that it is the same user
    const requestedUsername = req.params.username;
    const user = await userModel.getUser(new ObjectId(req.session.userId));
    // check if the user is null
    if (!user) {
        // no user with that id... this shouldn't happen really
        next(
            new
            Error(`User is logged in, but couldn't be found in the database id: ${req.session.userId}`));
        return;
    }
    if (requestedUsername !== user.username) {
        // user is trying to access someone else's profile
        res.redirect('/');
        return;
    }
    const ownProfile = true;
    // at this point all good, just render the page
    res.render('profile/editProfile', {
        ownProfile: ownProfile,
        username: user.username,
        imagePath: `/static/images/profilePictures/${user.profilePicture}`,
        userBio: user.bio
    });
}

/**
 * Method to update the profile of a user.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function postEditProfile(req, res, next) {
    // check that the user is logged in and it is the same user
    // check that the user is logged in and he is trying to access his own profile
    if (!checkLoggedIn(req)) {
        // not logged in
        res.redirect('/login');
        return;
    }

    // check that it is the same user
    const requestedUsername = req.params.username;
    const user = await userModel.getUser(new ObjectId(req.session.userId));
    // check if the user is null
    if (!user) {
        // no user with that id... this shouldn't happen really
        next(
            new
            Error(`User is logged in, but couldn't be found in the database id: ${req.session.userId}`));
        return;
    }
    if (requestedUsername !== user.username) {
        // user is trying to edit someone else's profile
        res.redirect('/');
        return;
    }

    // the user is safe
    // save the new data
    if (req.body.public) {
        await userModel.updatePublicStatus(user._id,true)
    } else {
        await userModel.updatePublicStatus(user._id, false);
    }

    // save the bio
    await userModel.updateBio(user._id, req.body.bio);

    console.log(`File name: ${req.file.filename}`)
    // save the new profile picture
    await userModel.updateProfilePicture(user._id, req.file.filename);

    // redirect to the profile
    res.redirect(`/user/${user.username}`);
} // here ends teh method

module.exports = {
    getProfile: getProfile,
    postFollow: postFollow,
    postUnfollow: postUnfollow,
    getEditProfile: getEditProfile,
    postEditProfile: postEditProfile
}