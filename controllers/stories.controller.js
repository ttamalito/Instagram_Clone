const fs = require('fs');
const path = require('node:path');
const stories = require('../utils/Stories');

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
    const filename = req.get('file-name')
    // path to store the files
    const p = path.join('./data/stories', filename);
    fs.appendFileSync(p, req.body);
    // add the story to the respective data structure
    stories.addStory(filename, req.session.userId);
    res.json({result: true})
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
    postUploadStory: postUploadStory
}