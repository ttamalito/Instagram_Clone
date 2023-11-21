const connectionsMap = require('./connectionsMap');
const userModel = require('../models/user.model');
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
     * Checks if a given user has a current connection
     * @param {String} userId The id of the user
     * @returns {boolean} true if the user has a server-sent-connection
     */
    userHasConnection(userId) {
        return connectionsMap.has(userId);
    }

    /**
     * Sends a notification to the user with the given id
     * It is assumed that the user has a connection
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

        const connection = connectionsMap.get(receiverId);
        if(!connection) {
            // the user has no connection, this is not supposed to happen
            throw new Error('line 39 utils.Notification');
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
                    throw new Error(`line 68 utils/Notification--Notification couldnt be saved`)
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
        if (!connectionsMap.has(receiverId)) {
            throw new Error(`User has no connection-- line 89 utils/Notification`)
        }

        // get the connection and send the notification
        const connection = connectionsMap.get(receiverId);

        connection.write('event: ' + 'follow_request\n');
        connection.write('data: ' + 'Received a follow request' + '\n\n');

        return true;
    } // here ends the method

    /**
     * Sends a notification to the receiver that a user started following him
     * Assumes that the receiver has a connection
     * @param {String} receiverId
     * @returns {boolean}
     */
    sendReceivedFollowNotification(receiverId) {

        // check correct type of notification
        if (!this.#checkCorrectTypeOfNotification(typesOfNotificationEnum.NEW_FOLLOWER)) {
            // throw an error
            throw new Error(`Not correct type of notification-- line 112 utils/Notification`);
        }

        // check that user has a connection
        if (!this.userHasConnection(receiverId)) {
            // no connection
            throw new Error(`No connection for user -- line 118 utils/Notification`);
        }

        // send the notification
        const connection = connectionsMap.get(receiverId);
        connection.write('event: ' + 'new_follower\n');
        connection.write('data: ' + 'You have a new follower\n\n');
        return true;
    }

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
            throw new Error(`Not the correct type of notification- line 131 utils/Notifications`);
        }
        // user should have a connection
        if (!this.userHasConnection(receiverId)) {
            throw new Error(`user should have a connection - line 135 utils/Notifications`);
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
                    const connection = connectionsMap.get(receiverId);
                    connection.write('event: ' + 'comment\n');
                    connection.write('data: ' + 'You received a comment\n\n');
                } else {
                    // notification was not saved
                    throw new Error(`Comment notification not saved--line 157 utils/Notification`);
                }
            }
        ).catch( err => {console.log(err)})
        return true;
    } // here ends sendCommentNotification

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
    NEW_FOLLOWER: Symbol('NEW_FOLLOWER')
}

module.exports = {
    Notification: Notification,
    typesOfNotificationEnum: typesOfNotificationEnum
}