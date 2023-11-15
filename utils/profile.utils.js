const ObjectId = require('mongodb').ObjectId;
const userModel = require('../models/user.model');
const LikeCommentEnum = require('./LikeCommentEnum');
/**
 * Checks if userId is part of followers
 * @param {ObjectId[]} followers
 * @param {String} requesterId Id of the requester
 * @returns {boolean} true if userId is part of following array
 */
function isFollowed(followers, requesterId) {

    const objectIdRequester = new ObjectId(requesterId);
    for (let obj of followers) {
        if (obj.equals(objectIdRequester)) {
            // the user is following
            return true
        }
    }
    return false;
}

/**
 * Checks if requesteeId is part of the following Array
 * @param following
 * @param {String} requesteeId
 * @returns {boolean}
 */
function isFollowing(following, requesteeId) {

    const objectIdRequestee = new ObjectId(requesteeId);
    for (let obj of following) {
        if (obj.equals(objectIdRequestee)) {
            // the user is following
            return true
        }
    }
    return false;
}

/**
 * Returns the length of the likes or comments array
 * @param post
 * @param {symbol} indicator
 * @returns {int} The length of the likes or comments array
 */
function getCount(post, indicator) {
    if (indicator === LikeCommentEnum.Like) {
        return post.likes.length;
    } else {
        return post.comments.length;
    }
}

/**
 * Checks if a given user has liked the given post
 * @param post
 * @param {ObjectId} userId
 * @returns {String}
 */
function checkLikedByUser(post, userId) {

    for (const id of post.likes) {
        // check if the userId is part of the array
        if (id.equals(userId)) {
            // the user has liked the picture
            return 'Dislike';
        }

    } // end of loop

    return 'Like';
}

module.exports = {
    isFollowed: isFollowed,
    isFollowing: isFollowing,
    getCount: getCount,
    checkLikedByUser: checkLikedByUser
}