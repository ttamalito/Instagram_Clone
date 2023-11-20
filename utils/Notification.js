const connectionsMap = require('./connectionsMap');

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
     * @param {String} userId
     * @returns {boolean} true if the user has a server-sent-connection
     */
    userHasConnection(userId) {
        return connectionsMap.has(userId);
    }

    /**
     * Sends a notification to the user with the given id
     * It is assumed that the user has a connection
     * @param {String} receiverId
     * @throws {Error} if the receiverId has no connection
     * @returns {boolean}
     */
    sendLikeNotification(receiverId) {
        const connection = connectionsMap.get(receiverId);
        if(!connection) {
            // the user has no connection, this is not supposed to happen
            throw new Error('line 39 utils.Notification');
        }

        // now send the like notification
        const data = {
            username: this.sender,
            date: new Date().toISOString()
        }
        const jsonData = JSON.stringify(data);
        // send the notification
        connection.write('event: like\n');
        connection.write('data: ' + jsonData + '\n\n');
        return true
    } // here ends sendLikeNotification


}


const typesOfNotificationEnum = {
    LIKE: Symbol('LIKE'),
    COMMENT: Symbol('COMMENT'),
    FOLLOW_REQUEST: Symbol('FOLLOW_REQUEST'),
    NEW_FOLLOWER: Symbol('NEW_FOLLOWER')
}

module.exports = Notification;