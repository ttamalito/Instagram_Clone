const db = require('../database/databaseConfig');
const ObjectId = require('mongodb').ObjectId

const COLLECTION = 'messages';

/**
 * Saves a new message to the database asynchrounosly
 * @param {{
 *     messageFrom: ObjectId,
 *     messageTo: ObjectId,
 *     date: String,
 *     content: String
 * }} params Attributes of the newly to be created document
 * @returns {Promise<ObjectId>}
 */
async function saveNewMessage(params) {
    // the length of the content string was validated beforehand
    const result = await db.getDatabase().collection(COLLECTION).insertOne({
        messageFrom: params.messageFrom,
        messageTo: params.messageTo,
        date: params.date,
        content: params.content,
        likes: []
    });

    return result.insertedId;
}



module.exports = {
    saveNewMessage: saveNewMessage
}