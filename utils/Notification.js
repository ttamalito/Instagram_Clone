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