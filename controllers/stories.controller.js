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

async function getStoriesForUser(req, res, next) {

    // get the username and fetch the stories
    const result = await userModel.getStoriesForUser(new ObjectId(req.session.userId));
    const {_id, stories} = result;
    // send them as a response
    res.json({stories: stories});
} // ends getStoriesForUser


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
    getStoriesForUser: getStoriesForUser
}