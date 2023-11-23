const httpServer = require('http').Server;
const WebSocketServer = require('websocket').server;


/**
 * Configures a WebSocket server with the given http server
 * @param {httpServer} httpServer
 * @returns {WebSocketServer} the websocket instance
 */
function initializeWebSocketServer(httpServer) {
    return new WebSocketServer({
        'httpServer': httpServer
    })
}

/**
 *
 * @param {WebSocketServer} webSocketServer
 */
function addEventsToWebSocket(webSocketServer) {
    webSocketServer.on('request', req => {
        console.log('Someone requested to create a websocket connection');
        let connection = req.accept(null, req.origin);
        connection.on('close', e => console.log('Connection closed'));
        connection.on('message', e => {
            console.log(`We received a message: ${e.utf8Data}`);
        })
        connection.send('Hello from the server using websocket!');
    }) // on request

    webSocketServer.on('connect', connection => {
        console.log('Someone connected!')
        connection.send('Hello from the server using websocket');
    });
} // end of the function

function runWebSocket(httpServer) {
    const webSocketServer = initializeWebSocketServer(httpServer);
    addEventsToWebSocket(webSocketServer);
}

module.exports = runWebSocket;


