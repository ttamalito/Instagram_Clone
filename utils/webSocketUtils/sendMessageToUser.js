const messageModel = require('../../models/message.model');
const userConnections = require('../userConnections');
const chatModel = require('../../models/chat.model');
const {Notification, typesOfNotificationEnum} = require('../Notification');

/**
 * Saves a message to the database and sends it to the user
 * if he has an active WebSocket connection, otherwise
 * sends a ServerSentEvent Notification
 * @param {WebSocketMessage} message The message object
 *
 */
function sendMessage(message) {

    // check if the other user has an active WebSocketConnection
    if (!userConnections.hasActiveWebSocketConnection(message.messageTo)) {
        // no active webSocket connection
        // send a server sent event notification
        // TODO
        //const notification = new Notification(typesOfNotificationEnum.MESSAGE, message.messageFrom, message.messageTo);
    } else {
        // user has connection
        // send the message
        const webSocket = userConnections.getWebSocketConnection(message.messageTo);
        console.log('We are going to send a message-- line 25 saendMessageTouser')
        webSocket.send(message.content);
    }
}

/**
 * @typedef {Object} WebSocketMessage
 * @property {String} messageFrom
 * @property {String} messageTo
 * @property {String} chatId
 * @property {String} content
 */

module.exports = sendMessage;