const WebSocketServer = require('ws').WebSocketServer;
const http = require('http');

const extractUserIdFromUrl = require('../utils/webSocketUtils/extractUserIdFromUrl.utils')


// this will most definitely change
const connections = require('../utils/WebSocketConnections.utils');

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
            console.log(extractUserIdFromUrl(req.url));
            // add an event listener to the TCP Socket
            req.socket.on('data', data => {console.log(
                `We received some data!!! on this socket`
            )})
            req.socket.on('ready', e => {
                console.log(`SOcket is ready`)
            })
            ws.send('Hello from the server!')
            connections.add(ws);
            //console.log(ws)
        } // here ends the listener
    )// here ends the connection event

    wss.on('listening', () => {
        console.log(`WebSocket server up and running on Port ${wss.address().port}`)
    })
} // here ends initiateWebSocketServer



module.exports = initiateWebSocketServer;