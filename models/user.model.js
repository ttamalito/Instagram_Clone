// file to communicate to the user database

const db = require('../database/databaseConfig');
const bcrypt = require('bcryptjs');
const COLLECTION = 'users';
const ObjectId = require('mongodb').ObjectId;
const profileUtils = require('../utils/profile.utils');
/**
 * Saves a user to ´users´ collection asynchronously
 * @param email
 * @param password
 * @param username
 * @param bio
 * @param fullname
 * @returns {Promise<void>}
 */
async function saveUser(email, password, username, bio, fullname) {
    // hash the password
    const hashedPassword = await bcrypt.hash(password, 12)//
    // the data has been validated
    const saveResult = await db.getDatabase().collection('users').insertOne({
        email: email,
        password: hashedPassword,
        username: username,
        bio: bio,
        profilePicture: 'default_profile_pic.jpg', // relative path to /images/profilePictures
        followers: [],
        following: [],
        savedPosts: [],
        posts: [],
        fullname: fullname,
        dateCreated: new Date().toISOString(),
        public: true,
        requestToFollow: [],
        likeNotifications: [],
        commentNotifications: [],
        followNotifications: [],
        chats: [],
        chatNotifications: []
    })
} // here ends the function

/**
 * Checks if there is an instance with the given email
 * @param {String} email
 * @returns {Promise<boolean>} true if the email is unique
 */
async function checkUniqueEmail(email) {
    const result = await db.getDatabase().collection('users').findOne({
        email: email
    })

    if (!result) {
        // there is no result
        return true;
    }

    // there is a result, the email is not unique
    return false;
} // here ends checkUniqueEmail

/**
 * Checks if the username is unique
 * @param username
 * @returns {Promise<boolean>} true if the username is unique
 */
async function checkUniqueUsername(username) {
    const result = await db.getDatabase().collection(COLLECTION).findOne({
        username: username
    })
    if (!result) {
        // there is no result
        return true;
    }

    // there is a result, the username is not unique
    return false;
} // here eds the function

/**
 * Retreives a user from the database
 * @param {String} username
 * @returns {Promise<User?>}
 */
async function retrieveUserByUsername(username) {
    const result = await db.getDatabase().collection(COLLECTION).findOne({
        username: username
    })

    return result;
}

/**
 * Retrieves a user with the email
 * @param email
 * @returns {Promise<*>}
 */
async function retrieveUserByEmail(email) {
    return result = await db.getDatabase().collection(COLLECTION).findOne({
        email: email
    })
}

/**
 * Asynchronously compares the password to the stored password
 * @param unhashedPassword
 * @param hashedPassword
 * @returns {Promise<*>}
 */
async function hasMatchingPassword(unhashedPassword, hashedPassword) {
    const result = await bcrypt.compare(unhashedPassword, hashedPassword);
    return result;
}

/**
 * Query a user by the userId
 * @param {ObjectId} userId
 * @returns {Promise<User?>}
 */
async function getUser(userId) {
    return await db.getDatabase().collection(COLLECTION).findOne({
        _id: userId
    })
}

/**
 * Adds a post with the postId to the user with the userId
 * @param {ObjectId} userId
 * @param {ObjectId} postId
 * @returns {Promise<boolean>} true if the post was added succesfully
 */
async function addPostToUser(userId, postId) {
    // check that the user exists
    const user = await getUser(userId);
    // check if null
    if (!user) {
        // no user
        return false;
    }

    // the user is there, so add the post
    const result = await db.getDatabase().collection(COLLECTION).updateOne({
        _id: userId
    }, {
        // what to update
        $push: {posts: postId}
    })
    console.log(`User ${userId.toString()} posted ${postId.toString()}`)
    console.log(result);
    return true;
} // here ends post to user

/**
 * Returns a list of users
 * @param {[ObjectId]} users Array of the ObjectIds of the users
 * @returns {Promise<[User]>}
 */
async function getUsers(users) {
    const foundUsers = await db.getDatabase().collection(COLLECTION).find({
        // query parameters
        _id : {$in: users}// matches a document where _id is one of the values in users
    });
    // console.log(foundUsers)
    return foundUsers.toArray();
}

/**
 * Puts userRequesting in the followers list of userBeingreqeusted and puts userBeingRequested
 * in the following list of userRequesting
 * @param {String} userRequestingId
 * @param {String} userBeingRequestedId
 * @returns {Promise<boolean>} true if the operation was performed successfully
 */
async function followUser(userRequestingId, userBeingRequestedId) {
    // get the user being requested to be followed
    const requestee = await getUser(new ObjectId(userBeingRequestedId));
    // check if the userRequesting is already following
    const followersRequestee = requestee.followers;
    if (profileUtils.isFollowed(followersRequestee, userRequestingId)) {
        // the user is already following, so
        return false;
    }

    // now check if the requester is already following the requestee
    const requester = await getUser(new ObjectId(userRequestingId));
    const followingRequester = requester.following;

    if (profileUtils.isFollowing(followingRequester, userBeingRequestedId)) {
        // requester already follows requestee, thus
        return false;
    }

    // otherwise the user is not being followed. Thus
    const resultOne = await db.getDatabase().collection(COLLECTION).updateOne({
        _id: new ObjectId(userBeingRequestedId)
    }, {
        // add the requester to the followers list
        $push: {followers: new ObjectId(userRequestingId)}
    });

    const resultTwo = await db.getDatabase().collection(COLLECTION).updateOne({
        _id: new ObjectId(userRequestingId)
    }, {
        $push: {following: new ObjectId(userBeingRequestedId)}
    });

    return resultTwo.modifiedCount > 0 && resultOne.modifiedCount > 0;
} // here ends the function

/**
 * Removes requesterId frome the followers list of the requestee,
 * and it removes requesteeId from the following list of the requester
 * @param { ObjectId} requesterId
 * @param {ObjectId} requesteeId
 * @returns {Promise<boolean>} true if the action was performed successfully
 */
async function unFollowUser(requesterId, requesteeId) {
    // check that requester is a follower of requestee
    const requestee = await getUser(requesteeId);
    const requesteeFollowers = requestee.followers;
    if (!profileUtils.isFollowed(requesteeFollowers, requesterId.toString())) {
        // requstee is not followed by requester
        // there is nothing to do
        return false;
    }

    // else remove requesterId from the followers list
    const resultOne = await db.getDatabase().collection(COLLECTION).updateOne({
        _id: requesteeId
    }, {
        // what to remove, i.e. the requester from the followers of the requestee
        $pull: {followers: requesterId}
        }
    );

    // now remove the requesteeId from the following of the requester
    const resultTwo = await db.getDatabase().collection(COLLECTION).updateOne({
    _id: requesterId
    },
        {
            // what to remove, i.e., the requesteeId from the following list
            $pull: {following: requesteeId}
        });
    return resultOne.acknowledged && resultTwo.acknowledged;
}


/**
 * Updates the Bio of a user with the given id
 *
 * @param {ObjectId} id
 * @param {String} bio
 * @returns {Promise<boolean>}
 */
async function updateBio(id, bio) {
    // get the user
    const user = await getUser(id);
    // check if null
    if (!user) {
        // no user
        return false;
    }

    // update the user
    const result = await db.getDatabase().collection(COLLECTION).updateOne({
        // filter
        _id: id
    }, {
        // data to update
        $set: {bio: bio}
    });
    return result.acknowledged;
}

/**
 * Updates the profile picture of a user with the given id
 * @param {ObjectId} id
 * @param {String} fileName
 * @returns {Promise<boolean>}
 */
async function updateProfilePicture(id, fileName) {
    // get the user
    const user = await getUser(id);
    // check if null
    if (!user) {
        // no user
        return false;
    }

    // update the user
    const result = await db.getDatabase().collection(COLLECTION).updateOne({
        // filter
        _id: id
    }, {
        // data to update
        $set: {profilePicture: fileName}
    });
    return result.acknowledged;
}

/**
 * Updates public status of a user with the given id
 * @param {ObjectId} id
 * @param {boolean} value
 * @returns {Promise<boolean>}
 */
async function updatePublicStatus(id, value) {
    // get the user
    const user = await getUser(id);
    // check if null
    if (!user) {
        // no user
        return false;
    }

    // update the user
    const result = await db.getDatabase().collection(COLLECTION).updateOne({
        // filter
        _id: id
    }, {
        // data to update
        $set: {public: value}
    });
    return result.acknowledged;
} // end updatePublicStatus

/**
 * Checks if the requestor has already requested to follow the requestee, if not it will add it to
 * the corresponding document
 * @param {ObjectId} requestor
 * @param {ObjectId} requestee
 * @returns {Promise<boolean>} true if the operation was performed successfully
 */
async function saveRequestToFollowUser(requestor, requestee) {

    // check if the requestor has already requested to follow the user
    const requesteeUser = await getUser(requestee);

    if (profileUtils.isFollowed(requesteeUser.requestToFollow, requestor.toString())) {
        // the requestor has already requested to follow the user
        return false;
    }

    // otheriwse continue
    // add it to the database
    const result = await db.getDatabase().collection(COLLECTION).updateOne({
        // filter
        _id: requestee
    }, {
        // what to change
        $push: {requestToFollow: requestor}
    });

    return result.modifiedCount === 1;
} // here ends saveReqeustToFollowUser

/**
 * Checks if requestor has already requested to follow requestee
 * @param {ObjectId} requestor
 * @param {ObjectId} requestee
 * @returns {Promise<boolean>}
 */
async function checkPresentInRequestToFollow(requestor, requestee) {
    // check if the requestor has already requested to follow the user
    const requesteeUser = await getUser(requestee);
    return profileUtils.isFollowed(requesteeUser.requestToFollow, requestor.toString());

}

/**
 * Removes userToRemoveId from the requestToFollow list of userToRetrieveId
 *
 * @param {ObjectId} userToRemoveId
 * @param {ObjectId} userToRetrieveId
 * @returns {Promise<boolean>}
 */
async function removeUserFromRequestToFollow(userToRemoveId, userToRetrieveId) {

    // const userWithList = await getUser(userToRetrieveId);
    // const userToBeRemoved = await getUser(userToRemoveId);

    const result = await db.getDatabase().collection(COLLECTION).updateOne(
        {_id: userToRetrieveId},
        {$pull: {requestToFollow: userToRemoveId} });
    // console.log(result)
    return result.modifiedCount > 0;
} // here ends the method

/**
 * Saves a like Notification to the database,
 * if there are already 10 Notifications, it will delete the oldest notification and put a new one
 * @param notification
 * @returns {Promise<boolean>} true if the notification was added
 */
async function saveLikeNotification(notification) {
    /*
    notification = {
    receiverUsername: username of the receiver
    senderUsername: User that sent the notification,
    date: Date of the notificatio
    postId: id of the post that received the like
    imagePath: relative path of the image i.e. posts/filename
    }
     */

    // check if the receiver has 10 notifications already
    const receiver = await retrieveUserByUsername(notification.receiverUsername);
    if (receiver.likeNotifications.length === 10) {
        // the user has exactly 10 notifications
        // remove the oldest one i.e. the first one
        const popResult = await db.getDatabase().collection(COLLECTION).updateOne(
            {
                // filter
                _id: receiver._id
            },
            {
               // remove the first element of the array
               $pop: {likeNotifications: -1}
            });

        // now add the new notification
        const pushResult = await db.getDatabase().collection(COLLECTION).updateOne(
            {
                _id: receiver._id
            },
            {
                $push: {likeNotifications: notification}
            });

        return pushResult.modifiedCount > 0;
    } // end if user has 10 notifications

    // the user has not 10 notifications
    // add the notifiction
    const pushResult = await db.getDatabase().collection(COLLECTION).updateOne(
        {
            _id: receiver._id
        },
        {
            $push: {likeNotifications: notification}
        });

    return pushResult.modifiedCount > 0;
} // here ends the function


/**
 * Saves a comment Notification to the database,
 * if there are already 10 Notifications, it will delete the oldest notification and put a new one
 * @param notification
 * @returns {Promise<boolean>} true if the notification was added
 */
async function saveCommentNotification(notification) {
    /*
    notification = {
    receiverUsername: username of the receiver
    senderUsername: User that sent the notification,
    date: Date of the notificatio
    postId: id of the post that received the comment
    imagePath: relative path of the image i.e. posts/filename,
    commentId: id of the comment that was created
    }
     */

    // check if the receiver has 10 notifications already
    const receiver = await retrieveUserByUsername(notification.receiverUsername);

    if (receiver.commentNotifications.length === 10) {
        // the user has exactly 10 notifications
        // remove the oldest one i.e. the first one
        const popResult = await db.getDatabase().collection(COLLECTION).updateOne(
            {
                // filter
                _id: receiver._id
            },
            {
                // remove the first element of the array
                $pop: {commentNotifications: -1}
            });

        // now add the new notification
        const pushResult = await db.getDatabase().collection(COLLECTION).updateOne(
            {
                _id: receiver._id
            },
            {
                $push: {commentNotifications: notification}
            });

        return pushResult.modifiedCount > 0;
    } // end if user has 10 notifications

    // the user has not 10 notifications
    // add the notifiction
    const pushResult = await db.getDatabase().collection(COLLECTION).updateOne(
        {
            _id: receiver._id
        },
        {
            $push: {commentNotifications: notification}
        });

    return pushResult.modifiedCount > 0;
} // here ends the function

/**
 * Saves a follow Notification to the document of the receiverUsername
 * @param {{receiverUsername: String,
 *          senderUsername: String,
 *          date: Date,
 *          imagePath: String} } notification
 * @returns {Promise<boolean>} true if the operation was completed
 */
async function saveFollowNotification(notification) {

    /*
    notification = {
        receiverUsername: username of the receiver
        senderUsername: User that sent the notification,
        date: Date of the notification
        imagePath: relative path of the image i.e. profilePictures/filename, (of the sender)
    }
 */

    // check if the receiver has 10 notifications already
    const receiver = await retrieveUserByUsername(notification.receiverUsername);

    if (receiver.followNotifications.length === 10) {
        // the user has exactly 10 notifications
        // remove the oldest one i.e. the first one
        const popResult = await db.getDatabase().collection(COLLECTION).updateOne(
            {
                // filter
                _id: receiver._id
            },
            {
                // remove the first element of the array
                $pop: {followNotifications: -1}
            });

        // now add the new notification
        const pushResult = await db.getDatabase().collection(COLLECTION).updateOne(
            {
                _id: receiver._id
            },
            {
                $push: {followNotifications: notification}
            });

        return pushResult.modifiedCount > 0;
    } // end if user has 10 notifications

    // the user has not 10 notifications
    // add the notification
    const pushResult = await db.getDatabase().collection(COLLECTION).updateOne(
        {
            _id: receiver._id
        },
        {
            $push: {followNotifications: notification}
        });

    return pushResult.modifiedCount > 0;


} // here ends the function

/**
 * Saves a chatId to the document of the user
 * @param {ObjectId} userId
 * @param {ObjectId} chatId
 * @returns {Promise<boolean>} true if the chat was saved successfully
 */
async function saveChat(userId, chatId) {
    const result = await db.getDatabase().collection(COLLECTION).updateOne({
        _id: userId
    }, { $push: {chats: chatId}})

    return result.modifiedCount === 1;
}

module.exports = {
    saveUser: saveUser,
    checkUniqueEmail: checkUniqueEmail,
    checkUniqueUsername: checkUniqueUsername,
    retrieveUserByEmail: retrieveUserByEmail,
    retrieveUserByUsername: retrieveUserByUsername,
    hasMatchingPassword: hasMatchingPassword,
    getUser: getUser,
    addPostToUser: addPostToUser,
    getUsers: getUsers,
    followUser: followUser,
    unFollowUser: unFollowUser,
    updateBio: updateBio,
    updateProfilePicture: updateProfilePicture,
    updatePublicStatus: updatePublicStatus,
    saveRequestToFollowUser: saveRequestToFollowUser,
    checkPresentInRequestToFollow: checkPresentInRequestToFollow,
    removeUserFromRequestToFollow: removeUserFromRequestToFollow,
    saveLikeNotification: saveLikeNotification,
    saveCommentNotification: saveCommentNotification,
    saveFollowNotification: saveFollowNotification,
    saveChat: saveChat
}