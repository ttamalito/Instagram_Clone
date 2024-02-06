
const {checkLoggedIn} = require("../utils/checkLoggedIn");
const fs = require('fs');
const path = require('path');
const readline = require("readline");
const userConnections = require('../utils/userConnections');


/**
 * Sends the necessary data to render the Home page
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function base(req, res, next) {
    console.log(req.headers)
    //console.log(req.session.id);
    //printSongsForSophia(89, 3, 40, 74, 8, 150, 150, 150, 150, 150)
    //const file = fs.readFileSync(filePath, 'utf8');
    //console.log(file)
    // TODO - Add logic to send if the user is logged in
    res.json({username: 'jose',
        loggedIn: false
    })

}

/**
 * Checks that the user is logged in, if so it will save the connection to the
 * corresponding data structure, so that it can communicate with the client
 * @param req
 * @param {Express.Response} res
 * @param next
 */
function saveConnection(req, res, next) {
    // console.log(`base.controller line 24: We want to save a connection`)
    // console.log(`base.controller line 25: MAP size: ${connectionsMap.size}`)
    // check that the user is logged in
    if (!checkLoggedIn(req)) {
        // do not do anything
        return;
    }

    // now check the origin of the request
    const url = res.req.url;
    // console.log(url)
    if (url !== '/open-connection') {
        // he is trying to do something sketchy
        return;
    }

    // the userId
    const userId = req.session.userId;

    // now supposedly all good
    // change the headers of the response
    res.setHeader('Content-Type', 'text/event-stream');
    // send a confirmation
    const test = {
        hello: 'The server established connection with the client',
        marica: 'Mka'
    }
    const jsonTest = JSON.stringify(test);
    res.write('event: ' + 'testing\n');
    res.write('data: '+ jsonTest +  '\n\n');
    // save the response object
    // add it to the mapping
    // check if the user has already a connection...
    if (userConnections.hasUserConnections(userId)) {
        // the user has a connection already
        // override the serversent event connection
        userConnections.addServerSentEventConnectionToUser(userId, res);
    } else {
        // no connection, so create a completely new one
        userConnections.addConnectionsToUser(userId, res, null);
    }
} // here ends SaveConnection

function send(res) {
    res.write('data: ' + 'hello!\n\n');

    setTimeout(() => {send(res)}, 10000);
}

/**
 * Size of the file 114 (o to 113)
 * @param {number} one
 * @param {number} two
 * @param {number} three
 * @param {number} four
 * @param {number} five
 * @param {number} six
 * @param {number} seven
 * @param {number} eight
 * @param {number} nine
 * @param {number} ten
 * @returns {Promise<void>}
 */
async function printSongsForSophia(one, two,
                                   three,
                                   four,
                                   five,
                                   six,
                                   seven,
                                   eight,
                                   nine,
                                   ten) {
    const filePath = path.join(__dirname, 'songs_for_anna_sophia.txt');
    const fileStream = fs.createReadStream(filePath)
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    let accu = 0;
    // size of the file = 129
    for await (const line of rl) {

        if (accu === one
            || accu === two
            || accu === three
            || accu === four
            || accu === five
            || accu === six
            || accu === seven
            || accu === eight
            || accu === nine
            || accu === ten) {
            console.log(`${accu} : ${line}`);
        }
        accu++
    }
    console.log(accu);
}


module.exports = {
    base: base,
    saveConnection: saveConnection
}