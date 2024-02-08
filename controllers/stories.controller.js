const fs = require('fs');
const path = require('node:path');
const stories = require('../utils/Stories');
const userModel = require('../models/user.model')
const {ObjectId} = require("mongodb");
const userConnections = require('../utils/userConnections');


/**
 * Simple controller to sends the corresponding csrf token
 * @param {Express.Request} req
 * @param res
 */
function getCreateStory(req, res) {
    // return a csrf token
    return res.json({
        result: true,
        csrf: req.csrfToken()
    })
}

async function postUploadStory(req, res) {
    // log the headers
    // console.log(req.headers);
    // console.log(req.body);
    // type of file
    const mimeType = req.get('mime-type');
    const filename = req.get('file-name');
    // path to store the files
    const p = path.join('./data/stories', filename);
    fs.appendFileSync(p, req.body);
    // add the story to the respective data structure
    stories.addStory(filename, req.session.userId, mimeType);
    res.json({result: true})
}

/**
 * Options controller to accept the post request
 * Destroys the session that the options request created
 * @param req
 * @param res
 */
function optionsUploadStory(req, res) {
    // allow the custom headers
    res.append('Access-Control-Allow-Headers', 'mime-type, content-type, file-name, content-length');
    // all good
    // delete the session
    if (!req.session.userId) {
        req.session.destroy(() => {
            res.status(204).end();
        })
    }

}

/**
 * Simple controller to fetch the stories of a given user that is authenticated
 * This should be the initial point to see if a user has stories
 * @param req
 * @param res
 * @param next
 * @return {Promise<void>}
 */
async function getStoriesForUser(req, res, next) {

    // get the user
    const user = await userModel.retrieveUserByUsername(req.params.username);

    // get the username and fetch the stories
    const result = await userModel.getStoriesForUser(user._id);
    const {_id, stories} = result;
    // send them as a response
    res.json({
        result: true,
        stories: stories
    });
} // ends getStoriesForUser


async function displayStory(req, res, next) {
    // get the user that is the owner of the stories
    const owner = req.params.username;
    // get the filename
    const filename = req.params.filename;
    // get the sequence (to see if there are more stories)
    const sequenceNumber = req.params.sequence;
    res.attachment(filename);
    // res.render('stories/story', {username: owner, filename:filename, sequenceNumber: sequenceNumber });
    // retrieve the file from disk, by creating a ReadableStream
    const pathOfFile = path.join('./data/stories', filename);
    const readStream = fs.createReadStream(pathOfFile, {highWaterMark: 128*1024}); // 128Kb
    readStream.on('close', () => {
        console.log(`Stream Closed`);
        console.log(`We read ${readStream.bytesRead} bytes`);
        // close the response
        res.end();
    });
    let n = 1;
    let i;
    readStream.on('open', fd => {console.log(`file descriptor ${fd}`)});
    readStream.on('ready', () => {console.log(`We are ready to read the file`)});
    readStream.on('data', chunk => {
        if (n === 1){
            // it is the first event
            i = Date.now();
            n = 4;
        } else {
            const m = Date.now() - i;
            i = Date.now();
            console.log(`${m} milliseconds difference bewtween events`);
        }
        console.log(` We sent ${chunk.byteLength} bytes`)
        // send the raw bytes
        //const connection = userConnections.getSSEConnectionForUser(req.session.userId);
        //connection.write(chunk, callback=() => {console.log('Chunk was flushed (I dont know what is)')});
        res.write(chunk);
        // pause the stream for 1 second
        readStream.pause();

        setTimeout(() => {
            readStream.resume()
            console.log(`Amount of bytes ready to be read: ${readStream.readableLength}`);
        }, 0)
    });
    // res.end('Hello World');
}


function renderStory(req, res) {
    // user is already authenticated
    // get the user that is the owner of the stories
    const owner = req.params.username;
    // get the filename
    const filename = req.params.filename;
    // get the sequence (to see if there are more stories)
    const sequenceNumber = req.params.sequence;

    res.render('stories/story', {username: owner, filename:filename, sequenceNumber: sequenceNumber });
}

/**
 * Simple Controller to fetch all the stories
 * @param req
 * @param res
 * @return {Promise<void>}
 */
async function getMoreStories(req, res) {
    // get the username
    const username = req.params.username;

    // get a corresponding user
    const user = await userModel.retrieveUserByUsername(username);

    // check if null
    if (!user) {
        res.status(404).end();
        return;
    }

    // else the user exists, fetch the amount of stories
    const stories = user.stories;
    res.json({stories: stories});
}

/*
function whatever (args) {
    // code to execute

    setTimeout(() => whatever(args), 1000);
    }
    This function will run forever, every second
 */


module.exports = {
    getCreateStory: getCreateStory,
    postUploadStory: postUploadStory,
    getStoriesForUser: getStoriesForUser,
    displayStory:displayStory,
    renderStory: renderStory,
    getMoreStories: getMoreStories,
    optionsUploadStory: optionsUploadStory
}