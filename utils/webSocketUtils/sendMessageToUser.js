const messageModel = require('../../models/message.model');
const userConnections = require('../userConnections');
const chatModel = require('../../models/chat.model');
const {Notification, typesOfNotificationEnum} = require('../Notification');
const {ObjectId} = require("mongodb");

/**
 * Saves a message to the database and sends it to the user
 * if he has an active WebSocket connection, otherwise
 * sends a ServerSentEvent Notification
 * @param {WebSocketMessage} message The message object
 *
 */
function sendMessage(message) {

    // save the message to the database
    saveMessageToDataBase(message).then(res => {
        // it was saved successfully
        // send the message if the user has an active websocket connection
        if (!userConnections.hasActiveWebSocketConnection(message.messageTo)) {
            // no active webSocket connection
            // send a server sent event notification
            const notification = new Notification(typesOfNotificationEnum.MESSAGE, message.messageFrom, message.messageTo);
            notification.sendMessageNotification(message).then().catch(err => console.error(err));
        } else {
            // user has connection
            // send the message
            const webSocket = userConnections.getWebSocketConnection(message.messageTo);
            // make it a JSON object
            const jsonStringMessage = JSON.stringify(message);
            webSocket.send(jsonStringMessage); // send the complete WebSocketMessage
            /*
            messageFrom: String – id of the user
            messageTo: String – id of the user
            chatId: String – Id of the chat
            content: String – content of the message
             */
        } // here ends the else
    }).catch(error => {throw new Error(`Could not save message to the database`)})

} // here ends saveMessage

/**
 * Saves a message to the database asynchrousnously
 * @param {WebSocketMessage} message The message object
 * @return {Promise<Boolean>} true if the message was saved successfully
 */
async function saveMessageToDataBase(message) {
    const messageFromObjectId = new ObjectId(message.messageFrom);
    const messageToObjectId = new ObjectId(message.messageTo);
    const chatIdObjectId = new ObjectId(message.chatId);
    const params = {
        messageFrom: messageFromObjectId,
        messageTo: messageToObjectId,
        date: new Date().toISOString(),
        content: message.content
    }
    return await chatModel.addMessageToChat(params, chatIdObjectId);
} // here ends saeMessageToDataBase

/**
 * @typedef {Object} WebSocketMessage
 * @property {String} messageFrom id of the user
 * @property {String} messageTo id of the user
 * @property {String} chatId
 * @property {String} content
 */

module.exports = sendMessage;