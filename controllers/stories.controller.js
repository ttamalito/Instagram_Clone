/**
 * Simple controller to render the initial page
 * @param req
 * @param res
 */
function getCreateStory(req, res) {
    // the user is already logged in
    // just render the page
    res.render('stories/createStory');
}



module.exports = {
    getCreateStory: getCreateStory
}