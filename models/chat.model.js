const db = require('../database/databaseConfig');
const ObjectId = require('mongodb').ObjectId;

const messageModel = require('./message.model');

const COLLECTION = 'chats';

/**
 * Saves a new chat to the database, with the given attributes
 * @param {{
 *     users: [ObjectId],
 *     groupChat: {
 *          isGroupChat: Boolean,
 *          owner: ObjectId?,
 *          groupPictureFileName: String
 *     }
 * }} params Parameters to save a new chat
 * @returns {Promise<ObjectId>}
 */
async function saveNewChat(params) {

    const result = await db.getDatabase().collection(COLLECTION).insertOne({
        users: params.users,
        groupChat: params.groupChat,
        messages: [],
        media: []
    })

    if (!result.acknowledged) {
        // not acknowleged for some reason
        return false;
    }

    return result.insertedId
} // here ends the function

/**
 * Retrieves a chat with the given id
 * @param {ObjectId} chatId
 * @returns {Promise<Chat>} The Chat object, if found
 */
async function getChat(chatId) {
    return await db.getDatabase().collection(COLLECTION).findOne({
        _id: chatId
    })
} // here ends the function

/**
 * Adds a new message to the given chat
 * @param {{
 *     messageFrom: ObjectId,
 *     messageTo: ObjectId,
 *     date: String,
 *     content: String
 * }} messageData
 * @param {ObjectId} chatId
 * @returns {Promise<Boolean>} true if the message was added successfully
 */
async function addMessageToChat(messageData, chatId) {
    // check that there is a chat with that id
    const chat = await getChat(chatId);
    if (!chat) {
        // there is no chat
        return false;
    }

    // save the message to the database
    const messageId = await messageModel.saveNewMessage(messageData);

    // save the messageId to the given chat
    const result = await db.getDatabase().collection(COLLECTION).updateOne({
        _id: chatId
    }, {
        $push: {messages: messageId}
    })

    return result.modifiedCount === 1;
} // here ends the function

/**
 * Retrieves all the chats to which a given user belongs
 * @param {ObjectId} userId
 * @returns {Promise<[Chat]>} The array of chats
 */
async function getChatsForUser(userId) {
    const result = await db.getDatabase().collection(COLLECTION).find({
        users: { $in: [userId]}
    })
    return result.toArray();
}

/**
 * @typedef {Object} Chat
 * @property {ObjectId} _id
 * @property {[ObjectId]} users
 * @property {{
 *         isGroupChat: Boolean,
 *         owner: ObjectId?,
 *         groupPictureFileName: String
 * }} groupChat
 * @property {[ObjectId]} messages
 * @property {[String]} media
 */



module.exports = {
    saveNewChat: saveNewChat,
    getChat: getChat,
    addMessageToChat: addMessageToChat,
    getChatsForUser: getChatsForUser
}