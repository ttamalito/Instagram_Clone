const ObjectId = require('mongodb').ObjectId;
const db = require('../database/databaseConfig');
const COLLECTION = 'comments';

/**
 * Saves a comment to the database
 * @param {ObjectId} owner
 * @param {ObjectId} post
 * @param {String} text
 * @returns {Promise<ObjectId>}
 */
async function saveComment(owner, post, text) {
    // the date
    const date = new Date().toISOString();
    // save the comment
    const result = await db.getDatabase().collection(COLLECTION).insertOne({
        // what to insert
        userId: owner,
        postId: post,
        comment: text,
        dateCreated: date,
        likes: []
    });

    return result.insertedId;

} // here ends saveComment

/**
 * Deletes a comment from the database with the given commentId
 * @param {ObjectId} commentId Id of the comment
 * @returns {Promise<boolean>} true if the comment was deleted
 */
async function deleteComment(commentId) {
    const result = await db.getDatabase().collection(COLLECTION).deleteOne({
        _id: commentId
    });
    return result.deletedCount === 1;
} // here ends the function

/**
 * Yields a comment with the given commentId
 * @param {ObjectId} commentId id of the comment
 * @returns {Promise<*>}
 */
async function getComment(commentId) {
    return await db.getDatabase().collection(COLLECTION).findOne({_id: commentId})
} // here ends the function


module.exports = {
    saveComment: saveComment,
    deleteComment: deleteComment,
    getComment: getComment
}