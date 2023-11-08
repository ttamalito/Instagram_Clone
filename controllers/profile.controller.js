const userModel = require('../models/user.model');
const postModel = require('../models/post.model');

/**
 * Displays the user profile
 * @param {Express.Request} req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function getProfile(req, res, next) {
    // first reteive the username from /:username
    const username = req.params.username;
    // get a user if existent
    const user = userModel.retrieveUserByUsername(username);

    // check if existent
    if (!user) {
        // no user
        res.send(`No user ${username}`);
        return;
    }
    // check if the user is following the other user
    // TODO

    // user is there, query the posts
    let posts; // TODO

    // get the profile pic of the user
    const profilePicFileName = user.profilePicture;

    // render the page
    res.send(`Profile Pic: ${profilePicFileName} and ${posts.length} posts`);

}


module.exports = {
    getProfile: getProfile
}