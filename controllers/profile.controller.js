const userModel = require('../models/user.model');
const postModel = require('../models/post.model');
const ObjectId = require('mongodb').ObjectId;
const profileUtils = require('../utils/profile.utils');
const {checkLoggedIn} = require("../utils/checkLoggedIn");
const LikeCommentEnum = require('../utils/LikeCommentEnum');
const {Notification, typesOfNotificationEnum} = require('../utils/Notification');

// global variables
const globalVariables = require('../utils/global');

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

    // send the data as json
    res.json(views)


} // end of getProfile controller

/**
 * Controller to follow a user with a put request
 * If the profile is private it adds the user to the corresponding list
 * requestToFollow list in the document of the user
 * Sends the corresponding notification to the user
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function putFollow(req, res,  next) {
    // check that the user is loggedIn
    if (!checkLoggedIn(req)) {
        // user is not loggedIn
        res.json({
            result: false,
            url: `${globalVariables.frontend}/login`
        });
        return;
    }

    // else follow the user in the req.params
    const userMakingRequestToFollow = req.session.userId;
    const userBeingRequested = req.params.username;

    // check if the user BeingRequested exists and if the profile is private

    const requestee = await userModel.retrieveUserByUsername(userBeingRequested)

    if (!requestee) {
        // there is no such user
        console.log('You are trying to follow a Ghost! -line 123 profile controller');
        res.json({
            result: false,
            url: `${globalVariables.frontend}`
        });
        return;
    }
    // user wanting to follow
    const sender = await userModel.getUser(new ObjectId(userMakingRequestToFollow));

    // the user to follow exists, check if private of public
    if (requestee.public) {
        // it is public, so follow
        const followResult = await userModel.followUser(userMakingRequestToFollow, requestee._id.toString());

        if (followResult) {
            // the operation was resolved successfully
            const followNotification = new Notification(typesOfNotificationEnum.NEW_FOLLOWER,
                sender.username, requestee.username);
                // send the notification
                const notificationResult = followNotification.sendReceivedFollowNotification(requestee._id.toString(),
                    `profilePictures/${sender.profilePicture}`);


        } // if followResult
        // all good
        res.json({
            result: true,
            following: true
        });
        return;
    } //if ---- the user has a public profile

    // the user is private so add the user to the list of requestTO follow
    const result = await userModel.saveRequestToFollowUser(new ObjectId(userMakingRequestToFollow),
        requestee._id);

    // check if the operation was performed succesfully
    if (result) {
        // create a notification
        const followRequestNotification = new Notification(typesOfNotificationEnum.FOLLOW_REQUEST,
            sender.username, requestee.username);
        // check that the requestee has a connection
        if (followRequestNotification.userHasConnection(requestee._id.toString())) {
            const followRequestResult = followRequestNotification.sendFollowRequestNotification(requestee._id.toString());
        } // end if( userhasConnection)
    } // end if (result)

    // the user was requested to follow
    res.json({
        result: true,
        following: false
    });
} // here ends the method


/**
 * Controller to unfollow a user, through a PUT request
 * @param req
 * @param res
 * @param next
 * @return {Promise<void>}
 */
async function putUnfollow(req, res, next) {
    // check that the user is loggedIn
    if (!checkLoggedIn(req)) {
        // not logged in
        // redirect to login
        res.json({
            result: false,
            url: `${globalVariables.frontend}/login`
        });
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
        res.json({
            result: false,
            url: `${globalVariables.frontend}`
        })
        return;
    }

    const result = await userModel.unFollowUser(new ObjectId(requesterId), requestee._id);

    if (!result) {
        // something went wrong while unfollowing, the operation could not be performed
        res.json({
            result: false,
            url: `${globalVariables.frontend}`
        })
        return;
    }
    // else just redirect to the requestee's profile
    // just say that the result if true
    res.json({
        result: true
    });
} // end of putUnfollow

/**
 * Sends the necessary data to render the edit profile page to the frontend
 * as well as the csrfToken
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param next
 */
async function getEditProfile(req, res, next) {

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
        res.json({
            result: false,
            url: globalVariables.frontend
        })
        return;
    }
    const ownProfile = true;
    // at this point all good, send the data
    res.json({
        result: true,
        ownProfile: ownProfile,
        username: user.username,
        imagePath: `/static/images/profilePictures/${user.profilePicture}`,
        userBio: user.bio,
        publicProfile: user.public,
        csrf: req.csrfToken()
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

    res.append('Access-Control-Allow-Headers', 'mime-type, content-type, file-name, content-length');
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
        res.json({result: false,
        url: '/'});
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
    res.json({result: true});
} // here ends teh method

/**
 *
 * Simple Controller to return the followers of a given user
 * @param req
 * @param res
 * @param next
 * @return {Promise<void>}
 */
async function getFollowers(req, res, next) {
    // check that the requester is following or the requestee is public
    // get the requestee
    const requestee = await userModel.retrieveUserByUsername(req.params.username);
    // check if it exists
    if (!requestee) {
        // no user with that username
        res.json({
            result:false,
            url : globalVariables.frontend
        })
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
        res.json({
            result: true,
            followers: followers
        });
        return;
    }

    // else the profile is private
    // check if the requestor is part of followers and the requestor !== requestee
    const requestorFollowing = profileUtils.isFollowed(requestee.followers, req.session.userId);
    if (!requestorFollowing && req.session.userId !== requestee._id.toString()) {
        // not following
        res.json({
            result:false,
            url : `${globalVariables.frontend}/user/${req.params.username}`
        })
        return;
    }

    // at this point all good, return the followers
    res.json({
        result: true,
        followers: followers});

} // here endsGetFollowers


/**
 * Simple controller to fetch the 'following' list from a user
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
        res.json({
            result: false,
            url : globalVariables.frontend
        })
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


    // if the profile is public, that is it, just return the following list
    if (publicProfile) {
        // public profile
        res.json({
            result: true,
            following: following});
        return;
    }


    // check if the requestor is part of followers or if it is the same user
    const requestorFollowing = profileUtils.isFollowed(requestee.followers, req.session.userId);
    if (!requestorFollowing && req.session.userId !== requestee._id.toString()) {
        // not following or not the same user
        res.json({
            result: false,
            url : `${globalVariables.frontend}/user/${req.params.username}`
        })
        return;
    }

    // at this point all good, return the following list
    res.json({
        result: true,
        following: following});

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

/**
 * Controller to accept a follow request
 * :username in params, is the user to be accepted
 * @param req
 * @param res
 * @param next
 * @return {Promise<void>}
 */
async function getAcceptFollowRequest(req, res, next) {

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

/**
 * Controller to reject a request to follow from the user in the params
 * @param req
 * @param res
 * @param next
 * @return {Promise<void>}
 */
async function getRejectFollowRequest(req, res, next) {

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

/**
 * Controller to respond to a OPTIONS request to unfollow a user
 * @param req
 * @param res
 * @param next
 */
function optionsUnfollow(req, res, next) {
    // the CORS headers were set previously by a middleware
    // just send the status code
    // first destroy the session, depending on the browser they might send the request without credentials
    if (!req.session.userId) {
        // no user id, destroy the session
        req.session.destroy(() => {
            // once the session is destroyed, send the response
            res.status(204).end();
        })
    }
} // end of optionsUnfollow

function optionsPostEditProfile(req, res) {
    console.log(`Pendejo`);
    res.append('Access-Control-Allow-Headers', 'mime-type, content-type, file-name, content-length')
}

module.exports = {
    getProfile: getProfile,
    putFollow: putFollow,
    putUnfollow: putUnfollow,
    getEditProfile: getEditProfile,
    postEditProfile: postEditProfile,
    getFollowers: getFollowers,
    getFollowing: getFollowing,
    getFollowRequests: getFollowRequests,
    getAcceptFollowRequest: getAcceptFollowRequest,
    getRejectFollowRequest: getRejectFollowRequest,
    getRemoveRequestToFollow: getRemoveRequestToFollow,
    optionsUnfollow: optionsUnfollow,
    optionsPostEditProfile: optionsPostEditProfile
}