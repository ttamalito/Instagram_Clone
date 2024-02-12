const WebSocketServer = require('ws').WebSocketServer;
const http = require('http');

const extractUserNameFromUrl = require('../utils/webSocketUtils/extractUserIdFromUrl.utils')
const sendMessage = require('../utils/webSocketUtils/sendMessageToUser')
// map that stores the webSocketConnections
const userConnections = require('../utils/userConnections');

const userModel = require('../models/user.model');

/**
 * Initiates the websocket server and
 * adds an event to the websocket server when a connection is established and when the server is already listening
 * @param {http.Server} httpServer
 */
function initiateWebSocketServer(httpServer) {
    const wss = new WebSocketServer({
        server: httpServer
    }) // here ends the constructor

    // add some events
   wss.on('connection', (ws, req) => {
            console.log(req.url)

            userModel.retrieveUserByUsername(extractUserNameFromUrl(req.url)).then(
                user => {
                    // check if it exists
                    if (!user) {
                        ws.terminate();
                        return;
                    }
                    // it exists, then add the ws to the user connections
                    const userId = user._id.toString();
                    // add the webSocket to the connections map
                    if (userConnections.hasUserConnections(userId)) {
                        // he already has a connection
                        userConnections.addWebSocketConnectionForUser(userId, ws);
                    } else {
                        // the user has no active connections
                        // create a new one
                        userConnections.addConnectionsToUser(userId, null, ws);
                    }
                }
            ) // end of then



            // add an event listener to the TCP Socket
            req.socket.on('data', data => {console.log(
                `We received some data!!! on this socket`
            )})
            req.socket.on('ready', e => {
                console.log(`SOcket is ready`)
            })


            // add the message event listener to the socket
            addMessageEventListenerToWebSocket(ws);

        } // here ends the listener for establshing a new connection to the websocket server
    )// here ends the connection event

    wss.on('listening', () => {
        console.log(`WebSocket server up and running on Port ${wss.address().port}`)
    }) // here ends the event on listening


} // here ends initiateWebSocketServer (function)


/**
 * Adds the logic to handle incoming messages from a webSocket connection
 * @param {ws.WebSocket} ws The WebSocket
 */
function addMessageEventListenerToWebSocket(ws) {
    ws.on('message', (data, isBinary) => {
        console.log(`We received a message`);
        const messageString = data.toString()
        // make it an object
        const message = JSON.parse(messageString);
        // get the username and find the corrsponding id
        userModel.retrieveUserByUsername(message.messageFromUsername).then(user => {
            // add the id
            if (!user)
                throw new Error(`User sending the message does not exist`)
            message.messageFrom = user._id.toString();
            console.log(message)
            // send the message with the utils
            sendMessage(message);
        })

    }) // end of listner
} // end of function


module.exports = initiateWebSocketServer;