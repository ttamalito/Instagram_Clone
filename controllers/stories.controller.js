const fs = require('fs');
const path = require('node:path');
const stories = require('../utils/Stories');
const userModel = require('../models/user.model')
const {ObjectId} = require("mongodb");

/**
 * Simple controller to render the initial page
 * @param req
 * @param res
 */
function getCreateStory(req, res) {

    // print the headers
    // console.log((req.headers));
    // the user is already logged in
    // just render the page
    res.render('stories/createStory');
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
 * Simple controller to fetch the stories of a given user that is authenticated
 * @param req
 * @param res
 * @param next
 * @return {Promise<void>}
 */
async function getStoriesForUser(req, res, next) {

    // get the username and fetch the stories
    const result = await userModel.getStoriesForUser(new ObjectId(req.params.userId));
    const {_id, stories} = result;
    // send them as a response
    res.json({stories: stories});
} // ends getStoriesForUser


async function displayStory(req, res, next) {
    // get the user that is the owner of the stories
    const owner = req.params.username;
    // get the filename
    const filename = req.params.filename;
    // get the sequence (to see if there are more stories)
    const sequenceNumber = req.params.sequence;
    // retrieve the file from disk, by creating a ReadableStream
    const pathOfFile = path.join('./data/stories', filename);
    const readStream = fs.createReadStream(pathOfFile, {highWaterMark: 128*1024}); // 128Kb
    readStream.on('close', () => {
        console.log(`Stream Closed`);
        console.log(`We read ${readStream.bytesRead} bytes`);
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
        console.log(`There are ${chunk.byteLength} bytes ready to be read`)
        // pause the stream for 5 milliseconds
        readStream.pause();

        setTimeout(() => {
            readStream.resume()
            console.log(`Amount of bytes ready to be read: ${readStream.readableLength}`);
        }, 5000)
    });
    res.end()
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
    displayStory:displayStory
}