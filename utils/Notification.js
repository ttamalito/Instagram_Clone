const connectionsMap = require('./connectionsMap');
const userModel = require('../models/user.model');
const userConnections = require('../utils/userConnections');
const {ObjectId} = require("mongodb");

/**
 * Class that encapsulates the logic to send and store notifications
 */
class Notification {

    /**
     *
     * @param {typesOfNotificationEnum} notificationType
     * @param {String} sender The username
     * @param {String} receiver The username
     */
    constructor(notificationType, sender, receiver) {
        this.notificationType = notificationType;
        this.sender = sender;
        this.receiver = receiver;
    } // here ends the constructor

    /**
     * Checks if a given user has a current SSE connection
     * @param {String} userId The id of the user
     * @returns {boolean} true if the user has a server-sent-connection
     */
    userHasConnection(userId) {
        return userConnections.userHasServerSentEventConnection(userId);
    }

    /**
     * Sends a notification to the user with the given id
     * It is assumed that the user has a SSE connection
     * @param {String} receiverId The id of the receiver
     * @param post The post object that received the like
     * @throws {Error} if the receiverId has no connection
     * @returns {boolean}
     */
    sendLikeNotification(receiverId, post) {
        // check that the notification is of type like
        if (typesOfNotificationEnum.LIKE !== this.notificationType) {
            throw new Error('line 39 utils/Notification - Trying to send a forbidden like notification');
        }

        const connection = userConnections.getSSEConnectionForUser(receiverId);
        if(!connection) {
            // the user has no connection, this is not supposed to happen
            throw new Error('line 48 utils.Notification');
        }

        // now send the like notification
        const data = {
            receiverUsername: this.receiver,
            senderUsername: this.sender,
            date: new Date().toISOString(),
            postId: post._id,
            imagePath: post.imagePath,
        }

        // save the notification to the database and send it
        userModel.saveLikeNotification(data).then(
            res => {
                if (res) {
                    // the notification was saved
                    // send the notification
                    connection.write('event: like\n');
                    connection.write('data: ' + 'You received a like!'+ '\n\n');
                } else {
                    // it wasnt saved for some reason
                    throw new Error(`line 70 utils/Notification--Notification couldnt be saved`)
                }
            }
        ).catch( err => {console.log(err)})
        return true
    } // here ends sendLikeNotification

    /**
     * Sends the receiver a notification that he received a follow_request
     * It assumes that the user already has a connection
     * @param {String} receiverId
     * @returns {boolean} true if the notification was sent
     */
    sendFollowRequestNotification(receiverId) {
        // check the correct type of notification
        if (this.notificationType !== typesOfNotificationEnum.FOLLOW_REQUEST) {
            // not the correct type
            throw new Error(`Impossible to send follow request notification- line 85 utils/Notification`);
        }
        // make sure that the receiver has a connection
        if (!userConnections.userHasServerSentEventConnection(receiverId)) {
            throw new Error(`User has no connection-- line 91 utils/Notification`)
        }

        // get the connection and send the notification
        const connection = userConnections.getSSEConnectionForUser(receiverId);

        connection.write('event: ' + 'follow_request\n');
        connection.write('data: ' + 'Received a follow request' + '\n\n');

        return true;
    } // here ends the method

    /**
     * Sends a notification to the receiver that a user started following him
     * Assumes that the receiver has a connection
     * It saves the notification to the document of the receiver
     * @param {String} receiverId
     * @param {String} imagePath path of the profile picture of the sender
     * @returns {boolean} true if the notification was sent
     */
    sendReceivedFollowNotification(receiverId, imagePath) {

        // check correct type of notification
        if (!this.#checkCorrectTypeOfNotification(typesOfNotificationEnum.NEW_FOLLOWER)) {
            // throw an error
            throw new Error(`Not correct type of notification-- line 112 utils/Notification`);
        }


        const data = {
            receiverUsername: this.receiver,
            senderUsername: this.sender,
            date: new Date().toISOString(),
            imagePath: imagePath
        }

        // save the notification
        userModel.saveFollowNotification(data).then( res => {
            if (res) {
                // it was saved successfully
                // check that user has a connection
                if (this.userHasConnection(receiverId)) {
                    // send the notification
                    const connection = userConnections.getSSEConnectionForUser(receiverId);
                    connection.write('event: ' + 'new_follower\n');
                    connection.write('data: ' + 'You have a new follower' + `${this.sender}\n\n`);
                }
                return true;

            } else {
                return false;
            }
        }).catch( err => {console.log(err); return false;})

    } // here ends sendReceivedFollowNotification

    /**
     * Sends a notification to the receiver that he received a comment
     * Saves the notification to the database
     * @param {String} receiverId
     * @param comment The comment object from the database
     * @param post The post object from the database
     * @returns {boolean} true if the notification was saved and sent
     */
    sendCommentNotification(receiverId, comment, post) {
        // check the correct type of notification
        if (!this.#checkCorrectTypeOfNotification(typesOfNotificationEnum.COMMENT)) {
            throw new Error(`Not the correct type of notification- line 139 utils/Notifications`);
        }
        // user should have a connection
        if (!this.userHasConnection(receiverId)) {
            throw new Error(`user should have a connection - line 143 utils/Notifications`);
        }

        // save the data to the corresponding docuemnt in the database
        const data = {
            receiverUsername: this.receiver,
            senderUsername: this.sender,
            postId: post._id,
            commentId: comment._id,
            date: new Date().toISOString(),
            imagePath: post.imagePath
        }

        userModel.saveCommentNotification(data).then(
            res => {
                if (res) {
                    // notification was save
                    const connection = userConnections.getSSEConnectionForUser(receiverId);
                    connection.write('event: ' + 'comment\n');
                    connection.write('data: ' + 'You received a comment\n\n');
                } else {
                    // notification was not saved
                    throw new Error(`Comment notification not saved--line 165 utils/Notification`);
                }
            }
        ).catch( err => {console.log(err)})
        return true;
    } // here ends sendCommentNotification


    /**
     * Sends a notification to the receiver (messageTo)
     * Saves the notification to the database (UserModel)
     * Checks that it is the correct type of notification,
     * If the user has no active server sent event connection then, it just save the notification to the database
     * @param {WebSocketMessage} webSocketMessage
     */
    async sendMessageNotification(webSocketMessage) {
        // check that it is the correct type of notification
        if (!this.#checkCorrectTypeOfNotification(typesOfNotificationEnum.MESSAGE)) {
            // not the correct type
            throw new Error(`Trying to save a message notification with incorrect type`);
        }

        const messageToObjectId = new ObjectId(webSocketMessage.messageTo);

        const user = await userModel.getUser(new ObjectId(webSocketMessage.messageFrom));
        const messageFromUsername = user.username;

        const data = {
            messageFromUsername: messageFromUsername,
            messageFrom: new ObjectId(webSocketMessage.messageFrom),
            date: new Date().toISOString(),
            content: webSocketMessage.content,
            chatId: new ObjectId(webSocketMessage.chatId)
        }

            // save the data
            userModel.saveChatNotification(messageToObjectId, data).then( res => {
                if (res) {
                    // the notification was saved successfully
                    // check if the user has a SSE connection
                    if (this.userHasConnection(webSocketMessage.messageTo)) {
                        // get the connection
                        const connection = userConnections.getSSEConnectionForUser(webSocketMessage.messageTo);
                        connection.write('event: ' + 'message\n');
                        connection.write('data: ' + JSON.stringify(data) + '\n\n')
                    }

                } else {
                    // the notification could not be saved
                    throw new Error(`Message Notification could not be saved!`);
                }
            }).catch(err => console.error(err));

    } // here ends the method sendMessageNotification

    /**
     * Checks if the notification type of the notification is of the correct type
     * @param {typesOfNotificationEnum} notificationType
     * @returns {boolean} true if they match
     */
    #checkCorrectTypeOfNotification(notificationType) {
        return notificationType === this.notificationType;
    }





} // here ends the class


const typesOfNotificationEnum = {
    LIKE: Symbol('LIKE'),
    COMMENT: Symbol('COMMENT'),
    FOLLOW_REQUEST: Symbol('FOLLOW_REQUEST'),
    NEW_FOLLOWER: Symbol('NEW_FOLLOWER'),
    MESSAGE: Symbol('MESSAGE')
}

module.exports = {
    Notification: Notification,
    typesOfNotificationEnum: typesOfNotificationEnum
}