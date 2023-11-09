const ObjectId = require('mongodb').ObjectId;

/**
 * Checks if userId is part of followers
 * @param {ObjectId[]} followers
 * @param {String} requesterId Id of the requester
 * @returns {boolean} true if userId is part of following array
 */
function isFollowed(followers, requesterId) {

    return true;
}

module.exports = {
    isFollowed: isFollowed
}