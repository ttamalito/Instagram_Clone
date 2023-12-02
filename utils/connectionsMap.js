/**
 * @typedef {Object} ConnectionObject
 * @property {Express.Response} serverSentEvent
 * @property {WebSocket} webSocketConnection
 */


/**
 * Stores the connections of each user, using a map
 * @type {Map<String, ConnectionObject>}
 */
const connectionsMap= new Map();


module.exports = connectionsMap;