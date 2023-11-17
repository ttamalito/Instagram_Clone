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

    return result.insertedIdñ

} // here ends saveComment


module.exports = {
    saveComment: saveComment
}