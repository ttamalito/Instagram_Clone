const WebSocketServer = require('ws').WebSocketServer;
const http = require('http');

const extractUserIdFromUrl = require('../utils/webSocketUtils/extractUserIdFromUrl.utils')
const sendMessage = require('../utils/webSocketUtils/sendMessageToUser')
// map that stores the webSocketConnections
const userConnections = require('../utils/userConnections');

/**
 *
 * @param {http.Server} httpServer
 */
function initiateWebSocketServer(httpServer) {
    const wss = new WebSocketServer({
        server: httpServer
    }) // here ends the constructor

    // add some events
   wss.on('connection', (ws, req) => {
            // console.log('we received a connection');
            // console.log(wss.clients.size);
            console.log(req.url)
            // get the userId
            const userId = extractUserIdFromUrl(req.url);



            // add an event listener to the TCP Socket
            req.socket.on('data', data => {console.log(
                `We received some data!!! on this socket`
            )})
            req.socket.on('ready', e => {
                console.log(`SOcket is ready`)
            })


            // add the message event listener to the socket
            addMessageEventListenerToWebSocket(ws);
            ws.send('Hello from the server!')
            // add the webSocket to the connections map
            if (userConnections.hasUserConnections(userId)) {
                // he already has a connection
                userConnections.addWebSocketConnectionForUser(userId, ws);
            } else {
                // the user has no active connections
                // create a new one
                userConnections.addConnectionsToUser(userId, null, ws);
            }
            //console.log(ws)
        } // here ends the listener
    )// here ends the connection event

    wss.on('listening', () => {
        console.log(`WebSocket server up and running on Port ${wss.address().port}`)
    })
} // here ends initiateWebSocketServer


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
        console.log(message)
        // send the message
        sendMessage(message);
    })
}


module.exports = initiateWebSocketServer;