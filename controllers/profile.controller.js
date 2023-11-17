const userModel = require('../models/user.model');
const postModel = require('../models/post.model');
const ObjectId = require('mongodb').ObjectId;
const profileUtils = require('../utils/profile.utils');
const {checkLoggedIn} = require("../utils/checkLoggedIn");
const LikeCommentEnum = require('../utils/LikeCommentEnum');

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

    // User being the one that we need to render
    const user = await userModel.retrieveUserByUsername(username);

    // check if existent
    if (!user) {
        // no user
        res.send(`No user ${username}`);
        return;
    }

    // public profile, true of false
    const publicProfile = user.public;

    // check if it is the requester's own profile
    let ownProfile = false;
    let following = false;
    let requestedToFollow = false; // has the requestor already requested to follow the requestee ???
    const requesterId = req.session.userId; // this is a string
    if (requesterId === user._id.toString()) {
        // the same user
        ownProfile = true;
    } else {
        // it is a different user
        following = profileUtils.isFollowed(user.followers, requesterId);
        if (!following && !publicProfile) {
            // requestor is not following the user and it is private
            // check if it has already requested to follow
            // console.log(`Following: ${following}`);
            // console.log(`Public: ${publicProfile}`);
            // console.log(`Id of requestee: ${user._id}`)
            requestedToFollow = await userModel.checkPresentInRequestToFollow(new ObjectId(requesterId),
                user._id);
            // console.log(`Requested to Follow: ${requestedToFollow}`);
        } // inner if
    }

    let posts = [];
    // if the ownProfile or following is true, then query the posts
    if (ownProfile || following || publicProfile) {
        // query the posts
        const postsIds = user.posts; // this is an array of ObjectIds
        posts =  await Promise.all(postsIds.map(async (postId) => {
            // query every single post
            return await postModel.getPost(postId) } // here ends the callback function of map
        )) // here ends map

        // add to each post the likes count and comment count
        // add if the user has liked the picture
        posts = posts.map((post) => {
            // callback function
            post.likeCount = profileUtils.getCount(post, LikeCommentEnum.Like);
            post.commentCount = profileUtils.getCount(post, LikeCommentEnum.Comment)
            post.likeValue = profileUtils.checkLikedByUser(post, new ObjectId(requesterId));
            return post;
        }) // here ends the map
    } // here ends the if statement


    const views = {
        following: following,
        ownProfile: ownProfile,
        posts: posts,
        requesteeUsername: username,
        requesteeUserId: user._id.toString(),
        imagePath: `/static/images/profilePictures/${user.profilePicture}`,
        userBio: user.bio,
        publicProfile: publicProfile,
        requestedToFollow: requestedToFollow
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

    // check if the user BeingRequested exists and if the profile is private

    const requestee = await userModel.getUser(new ObjectId(userBeingRequested));

    if (!requestee) {
        // there is no such user
        console.log('You are trying to follow a Ghost! -line 107 profile controller');
        res.redirect('/')
        return;
    }

    // the user to follow exists, check if private of public
    if (requestee.public) {
        // it is public, so follow
        const followResult = await userModel.followUser(userMakingRequestToFollow, userBeingRequested);
        // all good
        res.redirect(`/user/${requestee.username}`);
        return;
    }

    // the user is private so add the user to the list of requestTO follow
    const result = await userModel.saveRequestToFollowUser(new ObjectId(userMakingRequestToFollow),
        new ObjectId(userBeingRequested));

    res.redirect(`/user/${requestee.username}`);

} // here ends the method

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
        userBio: user.bio,
        publicProfile: user.public
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
        // make it public
        // console.log('Profile public')
        await userModel.updatePublicStatus(user._id,true)
    } else {
        // make it private
        // console.log('Profile Private')
        await userModel.updatePublicStatus(user._id, false);
    }

        // save the bio
        await userModel.updateBio(user._id, req.body.bio);

    // check if there is a file
    if (req.file) {
        // save the new profile picture
        await userModel.updateProfilePicture(user._id, req.file.filename);
    }



    // redirect to the profile
    res.redirect(`/user/${user.username}`);
} // here ends teh method


async function getFollowers(req, res, next) {
    // check that the requester is following or the requestee is public
    // get the requestee
    const requestee = await userModel.retrieveUserByUsername(req.params.username);
    // check if it exists
    if (!requestee) {
        // no user with that username
        res.redirect('/');
        return;
    }

    const publicProfile = requestee.public;

    // get the followers but with the username
    const followers = await Promise.all(
        requestee.followers.map(
            // callback for map
            async (id) => {
                const follower = await userModel.getUser(id);
                return follower.username;
            } // here ends the callback for map
        )// here ends map
    ); // here ends Promise.all


    // if the profile is public, that is it, just return the followers
    if (publicProfile) {
        // public profile
        res.json({followers: followers});
        return;
    }

    // if the profile is not public, check if the requestor is logged in and following the requestee
    if (!checkLoggedIn(req)) {
        // requestor not logged in
        res.redirect('/login');
        return;
    }
    // check if the requestor is part of followers
    const requestorFollowing = profileUtils.isFollowed(requestee.followers, req.session.userId);
    if (!requestorFollowing) {
        // not following
        res.redirect(`/user/${req.params.username}`);
        return;
    }

    // at this point all good, return the followers
    res.json({followers: followers});

} // here endsGetFollowers


/**
 * get route to retrieve the 'following' list
 * @param {Express.Request} req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function getFollowing(req, res, next) {
    // check that the requester is following or the requestee is public
    // get the requestee
    const requestee = await userModel.retrieveUserByUsername(req.params.username);
    // check if it exists
    if (!requestee) {
        // no user with that username
        res.redirect('/');
        return;
    }

    const publicProfile = requestee.public;

    // get the following but with the username
    const following = await Promise.all(
        requestee.following.map(
            // callback for map
            async (id) => {
                const user = await userModel.getUser(id);
                return user.username;
            } // here ends the callback for map
        )// here ends map
    ); // here ends Promise.all


    // if the profile is public, that is it, just return the followers
    if (publicProfile) {
        // public profile
        res.json({following: following});
        return;
    }

    // if the profile is not public, check if the requestor is logged in and following the requestee
    if (!checkLoggedIn(req)) {
        // requestor not logged in
        res.redirect('/login');
        return;
    }
    // check if the requestor is part of followers
    const requestorFollowing = profileUtils.isFollowed(requestee.followers, req.session.userId);
    if (!requestorFollowing) {
        // not following
        res.redirect(`/user/${req.params.username}`);
        return;
    }

    // at this point all good, return the followers
    res.json({following: following});

} // here ends the method


/**
 * Retrieves all the follow requests for a given user
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function getFollowRequests(req, res, next) {
    // check that the user is logged in
    if (!checkLoggedIn(req)) {
        // not logged in
        res.redirect('/login');
        return;
    }

    // get the userId from params and check that they are the same as session
    const paramsUserId = req.params.userId;
    const sessionUserId = req.session.userId;

    // check the same
    if (paramsUserId !== sessionUserId) {
        // they are not the same
        res.redirect('/');
        return;
    }

    // now retrieve the request to follow users from the database
    const user = await userModel.getUser(new ObjectId(sessionUserId));

    // check if existen
    if (!user) {
        next(new Error('Trying to request notifications for non existent user - 418 profile.controller'));
        return;
    }

    // all good
    let requestToFollow = user.requestToFollow;
    requestToFollow = await Promise.all(
        requestToFollow.map(
            // map function
            async id => {
                const user = await userModel.getUser(id);
                return {
                    username: user.username
                };
            } // here ends callback
        ) // here ends map
    ); // here neds Promise.all

    // send the requestToFollow
    res.json({requestToFollow: requestToFollow});
} // here ends the method


async function getAcceptFollowRequest(req, res, next) {
    // chek login
    if (!checkLoggedIn(req)) {
        // not logged in
        res.redirect('/login');
        return;
    }

    // make sure the users exist
    const userToRetreive = await userModel.getUser(new ObjectId(req.session.userId));
    const userToRemove = await userModel.retrieveUserByUsername(req.params.username);

    if (!userToRemove || !userToRetreive) {
        // one of the users doesn't exist
        next(
            new Error('profile.controller line 456')
        );
        return;
    }

    // both users exist
    // now do the operations
    const result = await userModel.removeUserFromRequestToFollow(userToRemove._id, userToRetreive._id);

    // check if the user was removed
    if (!result) {
        // no one was removed
        res.json({result: false});
        return;
    }

    // user was removed, now add it to the followers list
    const followResult = await userModel.followUser(userToRemove._id.toString(),
        userToRetreive._id.toString());
    // all good
    res.json({result: followResult});
} // here ends the method


async function getRejectFollowRequest(req, res, next) {
    // check that the user is logged in
    if (!checkLoggedIn(req)) {
        // not logged in
        res.redirect('/login');
        return;
    }

    // make sure the users exist
    const userToRetrieve = await userModel.getUser(new ObjectId(req.session.userId));
    // console.log(`User that has the list:${userToRetrieve.username}`)
    const userToRemove = await userModel.retrieveUserByUsername(req.params.username);
    // console.log(`User that should be removed: ${userToRemove.username}`);
    if (!userToRemove || !userToRetrieve) {
        // one of the users doesn't exist
        next(
            new Error('profile.controller line 495')
        );
        return;
    }

    // both users exist
    // now remove the user from the follow request
    const result = await userModel.removeUserFromRequestToFollow(userToRemove._id, userToRetrieve._id);
    // console.log(result);
    res.json({result: result});
} // here ends the method

/**
 * Removes a request to follow
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function getRemoveRequestToFollow(req, res, next) {
    // check that the user is logged in
    if (!checkLoggedIn(req)) {
        // not logged in
        res.redirect('/login');
        return;
    }

    // user that is making the request to follow
    const userMakingTheRequestToBeRemovedFromList = await userModel.getUser(new ObjectId(req.session.userId));
    // user that has the list
    const userWithRequestToFollowList = await userModel.retrieveUserByUsername(req.params.username);

    if (!userWithRequestToFollowList || !userMakingTheRequestToBeRemovedFromList) {
        // one of the users doesn't exist
        next(
            new Error('profile.controller line 523')
        );
        return;
    }

    // both users exist
    // now remove the user from the follow request
    const result = await userModel.removeUserFromRequestToFollow(userMakingTheRequestToBeRemovedFromList._id, userWithRequestToFollowList._id);

    if (!result) {
        // nothing was changed
        res.json({result: false})
        return;
    }

    // else
    // we are going to redirect, because of the way the profile.ejs file is set up
    // I am going to change that later, so that no reloading is needed
    res.redirect(`/user/${userWithRequestToFollowList.username}`);
} // here ends getRomveRequestToFollow

module.exports = {
    getProfile: getProfile,
    postFollow: postFollow,
    postUnfollow: postUnfollow,
    getEditProfile: getEditProfile,
    postEditProfile: postEditProfile,
    getFollowers: getFollowers,
    getFollowing: getFollowing,
    getFollowRequests: getFollowRequests,
    getAcceptFollowRequest: getAcceptFollowRequest,
    getRejectFollowRequest: getRejectFollowRequest,
    getRemoveRequestToFollow: getRemoveRequestToFollow
}