const ObjectId = require('mongodb').ObjectId;
const userModel = require('../models/user.model');
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
        if (obj.equals(objectIdRequester)) {
            // the user is following
            return true
        }
    }
    return false;
}
module.exports = {
    isFollowed: isFollowed,
    isFollowing: isFollowing
}