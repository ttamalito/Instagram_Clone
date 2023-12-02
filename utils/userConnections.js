/**
 * Object that stores the mapping to all the connections of a given user
 */
class UserConnections {
    constructor() {
        this.connectionsMap = new Map();
        this.serverSentEventConnectionString = 'SSE-Connection';
        this.webSocketConnectionString = 'WS-Connection';
    }


    /**
     * Adds the so far supported types of connections to the map for a given user
     * Please make sure to use both parameters
     * @param {String} userId
     * @param {Express.Response?} serverSentEventConnection
     * @param {ws.WebSocket?} webSocketConnection
     */
    addConnectionsToUser(userId, serverSentEventConnection, webSocketConnection) {
        const connectionsObject = {
            [this.serverSentEventConnectionString]: serverSentEventConnection,
            [this.webSocketConnectionString]: webSocketConnection
        }
        // add the object to the connections map
        this.connectionsMap.set(userId, connectionsObject);
    } // here ends the function

    /**
     * Checks if a given user has a valid ServerSent Event connections
     * @param {String} userId
     * @returns {boolean} true if the user has a valid connection
     */
    userHasServerSentEventConnection(userId) {
        if (!this.connectionsMap.has(userId))
            return false // no connection
        // otherwise there is a connection, check if it is a serversent connection
        const sseConnection = this.connectionsMap.get(userId)[this.serverSentEventConnectionString];
        if (!sseConnection)
            return false // the object is null

        return true;
    } // here ends the method

    /**
     * Adds a websocket connection to a given user
     * @param {String} userId The userId as a String
     * @param {ws.WebSocket} webSocketConnection The underlying webSocket connection
     */
    addWebSocketConnectionForUser(userId, webSocketConnection) {
        // assumes that the user already has a valid connection
        const connectionsObject = this.connectionsMap.get(userId);
        if (!connectionsObject)
            throw new Error(`Trying to add a websocket connection to non existent user`);

        connectionsObject[this.webSocketConnectionString] = webSocketConnection;
        // add it to the map
        this.connectionsMap.set(userId, connectionsObject)
    } // here ends the method

    /**
     * Closes the WebSocketConnection to the user
     * @param userId
     */
    closeWebSocketConnectionForUser(userId) {
        // TODO
    }

    /**
     * Deletes the mapping for a given user
     * @param {String} userId
     */
    deleteConnectionsForUser(userId) {
        const connectionsObject = this.connectionsMap.get(userId);
        if (!connectionsObject)
            throw new Error(`Trying to delete a non existent user`);

        // delete the connection
        this.connectionsMap.delete(userId);
    } // here ends the method

    /**
     * Checks if a user has connections
     * @param {String} userId
     * @returns {boolean} true if the user has a connections object assigned
     */
    hasUserConnections(userId) {
        return this.connectionsMap.has(userId);
    }

    /**
     * Adds a Server-Sent-Event connection to an existing user
     * @param {String} userId
     * @param {Express.Response} sseConnection
     */
    addServerSentEventConnectionToUser(userId, sseConnection) {
        // assumes that the user already has a valid connection
        const connectionsObject = this.connectionsMap.get(userId);
        if (!connectionsObject)
            throw new Error(`Trying to add a SSE connection to non existent user`);

        connectionsObject[this.serverSentEventConnectionString] = sseConnection;
        // add it to the map
        this.connectionsMap.set(userId, connectionsObject)
    } // here ends the method

    /**
     * Number of connections
     * @returns {number} the amount of active connections (in general)
     */
    getAmountOfConnections() {
        return this.connectionsMap.size;
    }

    /**
     * Returns the given SSE connection for the user
     * @param {String} userId
     * @returns {Express.Response} The given SSE connections
     */
    getSSEConnectionForUser(userId) {
        return this.connectionsMap.get(userId)[this.serverSentEventConnectionString];
    }

} // here ends the class


const userConnections = new UserConnections();

module.exports = userConnections;