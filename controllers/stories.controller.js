const fs = require('fs');
const path = require('node:path');
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
    console.log(typeof req.body)
    // console.log(req.get('file-name'));
    const p = path.join('./data/stories', req.get('file-name'));
    console.log(p)
    fs.appendFileSync(p, req.body);
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